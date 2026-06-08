# Backend Environment Variables

## Source Of Truth

Backend runtime configuration is read in:

- `backend/app/config.py`

Placeholder values are listed in:

- `backend/.env.example`

Local real values belong in ignored `backend/.env`.

## Variables

| Name | Required | Secret | Default | Purpose | Related code |
| --- | --- | --- | --- | --- | --- |
| `OPENAI_API_KEY` | Required for verification extraction | Yes | empty string | Provider key used by backend provider code. | `backend/app/config.py`, `backend/app/providers/openai/extraction.py` |
| `OPENAI_MODEL` | Optional | No | `gpt-4.1-mini` | Provider model name. | `backend/app/config.py`, `backend/app/providers/openai/extraction.py` |
| `OPENAI_TIMEOUT_SECONDS` | Optional | No | `10` | Provider request timeout, bounded 2 to 30. | `backend/app/config.py`, `backend/app/providers/openai/client.py` |
| `OPENAI_IMAGE_DETAIL` | Optional | No | `low` | Provider image detail, allowed `low`, `auto`, `high`. | `backend/app/config.py`, `backend/app/providers/openai/extraction.py` |
| `OPENAI_MAX_RETRIES` | Optional | No | `0` | SDK retry count, bounded 0 to 2. | `backend/app/config.py`, `backend/app/providers/openai/client.py` |
| `OPENAI_EXTRACTION_CONCURRENCY` | Optional | No | `2` | Provider extraction semaphore size, bounded 1 to 4. | `backend/app/config.py`, `backend/app/providers/openai/extraction.py` |
| `MAX_FILE_SIZE_MB` | Optional | No | `5` | Upload byte-size limit. | `backend/app/config.py`, `backend/app/image_processing/validation.py` |
| `MAX_IMAGE_PIXELS` | Optional | No | `25000000` | Decoded image pixel-count limit. | `backend/app/config.py`, `backend/app/image_processing/validation.py` |
| `MAX_BATCH_SIZE` | Optional | No | `10` | `/verify-batch` maximum file count. | `backend/app/config.py`, `backend/app/services/batch_service.py` |
| `BATCH_CONCURRENCY` | Optional | No | `3` | `/verify-batch` per-file concurrency. | `backend/app/config.py`, `backend/app/services/batch_service.py` |
| `MAX_IMAGE_WIDTH` | Optional | No | `640` | Preprocessed JPEG maximum width, bounded 600 to 2000. | `backend/app/config.py`, `backend/app/image_processing/preprocessor.py` |
| `JPEG_QUALITY` | Optional | No | `60` | Preprocessed JPEG quality, bounded 50 to 95. | `backend/app/config.py`, `backend/app/image_processing/preprocessor.py` |
| `ALLOWED_ORIGINS` | Optional locally, required for deployed frontend access | No | `http://localhost:5173` | Comma-separated CORS origins. | `backend/app/config.py`, `backend/app/main.py` |

## Safe Example

```text
OPENAI_API_KEY=<OPENAI_API_KEY>
OPENAI_MODEL=gpt-4.1-mini
OPENAI_TIMEOUT_SECONDS=10
OPENAI_IMAGE_DETAIL=low
OPENAI_MAX_RETRIES=0
OPENAI_EXTRACTION_CONCURRENCY=2
MAX_FILE_SIZE_MB=5
MAX_IMAGE_PIXELS=25000000
MAX_BATCH_SIZE=10
BATCH_CONCURRENCY=3
MAX_IMAGE_WIDTH=640
JPEG_QUALITY=60
ALLOWED_ORIGINS=<FRONTEND_URL>
```

## Deployment

Configure backend variables in Render service environment settings. Do not expose `OPENAI_API_KEY` to Vercel or browser code.
