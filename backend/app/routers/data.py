from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
import pandas as pd
from app.ml.train import compute_target_score


from app.database import get_db
from app import models
from app.schemas import DailyDataCreate, DailyDataOut, DailyDataWithScore
from app.deps import get_current_user  # JWT

router = APIRouter(tags=["data"])


@router.post("/data", response_model=DailyDataOut)
def add_daily_data(
    payload: DailyDataCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id  # user depuis le token

    # Empêcher doublon même date pour même user
    existing = (
        db.query(models.DailyData)
        .filter(
            and_(
                models.DailyData.user_id == user_id,
                models.DailyData.date == payload.date,
            )
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Daily data already exists for this user and date")

    row = models.DailyData(
        user_id=user_id,
        date=payload.date,
        sommeil_h=payload.sommeil_h,
        pas=payload.pas,
        sport_min=payload.sport_min,
        calories=payload.calories,
        humeur_0_5=payload.humeur_0_5,
        stress_0_5=payload.stress_0_5,
        fc_repos=payload.fc_repos,
    )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.get("/data/me", response_model=list[DailyDataWithScore])
def get_my_data(
    from_: str | None = Query(default=None, alias="from"),
    to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_id = current_user.id

    q = db.query(models.DailyData).filter(models.DailyData.user_id == user_id)

    if from_:
        q = q.filter(models.DailyData.date >= from_)
    if to:
        q = q.filter(models.DailyData.date <= to)

    rows = q.order_by(models.DailyData.date.asc()).all()

    if not rows:
        return []

    data = []
    for r in rows:
        data.append({
            "id": r.id,
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
    df["score"] = compute_target_score(df)

    return df.to_dict(orient="records")



# Optionnel 
@router.get("/data/{user_id}", response_model=list[DailyDataOut])
def get_user_data_admin(
    user_id: int,
    from_: str | None = Query(default=None, alias="from"),
    to: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Par sécurité : n'autoriser que soi-même
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    q = db.query(models.DailyData).filter(models.DailyData.user_id == user_id)

    if from_:
        q = q.filter(models.DailyData.date >= from_)
    if to:
        q = q.filter(models.DailyData.date <= to)

    return q.order_by(models.DailyData.date.asc()).all()
