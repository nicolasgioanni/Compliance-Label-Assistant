# Backend File Reference

## App Entrypoint And Config

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/__init__.py` | Marks `app` as a Python package. | none | none | Python imports | No runtime behavior. |
| `backend/app/main.py` | FastAPI application factory, CORS setup, route registration, unexpected error handler. | `create_app`, `app`, `handle_unexpected_error` | FastAPI, CORS middleware, settings, routers, logging config | Uvicorn, tests | App title is `Compliance Label Assistant API`. |
| `backend/app/config.py` | Centralized environment configuration. | `Settings`, `get_settings` | `os`, dataclasses, `lru_cache` | routes, services, provider, tests | Only backend source that should read backend env vars. |
| `backend/app/constants.py` | Shared backend constants. | `STANDARD_GOVERNMENT_WARNING` | none | routes, verification tests | Server-owned government warning text. |
| `backend/app/schemas.py` | Pydantic API models and status literals. | `ExpectedFields`, `ExtractedFields`, `FieldResult`, `SingleVerificationResponse`, `BatchVerificationItem`, `BatchVerificationResponse` | Pydantic, typing literals | routes, services, verification | Defines public response shapes. |

## Routes

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/routes/__init__.py` | Marks routes package. | none | none | package imports | No runtime behavior. |
| `backend/app/routes/health.py` | Health endpoint. | `router`, `health_check` | FastAPI `APIRouter`, `get_settings` | `main.py` | Returns `status` and `service`. |
| `backend/app/routes/warmup.py` | Warmup endpoint. | `router`, `warmup` | FastAPI `APIRouter`, warmup service | `main.py` | Returns `{"status":"ok"}`. |
| `backend/app/routes/verification.py` | Single and batch verification endpoints plus form-to-model helper. | `router`, `verify_label`, `verify_batch` | FastAPI form/file types, schemas, services, provider/image errors, constants | `main.py` | Maps known exceptions to HTTP errors. |

## Services

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/services/__init__.py` | Marks services package. | none | none | package imports | No runtime behavior. |
| `backend/app/services/single_verification_service.py` | Single-label workflow orchestration. | `verify_single_label`, `process_single_label` | settings, upload validation, preprocessing, extraction, timing, verification rules, schemas | verification route, batch service | Builds `SingleVerificationResponse`. |
| `backend/app/services/batch_service.py` | Batch workflow orchestration and per-file error conversion. | `BatchRequestValidationError`, `validate_batch_request`, `validate_batch_filenames`, `verify_batch_labels` | asyncio, settings, single-label service, schemas, image/provider errors | verification route, tests | Rejects duplicate basenames before processing. |
| `backend/app/services/timing_service.py` | Timing helper functions. | `start_timer`, `get_elapsed_ms` | `time.perf_counter` | services | Returns elapsed integer milliseconds. |
| `backend/app/services/warmup_service.py` | Best-effort dependency warmup. | `warm_verification_dependencies` | settings, OpenAI client factory | warmup route, tests | Can make a model metadata request, but does not make extraction requests. |

## Image Processing

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/image_processing/__init__.py` | Marks image processing package. | none | none | package imports | No runtime behavior. |
| `backend/app/image_processing/validation.py` | Upload metadata, size, decoded image, MIME, format, and pixel validation. | `UploadValidationError`, constants, validation functions | FastAPI `UploadFile`, Pillow, `BytesIO`, `Path` | single service, route error handling, tests | Reads upload bytes and returns them after validation. |
| `backend/app/image_processing/preprocessor.py` | In-memory orientation, RGB conversion, resize, and JPEG compression. | `ImagePreprocessingError`, `PreprocessedImage`, `preprocess_image_for_extraction` | Pillow, `BytesIO`, validation description | single service, tests | Does not write image files to disk. |

## Provider Boundary

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/providers/__init__.py` | Marks providers package. | none | none | package imports | No runtime behavior. |
| `backend/app/providers/openai/__init__.py` | Marks OpenAI provider package. | none | none | package imports | No runtime behavior. |
| `backend/app/providers/openai/client.py` | Cached OpenAI client factory. | `get_openai_client`, `clear_openai_client_cache` | OpenAI SDK, settings, `lru_cache` | extraction module, warmup service, tests | Cache key includes key, timeout, and retries. |
| `backend/app/providers/openai/extraction.py` | OpenAI extraction execution, structured parsing, provider error mapping, extraction concurrency. | provider error classes, `extract_label_fields` | asyncio, base64, OpenAI SDK errors, Pydantic, settings, client factory, schemas | single service, tests | Returns `ExtractedFields`; `raw_text` is currently `null`. |

## Verification And Utilities

| Path | Purpose | Main exports | Main dependencies | Used by | Notes |
| --- | --- | --- | --- | --- | --- |
| `backend/app/verification/__init__.py` | Marks verification package. | none | none | package imports | No runtime behavior. |
| `backend/app/verification/results.py` | Field result construction helper. | `build_field_result` | schemas | verification rules | Thin helper around `FieldResult`. |
| `backend/app/verification/rules.py` | Deterministic comparison rules and overall status calculation. | field verification functions, `calculate_overall_status`, `verify_expected_fields` | constants, schemas, text normalization, result builder | single service, tests | Does not call provider or process images. |
| `backend/app/utils/__init__.py` | Marks utils package. | none | none | package imports | No runtime behavior. |
| `backend/app/utils/text_normalization.py` | Text cleanup, punctuation/quote normalization, similarity, ABV/proof/net-content parsing. | normalization and parsing helpers | `difflib`, `re`, `string` | verification rules, tests | Generic helpers only; field decisions live in `verification`. |
| `backend/app/utils/logging_config.py` | Logging setup. | `configure_logging` | logging | `main.py` | Keeps logging format centralized. |

## Tests

| Path | Purpose | Main dependencies | Notes |
| --- | --- | --- | --- |
| `backend/app/tests/__init__.py` | Marks tests package. | none | No runtime behavior. |
| `backend/app/tests/test_api_contract.py` | Tests route contracts, response fields, errors, and batch behavior. | FastAPI TestClient, schemas, settings, provider patching | Main API safety test file. |
| `backend/app/tests/test_batch_service.py` | Tests batch request validation, duplicate filename handling, partial failures, and concurrency. | asyncio, FastAPI UploadFile, schemas, settings | Patches single-label processing for service tests. |
| `backend/app/tests/test_config.py` | Tests settings defaults and image detail validation. | pytest monkeypatch, config | Covers speed/cost-sensitive defaults. |
| `backend/app/tests/test_file_validation.py` | Tests upload validation rules. | Pillow, UploadFile, pytest | Covers supported formats and rejection cases. |
| `backend/app/tests/test_image_preprocessor.py` | Tests preprocessing behavior. | Pillow, pytest, config, preprocessor | Covers resize, RGB JPEG output, quality, and defaults. |
| `backend/app/tests/test_openai_client.py` | Tests OpenAI client cache behavior. | provider client module, settings | Patches constructor behavior. |
| `backend/app/tests/test_openai_extraction_service.py` | Tests extraction configuration, provider call parameters, and safe error mapping. | OpenAI errors, settings, extraction module | Does not require real provider calls. |
| `backend/app/tests/test_text_normalization.py` | Tests text normalization and parsing helpers. | text normalization utilities | Covers ABV, proof, and net contents. |
| `backend/app/tests/test_verification_service.py` | Tests deterministic verification rules and overall status. | schemas, constants, verification rules | Covers brand, class or type, alcohol, net contents, warning, and optional fields. |
| `backend/app/tests/test_warmup_service.py` | Tests warmup behavior. | settings, warmup service | Covers key present, key missing, and swallowed errors. |

## Runtime And Dependency Files

| Path | Purpose | Notes |
| --- | --- | --- |
| `backend/requirements.txt` | Python dependencies. | See [dependency reference](dependency-reference.md). |
| `backend/runtime.txt` | Python runtime declaration. | `python-3.11.9`. |
| `backend/start.sh` | Uvicorn startup wrapper. | Uses `${PORT:-8000}`. |
| `backend/.env.example` | Safe backend env placeholder values. | Do not put real secrets here. |
