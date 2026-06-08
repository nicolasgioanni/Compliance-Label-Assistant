# Backend Testing

## Commands

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m ruff check app
.\.venv\Scripts\python.exe -c "from app.main import app; print(app.title)"
```

## Test Files

| File | Coverage |
| --- | --- |
| `backend/app/tests/test_api_contract.py` | Health, warmup, `/verify`, `/verify-batch`, error mapping, response contracts. |
| `backend/app/tests/test_batch_service.py` | Batch validation, duplicate detection, partial failures, concurrency limits. |
| `backend/app/tests/test_config.py` | Configuration defaults, bounds, and allowed image detail values. |
| `backend/app/tests/test_file_validation.py` | Upload extension, MIME type, decoded format, size, empty file, corrupt image, pixel count validation. |
| `backend/app/tests/test_image_preprocessor.py` | Resize, RGB JPEG conversion, EXIF-safe processing, JPEG quality, preprocessing defaults. |
| `backend/app/tests/test_openai_client.py` | OpenAI client cache behavior. |
| `backend/app/tests/test_openai_extraction_service.py` | Missing key, provider call parameters, provider error mapping. |
| `backend/app/tests/test_text_normalization.py` | Case, punctuation, quote, whitespace, ABV, proof, and net-content helpers. |
| `backend/app/tests/test_verification_service.py` | Field verification and overall status rules. |
| `backend/app/tests/test_warmup_service.py` | Warmup client initialization and safe failures. |

## Missing

No backend typecheck command is configured.

No coverage command is configured.

## Test Provider Calls

Existing provider tests patch provider interactions and should not require real provider requests.
