import os
import joblib
import pandas as pd

from app.ml.train import FEATURES, add_rolling_features, handle_missing, compute_target_score

_model_cache = None

def load_model():
    global _model_cache
    if _model_cache is not None:
        return _model_cache

    here = os.path.dirname(__file__)
    path = os.path.join(here, "model.pkl")
    if not os.path.exists(path):
        raise FileNotFoundError("model.pkl introuvable. Lance d'abord: python -m app.ml.train (ou python app/ml/train.py).")

    _model_cache = joblib.load(path)
    return _model_cache

def predict_score(df_user: pd.DataFrame) -> float:
    """
    df_user: historique d'un seul user, avec colonnes FEATURES + date.
    On prend la dernière ligne (après rolling) pour prédire le score.
    """
    if df_user.empty:
        raise ValueError("Pas de données user.")

    df_user = add_rolling_features(df_user)
    feature_cols = load_model()["feature_cols"]

    X = df_user[feature_cols]
    X = handle_missing(X)

    pipe = load_model()["pipeline"]
    score = float(pipe.predict(X.tail(1))[0])
    return max(0.0, min(100.0, score))
