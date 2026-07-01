"""FastAPI application entrypoint and route assembly.

This module owns process-level API wiring only: configuration loading, CORS,
shared security headers, route registration, and the final fallback error
handler. Verification, provider, image, and response-building behavior stays in
the service modules registered here so HTTP routing remains thin.
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes import health, verification, warmup
from app.utils.logging_config import configure_logging
from app.utils.security_headers import apply_security_headers


logger = logging.getLogger(__name__)


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    """Return the public fallback error shape without leaking internals."""
    logger.error("Unhandled request error: %s", exc.__class__.__name__)
    return apply_security_headers(
        JSONResponse(
            status_code=500,
            content={"detail": "An unexpected server error occurred. Please try again."},
        )
    )


def create_app() -> FastAPI:
    """Build the FastAPI app with deployment-sensitive middleware and routes."""
    configure_logging()
    settings = get_settings()

    # Keep API metadata stable because frontend health checks and deployment
    # import checks use this app object without starting Uvicorn.
    app = FastAPI(
        title="Compliance Label Assistant API",
        version="0.1.0",
        description=(
            "API for AI-assisted alcohol label verification comparing label artwork "
            "against expected application data, "
            "including single-label and limited batch workflows."
        ),
    )

    # Browser callers depend on explicit configured origins; provider secrets
    # remain backend-only and are never represented in CORS configuration.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins or [],
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        """Apply shared defensive headers to normal route responses."""
        response = await call_next(request)
        return apply_security_headers(response)

    # Public endpoint paths are registered here and consumed by the frontend API
    # client and deployment smoke checks.
    app.include_router(health.router)
    app.include_router(warmup.router)
    app.include_router(verification.router)
    app.add_exception_handler(Exception, handle_unexpected_error)
    return app


app = create_app()
