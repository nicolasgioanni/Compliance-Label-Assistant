# Deployment Environment Variables

## Frontend: Vercel

| Name | Required | Secret | Safe example | Purpose |
| --- | --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes for deployed frontend | No | `<BACKEND_URL>` | Backend API base URL used by browser requests. |

## Backend: Render

| Name | Required | Secret | Safe example | Purpose |
| --- | --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes for extraction-backed verification | Yes | `<OPENAI_API_KEY>` | Backend provider key. |
| `OPENAI_MODEL` | Optional | No | `gpt-4.1-mini` | Provider model name. |
| `OPENAI_TIMEOUT_SECONDS` | Optional | No | `10` | Provider timeout. |
| `OPENAI_IMAGE_DETAIL` | Optional | No | `low` | Provider image detail. |
| `OPENAI_MAX_RETRIES` | Optional | No | `0` | SDK retry count. |
| `OPENAI_EXTRACTION_CONCURRENCY` | Optional | No | `2` | Provider extraction concurrency. |
| `MAX_FILE_SIZE_MB` | Optional | No | `5` | Upload file-size limit. |
| `MAX_IMAGE_PIXELS` | Optional | No | `25000000` | Decoded image pixel limit. |
| `MAX_BATCH_SIZE` | Optional | No | `10` | Backend batch size limit. |
| `BATCH_CONCURRENCY` | Optional | No | `3` | Backend batch processing concurrency. |
| `MAX_IMAGE_WIDTH` | Optional | No | `640` | Preprocessed image width. |
| `JPEG_QUALITY` | Optional | No | `60` | Preprocessed JPEG quality. |
| `ALLOWED_ORIGINS` | Yes for browser access | No | `<FRONTEND_URL>` | Comma-separated CORS origins. |

## Local Development

Local ignored files:

- `backend/.env`
- `frontend/.env`

Example files:

- `backend/.env.example`
- `frontend/.env.example`

Never commit real secret values.
