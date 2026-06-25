# NOOR Ouarzazate — live DNI forecast

Research demo for live direct normal irradiance (DNI) forecasting at the NOOR Ouarzazate concentrated solar power (CSP) complex in Morocco.

**Site:** 31.0091°N, 6.8624°W · 1160 m altitude · 580 MW capacity

## Architecture

```
┌─────────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Open-Meteo    │──────▶│  FastAPI backend  │──────▶│  React app   │
│   (weather API) │       │  (api.py :8000)   │       │  (:3000)     │
└─────────────────┘       └──────────────────┘       └──────────────┘
                               pvlib ↑
                          (clear-sky model)
```

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Verify it works:

```bash
curl http://localhost:8000/health
# → {"status":"ok"}

curl http://localhost:8000/predict
# → JSON with current DNI, clearness index, temperature, wind, etc.
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000). The app fetches from `http://localhost:8000`.

## Endpoints

| Endpoint      | Method | Description                                   |
|---------------|--------|-----------------------------------------------|
| `/health`     | GET    | Health check                                  |
| `/predict`    | GET    | Current-hour DNI prediction                   |
| `/forecast`   | GET    | 24-hour hourly forecast array                 |
| `/forecast.csv` | GET  | 24-hour forecast CSV extract                  |

## Vercel deployment

Deploy the frontend as the Vercel project root:

```bash
cd frontend
npm ci
npm run build
```

In Vercel, set the project root directory to `frontend`.

Required Vercel environment variable:

```bash
VITE_API_BASE_URL=https://your-username-your-space-name.hf.space
```

Deploy the FastAPI/PyTorch backend separately on Hugging Face Spaces using
the Docker setup in `backend/`. Vercel serverless is not a good fit for this
backend because it loads PyTorch model weights at runtime. After the Space is
live, use its public `.hf.space` base URL as `VITE_API_BASE_URL`.

## Notes

- **No API key required** — Open-Meteo is free and keyless for non-commercial use.
- **Transformer model connected** — `api.py` loads `backend/transformer_no_aod.pt` and runs the no-AOD Transformer architecture. If `feature_scaler_v2.pkl` is not present in `backend/` or `models/`, responses include `"scaler_loaded": false` to flag that live features are not calibrated exactly like training.
- **Dust AOD is static** — set to 0.08 as a placeholder. In production this would come from CAMS near-real-time data or the AERONET Ouarzazate station.
- **Auto-refresh** — the frontend refreshes every 60 minutes. Use the manual refresh button for immediate updates.

## Tech stack

- **Backend:** Python, FastAPI, pvlib, requests
- **Frontend:** React 18, Recharts, Tabler Icons
- **Weather data:** Open-Meteo API
- **Clear-sky model:** pvlib Ineichen
