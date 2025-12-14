from fastapi import FastAPI
from app.routers import users, data, analysis

from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ElevAI+ API", version="0.1.0")

@app.get("/ping")
def ping():
    return {"message": "ElevAI+ backend is running"}

app.include_router(users.router)
app.include_router(data.router)
app.include_router(analysis.router)
