from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.auth import router as auth_router
from app.db import reset_schema

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    reset_schema()
    yield


app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
