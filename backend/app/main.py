from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, tests, sessions, reports, public
from .database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ProfDNK API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tests.router)
app.include_router(sessions.router)
app.include_router(reports.router)
app.include_router(public.router)

@app.get("/health")
def health():
    return {"status": "ok"}