from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api import auth, me, tests, public
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ПрофДНК Backend")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(me.router)
app.include_router(tests.router)
app.include_router(public.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ProfDNA API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_HOST", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)