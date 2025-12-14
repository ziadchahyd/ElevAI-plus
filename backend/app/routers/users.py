from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import UserCreate, UserOut

router = APIRouter(tags=["users"])

@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = models.User(
        age=payload.age,
        genre=payload.genre,
        taille_cm=payload.taille_cm,
        poids_kg=payload.poids_kg,
        objectif=payload.objectif
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
