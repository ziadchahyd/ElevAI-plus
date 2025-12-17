import os
import pandas as pd
import numpy as np

from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

from app.database import SessionLocal
from app import models

FEATURES = [
    "sommeil_h",
    "pas",
    "sport_min",
    "calories",
    "humeur_0_5",
    "stress_0_5",
    "fc_repos",
]

def compute_target_score(df: pd.DataFrame) -> pd.Series:
    """
    Target 'score' (0-100) : comme l'énoncé ne fournit pas de label,
    on crée une formule simple et cohérente pour entraîner un modèle supervisé.
    """
    # normalisation simple par bornes raisonnables
    sleep = np.clip(df["sommeil_h"] / 8.0, 0, 1)
    steps = np.clip(df["pas"] / 10000.0, 0, 1)
    sport = np.clip(df["sport_min"] / 45.0, 0, 1)
    mood = np.clip(df["humeur_0_5"] / 5.0, 0, 1)
    stress = 1 - np.clip(df["stress_0_5"] / 5.0, 0, 1)          # inversé
    hr = 1 - np.clip((df["fc_repos"] - 50) / 50.0, 0, 1)        # mieux si plus bas
    cal = 1 - np.clip(np.abs(df["calories"] - 2200) / 1200.0, 0, 1)  # proche d'une cible

    score = (0.20*sleep + 0.20*steps + 0.10*sport + 0.15*mood + 0.15*stress + 0.10*hr + 0.10*cal) * 100
    return np.clip(score, 0, 100)

def fetch_data_from_db() -> pd.DataFrame:
    db: Session = SessionLocal()
    try:
        rows = db.query(models.DailyData).all()
        if not rows:
            return pd.DataFrame()

        data = []
        for r in rows:
            data.append({
                "user_id": r.user_id,
                "date": r.date,
                "sommeil_h": r.sommeil_h,
                "pas": r.pas,
                "sport_min": r.sport_min,
                "calories": r.calories,
                "humeur_0_5": r.humeur_0_5,
                "stress_0_5": r.stress_0_5,
                "fc_repos": r.fc_repos,
            })
        df = pd.DataFrame(data)
        return df
    finally:
        db.close()

def add_rolling_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Ajoute rolling mean 3 jours par user .
    """
    df = df.copy()
    df = df.sort_values(["user_id", "date"])
    for col in FEATURES:
        df[f"{col}_rm3"] = df.groupby("user_id")[col].transform(lambda s: s.rolling(3, min_periods=1).mean())
    return df

def handle_missing(df: pd.DataFrame) -> pd.DataFrame:
    """
    Gestion valeurs manquantes : imputation simple (médiane) par colonne.
    """
    df = df.copy()
    for c in df.columns:
        if df[c].dtype.kind in "if" and df[c].isna().any():
            df[c] = df[c].fillna(df[c].median())
    return df

def train_and_save(model_path: str):
    df = fetch_data_from_db()
    if df.empty:
        raise RuntimeError("Aucune donnée dans la base. Ajoute d'abord plusieurs jours via POST /data.")

    # features rolling
    df = add_rolling_features(df)

    # target
    df["score"] = compute_target_score(df)

    # dataset final
    feature_cols = FEATURES + [f"{c}_rm3" for c in FEATURES]
    X = df[feature_cols]
    y = df["score"]

    X = handle_missing(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    pipe = Pipeline(steps=[
        ("scaler", StandardScaler()),
        ("model", RandomForestRegressor(
            n_estimators=200,
            random_state=42
        ))
    ])

    pipe.fit(X_train, y_train)

    preds = pipe.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump({
        "pipeline": pipe,
        "feature_cols": feature_cols
    }, model_path)

    print("Model saved to:", model_path)
    print("MSE:", round(mse, 3), "| R2:", round(r2, 3))


if __name__ == "__main__":
    # Sauvegarde dans backend/app/ml/model.pkl
    here = os.path.dirname(__file__)
    model_path = os.path.join(here, "model.pkl")
    train_and_save(model_path)
