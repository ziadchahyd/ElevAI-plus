from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

    age: int = Field(..., ge=0, le=120)
    genre: str = Field(..., min_length=1, max_length=20)
    taille_cm: float = Field(..., ge=50, le=250)
    poids_kg: float = Field(..., ge=20, le=300)
    objectif: str = Field(..., min_length=2, max_length=100)

class UserOut(BaseModel):
    id: int
    username: str
    age: int
    genre: str
    taille_cm: float
    poids_kg: float
    objectif: str

    class Config:
        from_attributes = True


class DailyDataCreate(BaseModel):
    
    date: str = Field(..., min_length=10, max_length=10) 

    sommeil_h: float = Field(..., ge=0, le=24)
    pas: int = Field(..., ge=0, le=200000)
    sport_min: int = Field(..., ge=0, le=1440)
    calories: int = Field(..., ge=0, le=20000)
    humeur_0_5: int = Field(..., ge=0, le=5)
    stress_0_5: int = Field(..., ge=0, le=5)
    fc_repos: int = Field(..., ge=20, le=250)

class DailyDataOut(BaseModel):
    id: int
    user_id: int
    date: str

    sommeil_h: float
    pas: int
    sport_min: int
    calories: int
    humeur_0_5: int
    stress_0_5: int
    fc_repos: int

    class Config:
        from_attributes = True

class DailyDataWithScore(BaseModel):
    id: int
    user_id: int
    date: str

    sommeil_h: float
    pas: int
    sport_min: int
    calories: int
    humeur_0_5: int
    stress_0_5: int
    fc_repos: int

    score: float

    class Config:
        from_attributes = True