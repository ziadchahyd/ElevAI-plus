from sqlalchemy import Column, Integer, String, Float
from app.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from pydantic import BaseModel, Field

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer, nullable=False)
    genre = Column(String, nullable=False)         
    taille_cm = Column(Float, nullable=False)      
    poids_kg = Column(Float, nullable=False)       
    objectif = Column(String, nullable=False)      

class DailyData(Base):
    __tablename__ = "daily_data"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(String, nullable=False, index=True)  # format "YYYY-MM-DD"

    sommeil_h = Column(Float, nullable=False)
    pas = Column(Integer, nullable=False)
    sport_min = Column(Integer, nullable=False)
    calories = Column(Integer, nullable=False)
    humeur_0_5 = Column(Integer, nullable=False)
    stress_0_5 = Column(Integer, nullable=False)
    fc_repos = Column(Integer, nullable=False)

    user = relationship("User")
class DailyDataCreate(BaseModel):
    user_id: int
    date: str = Field(..., min_length=10, max_length=10)  # "YYYY-MM-DD"

    sommeil_h: float = Field(..., ge=0, le=24)
    pas: int = Field(..., ge=0, le=200000)
    sport_min: int = Field(..., ge=0, le=1440)
    calories: int = Field(..., ge=0, le=20000)
    humeur_0_5: int = Field(..., ge=0, le=5)
    stress_0_5: int = Field(..., ge=0, le=5)
    fc_repos: int = Field(..., ge=20, le=250)

class DailyDataOut(DailyDataCreate):
    id: int

    class Config:
        from_attributes = True