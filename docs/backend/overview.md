# Backend Overview

## Purpose

The backend is a FastAPI application that receives label images and expected application fields, validates and preprocesses images, extracts visible text through the OpenAI provider boundary, applies deterministic verification rules, and returns structured JSON.

## Framework And Runtime

- FastAPI `0.115.6`
- Uvicorn `0.34.0`
- Python runtime file: `backend/runtime.txt`
- Declared runtime: `python-3.11.9`
- Dependencies: `backend/requirements.txt`

## Entrypoints

- App factory: `create_app` in `backend/app/main.py`
- ASGI app: `app` in `backend/app/main.py`
- Render startup helper: `backend/start.sh`
- Uvicorn target: `app.main:app`

## Main Responsibilities

- Configure logging and CORS.
- Expose `/health`, `/warmup`, `/verify`, and `/verify-batch`.
- Validate upload metadata, size, decoded image format, and pixel count.
- Preprocess image bytes in memory.
- Call OpenAI extraction provider code from the backend only.
- Apply deterministic verification rules.
- Return Pydantic response models.
- Convert known failures into safe HTTP errors.

## Important Non-Responsibilities

- No database.
- No authentication.
- No persistent uploaded file storage.
- No final legal compliance decision.
- No frontend asset serving.
- No direct deployment platform configuration file.

## Related Reference

- [Backend architecture](../architecture/backend-architecture.md)
- [Backend file reference](../reference/backend-file-reference.md)
- [API endpoints](../api/endpoints.md)
