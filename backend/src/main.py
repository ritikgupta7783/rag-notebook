import os
import sys

_SRC_DIR = os.path.dirname(os.path.abspath(__file__))
if _SRC_DIR not in sys.path:
    sys.path.insert(0, _SRC_DIR)

from dotenv import load_dotenv

load_dotenv()

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import api_router
from configs.db import close_db, init_db
from middlewares.auth_middleware import AuthMiddleware
from sqs.worker import consume as consume_sqs

APP_NAME = os.getenv("APP_NAME", "OpenNotebook")

DEBUG = os.getenv(
    "DEBUG",
    "true",
).lower() in ("1", "true", "yes", "on")

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    consumer_task = asyncio.create_task(consume_sqs())

    yield

    consumer_task.cancel()
    try:
        await consumer_task
    except asyncio.CancelledError:
        pass

    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title=APP_NAME,
        version="0.1.0",
        debug=DEBUG,
        lifespan=lifespan,
    )

    app.add_middleware(AuthMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(
        api_router,
        prefix="/api/v1",
    )

    @app.get("/", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
