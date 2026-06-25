import numpy as np
import pandas as pd
import torch
import torch.nn as nn
import math
import matplotlib.pyplot as plt
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
import joblib
from sklearn.metrics import mean_absolute_error, mean_squared_error

# ============================================================
# PATHS
# ============================================================

BASE_DIR   = Path(__file__).resolve().parent.parent
DATA_DIR   = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
FIG_DIR    = BASE_DIR / "figures"
MODELS_DIR.mkdir(parents=True, exist_ok=True)
FIG_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# SETUP
# ============================================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Device: {device}")

df       = pd.read_csv(DATA_DIR / "ouarzazate_full.csv",
                       index_col="time", parse_dates=True)
df       = df.sort_index()
df["Kt"] = df["Kt"].clip(0, 0.95)

time_diffs = df.index.to_series().diff()
gap_mask   = time_diffs > pd.Timedelta("1h")
lag_cols   = ["Kt_lag1", "Kt_lag24", "DNI_lag1",
              "DNI_lag2", "DNI_lag24", "AOD_lag1", "AOD_lag24"]
df.loc[gap_mask, lag_cols] = np.nan
df = df.dropna()

df["is_daytime"] = df["DNI_clearsky"] > 0

train = df[df.index.year <= 2016]
val   = df[(df.index.year >= 2017) & (df.index.year <= 2019)]
test  = df[df.index.year >= 2020]

feature_cols = [
    "DNI_clearsky", "GHI", "DHI",
    "temp", "wind",
    "dust_AOD", "total_AOD",
    "hour_sin", "hour_cos",
    "doy_sin",  "doy_cos",
    "DNI_lag1", "DNI_lag2", "DNI_lag24",
    "Kt_lag1",  "Kt_lag24",
    "AOD_lag1", "AOD_lag24"
]

# FIXED — keep lag features for both versions
aod_cols               = ["dust_AOD", "total_AOD", "AOD_lag1", "AOD_lag24"]
transformer_no_aod_idx = [i for i, c in enumerate(feature_cols)
                          if c not in aod_cols]
transformer_aod_idx    = list(range(len(feature_cols)))

scaler = joblib.load(MODELS_DIR / "feature_scaler_v2.pkl")

X_train_full = scaler.transform(train[feature_cols])
X_val_full   = scaler.transform(val[feature_cols])
X_test_full  = scaler.transform(test[feature_cols])

y_train = train["Kt"].values
y_val   = val["Kt"].values
y_test  = test["Kt"].values

mask_train = train["is_daytime"].values
mask_val   = val["is_daytime"].values
mask_test  = test["is_daytime"].values

dust_mask   = test["dust_event"].values.astype(bool)
DNI_cs_test = test["DNI_clearsky"].values
DNI_true    = test["DNI"].values
persist     = test["Kt_lag1"].values

print(f"Train: {len(X_train_full)} | Val: {len(X_val_full)} | "
      f"Test: {len(X_test_full)}")

# ============================================================
# SEQUENCE DATASET
# ============================================================

SEQ_LEN = 24

class SequenceDataset(Dataset):
    def __init__(self, X, y, mask, seq_len):
        self.X       = torch.tensor(X, dtype=torch.float32)
        self.y       = torch.tensor(y, dtype=torch.float32)
        self.mask    = torch.tensor(mask, dtype=torch.bool)
        self.seq_len = seq_len

    def __len__(self):
        return len(self.X) - self.seq_len

    def __getitem__(self, idx):
        target_idx = idx + self.seq_len
        return (self.X[idx + 1 : target_idx + 1],
                self.y[target_idx],
                self.mask[target_idx])

def make_loader(X, y, mask, seq_len, batch_size, shuffle=False):
    ds = SequenceDataset(X, y, mask, seq_len)
    return DataLoader(ds, batch_size=batch_size,
                      shuffle=shuffle, num_workers=0)

# ============================================================
# MODEL
# ============================================================

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe       = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len,
                                dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float()
            * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe.unsqueeze(0))

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]


class SolarTransformer(nn.Module):
    def __init__(self, num_features, d_model=128, nhead=8,
                 num_layers=3, dim_feedforward=256, dropout=0.1):
        super().__init__()
        self.feature_projection = nn.Linear(num_features, d_model)
        self.pos_encoder        = PositionalEncoding(d_model)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(
            encoder_layer, num_layers=num_layers
        )

        # Hardtanh: physical constraint, no vanishing gradient
        self.regressor = nn.Sequential(
            nn.Linear(d_model, 32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 1),
            nn.Hardtanh(min_val=0.0, max_val=0.95)
        )

    def forward(self, x):
        x = self.feature_projection(x)
        x = self.pos_encoder(x)
        x = self.transformer_encoder(x)
        return self.regressor(x[:, -1, :]).squeeze(-1)

# ============================================================
# TRAINING
# ============================================================

def train_and_evaluate(X_train, X_val, X_test,
                       feature_indices, model_name, save_filename):
    print(f"\n--- Training {model_name} ---")

    X_tr = X_train[:, feature_indices]
    X_va = X_val[:,   feature_indices]
    X_te = X_test[:,  feature_indices]
    n_features = len(feature_indices)

    tr_loader = make_loader(X_tr, y_train, mask_train,
                            SEQ_LEN, batch_size=256, shuffle=True)
    v_loader  = make_loader(X_va, y_val,   mask_val,
                            SEQ_LEN, batch_size=256)
    te_loader = make_loader(X_te, y_test,  mask_test,
                            SEQ_LEN, batch_size=256)

    model = SolarTransformer(num_features=n_features).to(device)

    criterion = nn.HuberLoss()
    optimizer = torch.optim.Adam(model.parameters(),
                                 lr=1e-3, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
                    optimizer, patience=4, factor=0.5)

    best_val  = float("inf")
    patience  = 10
    wait      = 0
    history   = {"train": [], "val": []}
    save_path = MODELS_DIR / save_filename
    epochs    = 100

    for epoch in range(epochs):
        # Train — daytime only
        model.train()
        tr_loss, tr_samples = 0.0, 0
        for xb, yb, mb in tr_loader:
            xb, yb, mb = xb.to(device), yb.to(device), mb.to(device)
            optimizer.zero_grad()
            preds    = model(xb)
            day_pred = preds[mb]
            day_yb   = yb[mb]
            if len(day_yb) > 0:
                loss = criterion(day_pred, day_yb)
                loss.backward()
                nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                tr_loss    += loss.item() * len(day_yb)
                tr_samples += len(day_yb)
        tr_loss /= max(tr_samples, 1)

        # Validate — daytime only
        model.eval()
        v_loss, v_samples = 0.0, 0
        with torch.no_grad():
            for xb, yb, mb in v_loader:
                xb, yb, mb = xb.to(device), yb.to(device), mb.to(device)
                preds    = model(xb)
                day_pred = preds[mb]
                day_yb   = yb[mb]
                if len(day_yb) > 0:
                    v_loss    += criterion(
                                     day_pred, day_yb
                                 ).item() * len(day_yb)
                    v_samples += len(day_yb)
        v_loss /= max(v_samples, 1)

        scheduler.step(v_loss)
        history["train"].append(tr_loss)
        history["val"].append(v_loss)

        if (epoch + 1) % 10 == 0 or epoch == 0:
            print(f"  Epoch {epoch+1:3d}/{epochs} | "
                  f"Train: {tr_loss:.5f} | Val: {v_loss:.5f}")

        if v_loss < best_val:
            best_val = v_loss
            torch.save(model.state_dict(), save_path)
            wait = 0
        else:
            wait += 1
            if wait >= patience:
                print(f"  Early stop at epoch {epoch+1} | "
                      f"Best val: {best_val:.5f}")
                break

    # ============================================================
    # EVALUATE — daytime only, honest metrics
    # ============================================================

    model.load_state_dict(torch.load(save_path, map_location=device))
    model.eval()

    test_preds = []
    with torch.no_grad():
        for xb, _, _ in te_loader:
            test_preds.append(
                model(xb.to(device)).cpu().numpy()
            )
    test_preds = np.concatenate(test_preds)

    # Align
    y_true_seq   = y_test[SEQ_LEN:]
    mask_day_seq = mask_test[SEQ_LEN:]
    dust_seq     = dust_mask[SEQ_LEN:]
    dni_cs_seq   = DNI_cs_test[SEQ_LEN:]
    dni_true_seq = DNI_true[SEQ_LEN:]
    persist_seq  = persist[SEQ_LEN:]

    # FIXED — filter to daytime only for honest evaluation
    day          = mask_day_seq.astype(bool)
    y_true_day   = y_true_seq[day]
    y_pred_day   = test_preds[day]
    dust_day     = dust_seq[day]
    dni_cs_day   = dni_cs_seq[day]
    dni_true_day = dni_true_seq[day]
    persist_day  = persist_seq[day]

    mae_kt   = mean_absolute_error(y_true_day, y_pred_day)
    rmse_kt  = np.sqrt(mean_squared_error(y_true_day, y_pred_day))
    nrmse    = rmse_kt / np.mean(y_true_day) * 100
    skill    = 1.0 - rmse_kt / np.sqrt(
                   mean_squared_error(y_true_day, persist_day))
    mae_wm2  = mean_absolute_error(
                   dni_true_day, y_pred_day * dni_cs_day)

    clean_idx = ~dust_day.astype(bool)
    dust_idx  =  dust_day.astype(bool)
    mae_clean = mean_absolute_error(
                    y_true_day[clean_idx], y_pred_day[clean_idx])
    mae_dust  = mean_absolute_error(
                    y_true_day[dust_idx],  y_pred_day[dust_idx])
    dust_penalty = ((mae_dust - mae_clean) / mae_clean) * 100

    print(f"\n  {model_name} — Test Results")
    print(f"  MAE={mae_kt:.4f} | nRMSE={nrmse:.2f}% | "
          f"Skill={skill:.4f} | MAE_W={mae_wm2:.2f}")
    print(f"  Clean={mae_clean:.4f} | Dust={mae_dust:.4f} | "
          f"Penalty={dust_penalty:.1f}%")

    return dict(
        Model=model_name,
        MAE_Kt=round(mae_kt,4),
        RMSE_Kt=round(rmse_kt,4),
        nRMSE=round(nrmse,2),
        Skill=round(skill,4),
        MAE_Wm2=round(mae_wm2,2),
        MAE_clean=round(mae_clean,4),
        MAE_dust=round(mae_dust,4),
        Dust_penalty=round(dust_penalty,1)
    ), history

# ============================================================
# RUN BOTH VERSIONS
# ============================================================

results_no_aod, hist1 = train_and_evaluate(
    X_train_full, X_val_full, X_test_full,
    transformer_no_aod_idx,
    "Transformer — No AOD",
    "transformer_no_aod.pt"
)

results_aod, hist2 = train_and_evaluate(
    X_train_full, X_val_full, X_test_full,
    transformer_aod_idx,
    "Transformer — With AOD",
    "transformer_aod.pt"
)

# ============================================================
# SAVE RESULTS
# ============================================================

prev = pd.read_csv(DATA_DIR / "results_table_all_models.csv")
prev = prev[~prev["Model"].str.contains("Transformer", na=False)]

final = pd.concat([
    prev,
    pd.DataFrame([results_no_aod, results_aod])
], ignore_index=True)

print("\n" + "="*30 + " MASTER RESULTS TABLE " + "="*30)
print(final.to_string(index=False))
final.to_csv(DATA_DIR / "results_table_final.csv", index=False)
print("Saved: results_table_final.csv")

# ============================================================
# FIGURE — Training curves
# ============================================================

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
for ax, hist, title in zip(
    axes, [hist1, hist2],
    ["Transformer — No AOD", "Transformer — With AOD"]
):
    ax.plot(hist["train"], label="Train loss",
            color="#3B82F6", linewidth=1.5)
    ax.plot(hist["val"],   label="Val loss",
            color="#EF4444", linewidth=1.5)
    ax.set_title(title, fontweight="bold")
    ax.set_xlabel("Epoch")
    ax.set_ylabel("Daytime Huber Loss")
    ax.legend()
    ax.grid(alpha=0.3)

plt.suptitle("Transformer Training Curves — NOOR Ouarzazate",
             fontweight="bold")
plt.tight_layout()
plt.savefig(FIG_DIR / "fig_transformer_training.png",
            dpi=150, bbox_inches="tight")
plt.show()
print("Saved: fig_transformer_training.png")