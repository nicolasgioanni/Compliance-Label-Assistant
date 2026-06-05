"""FastAPI application entrypoint."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes import health, verification
from app.utils.logging_config import configure_logging


logger = logging.getLogger(__name__)


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled request error: %s", exc.__class__.__name__)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected server error occurred. Please try again."},
    )


def create_app() -> FastAPI:
    configure_logging()
    settings = get_settings()

    app = FastAPI(
        title="Compliance Label Assistant API",
        version="0.1.0",
        description=(
            "API for AI-assisted alcohol label verification comparing label artwork "
            "against expected application data, "
            "including single-label and limited batch workflows."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins or [],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(verification.router)
    app.add_exception_handler(Exception, handle_unexpected_error)
    return app


app = create_app()
