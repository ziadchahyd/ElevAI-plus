from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from app.database import get_db
from app import models
from app.ml.model import predict_score
from app.deps import get_current_user

router = APIRouter(tags=["analysis"])

FEATURES = [
    "sommeil_h",
    "pas",
    "sport_min",
    "calories",
    "humeur_0_5",
    "stress_0_5",
    "fc_repos",
]

def category_from_score(score: float) -> str:
    if score < 40:
        return "Faible"
    if score < 70:
        return "Moyen"
    return "Bon équilibre"

def build_explanations(latest: dict) -> dict:
    exp = {}
    exp["sommeil_h"] = "+" if latest["sommeil_h"] >= 7 else "-"
    exp["pas"] = "+" if latest["pas"] >= 8000 else "-"
    exp["sport_min"] = "+" if latest["sport_min"] >= 20 else "-"
    exp["calories"] = "+" if 1600 <= latest["calories"] <= 3000 else "-"
    exp["humeur_0_5"] = "+" if latest["humeur_0_5"] >= 3 else "-"
    exp["stress_0_5"] = "+" if latest["stress_0_5"] <= 2 else "-"
    exp["fc_repos"] = "+" if latest["fc_repos"] <= 75 else "-"
    return exp

def build_recommendations(latest: dict) -> list[str]:
    recs = []
    if latest["sommeil_h"] < 7:
        recs.append("Avance ton coucher de 30 minutes pendant 3 jours pour viser 7–8h.")
    if latest["pas"] < 8000:
        recs.append("Ajoute 15–20 minutes de marche (objectif 8k pas/jour).")
    if latest["sport_min"] < 20:
        recs.append("Fais une activité légère 20 minutes (stretching, marche rapide).")
    if latest["stress_0_5"] >= 3:
        recs.append("Prends 5 minutes de respiration guidée (2 fois/jour) pour réduire le stress.")
    if latest["humeur_0_5"] <= 2:
        recs.append("Planifie une activité agréable courte aujourd’hui (musique, sortie, appel).")
    if latest["fc_repos"] > 80:
        recs.append("Hydratation + marche légère; si FC reste élevée plusieurs jours, surveille fatigue/stress.")
    if not recs:
        recs.append("Continue sur ce rythme : sommeil régulier, activité quotidienne et gestion du stress.")
    return recs[:5]


@router.get("/analyze/me")
def analyze_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    rows = (
        db.query(models.DailyData)
        .filter(models.DailyData.user_id == user_id)
        .order_by(models.DailyData.date.asc())
        .all()
    )
    if not rows:
        raise HTTPException(status_code=404, detail="No daily data found for this user")

    df = pd.DataFrame([{
        "user_id": r.user_id,
        "date": r.date,
        "sommeil_h": r.sommeil_h,
        "pas": r.pas,
        "sport_min": r.sport_min,
        "calories": r.calories,
        "humeur_0_5": r.humeur_0_5,
        "stress_0_5": r.stress_0_5,
        "fc_repos": r.fc_repos,
    } for r in rows])

    latest = df.tail(1).iloc[0].to_dict()

    try:
        score = predict_score(df)
    except FileNotFoundError:
        raise HTTPException(status_code=400, detail="Model not trained. Run training script to generate model.pkl.")

    category = category_from_score(score)
    explanations = build_explanations(latest)
    recommendations = build_recommendations(latest)

    risk_prediction = "Stable"
    if len(df) >= 3:
        last3 = df.tail(3)
        trend = (last3["stress_0_5"].iloc[-1] - last3["stress_0_5"].iloc[0])
        if trend >= 2:
            risk_prediction = "Stress en hausse probable sur 3 jours"
        elif trend <= -2:
            risk_prediction = "Stress en baisse probable sur 3 jours"

    return {
        "user_id": user_id,
        "score": round(score, 2),
        "category": category,
        "risk_prediction": risk_prediction,
        "explanations": explanations,
        "recommendations": recommendations
    }


@router.get("/recommend/me")
def recommend_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    row = (
        db.query(models.DailyData)
        .filter(models.DailyData.user_id == user_id)
        .order_by(models.DailyData.date.desc())
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="No daily data found for this user")

    latest = {
        "sommeil_h": row.sommeil_h,
        "pas": row.pas,
        "sport_min": row.sport_min,
        "calories": row.calories,
        "humeur_0_5": row.humeur_0_5,
        "stress_0_5": row.stress_0_5,
        "fc_repos": row.fc_repos,
    }

    return {
        "user_id": user_id,
        "recommendations": build_recommendations(latest),
    }
