from fastapi import FastAPI
from app.routers import users, data, analysis , auth
from fastapi.middleware.cors import CORSMiddleware


from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ElevAI+ API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"message": "ElevAI+ backend is running"}

app.include_router(users.router)
app.include_router(data.router)
app.include_router(analysis.router)
app.include_router(auth.router)
