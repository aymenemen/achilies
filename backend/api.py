"""
NOOR Ouarzazate CSP — Live DNI Forecast API
=============================================

Research demo backend for solar irradiance forecasting at the
NOOR Ouarzazate concentrated solar power complex (Morocco).

Site parameters:
  - Latitude:  31.0091°N
  - Longitude: -6.8624°W
  - Altitude:  1160 m
  - Capacity:  580 MW

NOTE — Model inference not yet wired in
----------------------------------------
The production version of this service is intended to run predictions
through a Transformer/XGBoost ensemble trained on historical MASEN
ground-station DNI measurements combined with CAMS/MERRA-2 aerosol
reanalysis. That model pipeline (see `models/` in the research repo)
is NOT connected here. The current version uses Open-Meteo's own
hourly DNI forecast as a stand-in for model output. The stub function
`run_ml_inference` below is the integration point for the trained model.
"""

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
import requests
import pvlib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
import pytz
import torch
import os
import io
import csv
from model import SolarTransformer

try:
    import joblib
except Exception:
    joblib = None

device = torch.device("cpu")
model = SolarTransformer(num_features=14)
model_path = os.path.join(os.path.dirname(__file__), "transformer_no_aod.pt")
MODEL_LOADED = False
try:
    model.load_state_dict(torch.load(model_path, map_location=device))
    MODEL_LOADED = True
except Exception as e:
    print(f"Warning: Could not load model: {e}")
model.eval()

FEATURE_COLS = [
    "DNI_clearsky", "GHI", "DHI",
    "temp", "wind",
    "dust_AOD", "total_AOD",
    "hour_sin", "hour_cos",
    "doy_sin", "doy_cos",
    "DNI_lag1", "DNI_lag2", "DNI_lag24",
    "Kt_lag1", "Kt_lag24",
    "AOD_lag1", "AOD_lag24",
]
AOD_COLS = {"dust_AOD", "total_AOD", "AOD_lag1", "AOD_lag24"}
TRANSFORMER_NO_AOD_IDX = [i for i, col in enumerate(FEATURE_COLS) if col not in AOD_COLS]
TRANSFORMER_NO_AOD_COLS = [FEATURE_COLS[i] for i in TRANSFORMER_NO_AOD_IDX]

SCALER = None
if joblib is not None:
    scaler_candidates = [
        os.path.join(os.path.dirname(__file__), "feature_scaler_v2.pkl"),
        os.path.join(os.path.dirname(__file__), "..", "models", "feature_scaler_v2.pkl"),
    ]
    for scaler_path in scaler_candidates:
        if os.path.exists(scaler_path):
            try:
                SCALER = joblib.load(scaler_path)
                break
            except Exception as e:
                print(f"Warning: Could not load scaler at {scaler_path}: {e}")
else:
    print("Warning: joblib unavailable; running transformer with unscaled live features.")

# ── Site constants ──────────────────────────────────────────────────────────
LATITUDE = 31.0091
LONGITUDE = -6.8624
ALTITUDE = 1160  # metres above sea level
TIMEZONE = "Africa/Casablanca"
CAPACITY_MW = 580

# ── Placeholder dust AOD ───────────────────────────────────────────────────
# In production this would come from CAMS near-real-time AOD or a
# ground-based sun-photometer feed (e.g. AERONET Ouarzazate station).
STATIC_DUST_AOD = 0.08

# ── Open-Meteo endpoints ──────────────────────────────────────────────────
OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast"
    f"?latitude={LATITUDE}&longitude={LONGITUDE}"
    "&hourly=direct_normal_irradiance,shortwave_radiation,diffuse_radiation,"
    "temperature_2m,wind_speed_10m,relative_humidity_2m,cloud_cover"
    "&forecast_days=1"
    f"&timezone={TIMEZONE}"
)

OPEN_METEO_WEEKLY_URL = (
    "https://api.open-meteo.com/v1/forecast"
    f"?latitude={LATITUDE}&longitude={LONGITUDE}"
    "&daily=direct_normal_irradiance_max"
    "&past_days=7&forecast_days=0"
    f"&timezone={TIMEZONE}"
)

# ── FastAPI app ────────────────────────────────────────────────────────────
app = FastAPI(
    title="NOOR Ouarzazate DNI Forecast",
    version="0.1.0-research",
    description="Research demo — live DNI forecasting for CSP dispatch.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── ML model stub ─────────────────────────────────────────────────────────
def run_ml_inference(features: dict) -> float:
    """
    Runs the SolarTransformer model to predict DNI.
    """
    seq = _build_sequence([features])

    with torch.no_grad():
        pred_kt = model(seq).item()

    return max(pred_kt * features.get("DNI_clearsky", 0.0), 0.0)


def _full_feature_row(features: dict) -> list[float]:
    """Return a full 18-column training feature row before no-AOD selection."""
    return [float(features.get(col, 0.0) or 0.0) for col in FEATURE_COLS]


def _scale_and_select_no_aod(rows: list[list[float]]) -> np.ndarray:
    full = np.asarray(rows, dtype=np.float32)
    if SCALER is not None:
        full = SCALER.transform(full)
    return full[:, TRANSFORMER_NO_AOD_IDX]


def _build_sequence(feature_rows: list[dict]) -> torch.Tensor:
    rows = [_full_feature_row(row) for row in feature_rows]
    selected = _scale_and_select_no_aod(rows)

    if len(selected) >= 24:
        seq = selected[-24:]
    else:
        pad = np.repeat(selected[:1], 24 - len(selected), axis=0)
        seq = np.vstack([pad, selected])
    return torch.tensor(seq, dtype=torch.float32).unsqueeze(0)


def _predict_dni_from_sequence(feature_rows: list[dict]) -> float:
    with torch.no_grad():
        pred_kt = model(_build_sequence(feature_rows)).item()
    return max(pred_kt * feature_rows[-1].get("DNI_clearsky", 0.0), 0.0)


# ── Helpers ────────────────────────────────────────────────────────────────
def _fetch_open_meteo(url: str = None) -> dict:
    """Fetch forecast from Open-Meteo. Raises on failure."""
    try:
        resp = requests.get(url or OPEN_METEO_URL, timeout=15)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Open-Meteo API unreachable: {exc}",
        )


def _clearsky_dni(timestamps: list[str]) -> list[float]:
    """
    Compute clear-sky DNI (Ineichen model) via pvlib for a list of
    ISO-8601 timestamp strings.
    """
    location = pvlib.location.Location(
        latitude=LATITUDE,
        longitude=LONGITUDE,
        altitude=ALTITUDE,
        tz=TIMEZONE,
    )
    times = pd.DatetimeIndex(timestamps).tz_localize(TIMEZONE, ambiguous="NaT", nonexistent="shift_forward")
    solpos = location.get_solarposition(times)
    clearsky = location.get_clearsky(times, model="ineichen")
    return clearsky["dni"].fillna(0).clip(lower=0).tolist()


def _build_entry(
    ts: str,
    dni: float,
    ghi: float,
    temp: float,
    wind: float,
    dni_cs: float,
    humidity: float = None,
    cloud_cover: float = None,
) -> dict:
    """Build a single forecast entry dict."""
    dni = max(dni or 0, 0)
    dni_cs = max(dni_cs, 0)
    kt = np.clip(dni / dni_cs, 0, 0.95) if dni_cs > 0 else 0.0

    return {
        "timestamp": ts,
        "DNI_pred": round(float(dni), 1),
        "DNI_clearsky": round(float(dni_cs), 1),
        "Kt_pred": round(float(kt), 4),
        "GHI": round(float(ghi or 0), 1),
        "temp": round(float(temp or 0), 1),
        "wind": round(float(wind or 0), 1),
        "humidity": round(float(humidity), 1) if humidity is not None else None,
        "cloud_cover": round(float(cloud_cover), 1) if cloud_cover is not None else None,
        "dust_AOD": STATIC_DUST_AOD,
        "dust_event": STATIC_DUST_AOD > 0.4,
        "model_used": "transformer-no-aod",
        "model_loaded": MODEL_LOADED,
        "scaler_loaded": SCALER is not None,
    }


def _build_feature_rows(
    times: list[str],
    meteo_dni: list[float],
    ghi: list[float],
    dhi: list[float],
    temps: list[float],
    winds: list[float],
    cs_values: list[float],
) -> list[dict]:
    """Build ordered live feature rows using Open-Meteo/pvlib values plus lags."""
    rows = []
    tz_morocco = pytz.timezone(TIMEZONE)
    fallback_dni = [float(v or 0.0) for v in meteo_dni]
    fallback_kt = [
        np.clip(d / cs, 0, 0.95) if cs > 0 else 0.0
        for d, cs in zip(fallback_dni, cs_values)
    ]

    for i, ts in enumerate(times):
        dt = datetime.fromisoformat(ts)
        if dt.tzinfo is None:
            dt = tz_morocco.localize(dt)

        def lag(values: list[float], hours: int) -> float:
            idx = i - hours
            return values[idx] if idx >= 0 else 0.0

        rows.append({
            "DNI_clearsky": cs_values[i],
            "GHI": ghi[i] if i < len(ghi) else 0.0,
            "DHI": dhi[i] if i < len(dhi) else 0.0,
            "temp": temps[i] if i < len(temps) else 0.0,
            "wind": winds[i] if i < len(winds) else 0.0,
            "dust_AOD": STATIC_DUST_AOD,
            "total_AOD": STATIC_DUST_AOD,
            "hour_sin": np.sin(2 * np.pi * dt.hour / 24),
            "hour_cos": np.cos(2 * np.pi * dt.hour / 24),
            "doy_sin": np.sin(2 * np.pi * dt.timetuple().tm_yday / 365),
            "doy_cos": np.cos(2 * np.pi * dt.timetuple().tm_yday / 365),
            "DNI_lag1": lag(fallback_dni, 1),
            "DNI_lag2": lag(fallback_dni, 2),
            "DNI_lag24": lag(fallback_dni, 24),
            "Kt_lag1": lag(fallback_kt, 1),
            "Kt_lag24": lag(fallback_kt, 24),
            "AOD_lag1": STATIC_DUST_AOD,
            "AOD_lag24": STATIC_DUST_AOD,
        })
    return rows


def _forecast_entries() -> list[dict]:
    data = _fetch_open_meteo()
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    dnis = hourly.get("direct_normal_irradiance", [])
    ghis = hourly.get("shortwave_radiation", [])
    dhis = hourly.get("diffuse_radiation", [])
    temps = hourly.get("temperature_2m", [])
    winds = hourly.get("wind_speed_10m", [])
    humids = hourly.get("relative_humidity_2m", [])
    clouds = hourly.get("cloud_cover", [])

    n = min(len(times), len(dnis), len(ghis), len(dhis), len(temps), len(winds), 24)
    if n == 0:
        raise HTTPException(status_code=502, detail="No hourly data returned.")

    times = times[:n]
    cs_values = _clearsky_dni(times)
    feature_rows = _build_feature_rows(times, dnis[:n], ghis[:n], dhis[:n], temps[:n], winds[:n], cs_values)

    entries = []
    for i in range(n):
        pred_dni = _predict_dni_from_sequence(feature_rows[:i + 1])
        entries.append(
            _build_entry(
                ts=times[i],
                dni=pred_dni,
                ghi=ghis[i],
                temp=temps[i],
                wind=winds[i],
                dni_cs=cs_values[i],
                humidity=humids[i] if i < len(humids) else None,
                cloud_cover=clouds[i] if i < len(clouds) else None,
            )
        )
    return entries


# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": MODEL_LOADED,
        "scaler_loaded": SCALER is not None,
    }


@app.get("/")
def root():
    return {
        "name": "NOOR Ouarzazate DNI Forecast API",
        "status": "ok",
        "endpoints": ["/health", "/predict", "/forecast", "/forecast.csv"],
        "model_loaded": MODEL_LOADED,
        "scaler_loaded": SCALER is not None,
    }


@app.get("/predict")
def predict():
    """
    Return the current-hour DNI prediction.
    Finds the Open-Meteo hourly slot closest to *now* in Morocco time.
    """
    entries = _forecast_entries()
    times = [entry["timestamp"] for entry in entries]

    if not times:
        raise HTTPException(status_code=502, detail="No hourly data returned.")

    # Find nearest hour to current Morocco time
    tz_morocco = pytz.timezone(TIMEZONE)
    now = datetime.now(tz_morocco)
    idx = 0
    min_diff = float("inf")
    for i, t in enumerate(times):
        dt = datetime.fromisoformat(t)
        if dt.tzinfo is None:
            dt = tz_morocco.localize(dt)
        diff = abs((dt - now).total_seconds())
        if diff < min_diff:
            min_diff = diff
            idx = i

    return entries[idx]


@app.get("/forecast")
def forecast():
    """
    Return 24 hourly forecast entries for the current forecast day.
    """
    return _forecast_entries()


@app.get("/forecast.csv")
def forecast_csv():
    """
    Extract the 24-hour forecast as CSV for manual testing/demo analysis.
    """
    entries = _forecast_entries()
    output = io.StringIO()
    fieldnames = [
        "timestamp", "DNI_pred", "DNI_clearsky", "Kt_pred", "GHI",
        "temp", "wind", "humidity", "cloud_cover", "dust_AOD",
        "dust_event", "model_used", "model_loaded", "scaler_loaded",
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(entries)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=noor_forecast.csv"},
    )


@app.get("/weekly")
def weekly():
    """
    Return 7 days of peak (max) DNI values for the weekly trend chart.
    Uses Open-Meteo's daily aggregation with past_days=7.
    """
    data = _fetch_open_meteo(OPEN_METEO_WEEKLY_URL)
    daily = data.get("daily", {})
    times = daily.get("time", [])
    dni_maxes = daily.get("direct_normal_irradiance_max", [])

    if not times:
        raise HTTPException(status_code=502, detail="No daily data returned.")

    entries = []
    for i in range(len(times)):
        entries.append({
            "date": times[i],
            "DNI_peak": round(float(dni_maxes[i] or 0), 1),
        })
    return entries
