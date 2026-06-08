# Backend Folder Structure

## Repository Location

```text
backend/
|-- app/
|   |-- image_processing/
|   |-- providers/
|   |-- routes/
|   |-- services/
|   |-- tests/
|   |-- utils/
|   |-- verification/
|   |-- config.py
|   |-- constants.py
|   |-- main.py
|   `-- schemas.py
|-- requirements.txt
|-- runtime.txt
`-- start.sh
```

## Source Folders

| Path | Purpose |
| --- | --- |
| `backend/app/image_processing` | Upload validation and in-memory image preprocessing. |
| `backend/app/providers/openai` | OpenAI client reuse, extraction call, response parsing, and provider error mapping. |
| `backend/app/routes` | FastAPI route handlers. |
| `backend/app/services` | Workflow orchestration for single, batch, warmup, and timing flows. |
| `backend/app/tests` | Pytest tests for routes, services, config, provider, validation, preprocessing, and verification. |
| `backend/app/utils` | Generic helpers for logging and text normalization. |
| `backend/app/verification` | Deterministic comparison rules and field result construction. |

## Generated And Ignored Backend Folders

These are not documented in detail:

- `backend/.venv/`
- `backend/.pytest_cache/`
- `backend/.ruff_cache/`
- `__pycache__/`
- local log files
- local `.env` files with real values

## Where To Start

- App setup: `backend/app/main.py`
- Routes: `backend/app/routes/verification.py`
- Single-label workflow: `backend/app/services/single_verification_service.py`
- Batch workflow: `backend/app/services/batch_service.py`
- Provider boundary: `backend/app/providers/openai/extraction.py`
- Verification rules: `backend/app/verification/rules.py`
- Config: `backend/app/config.py`
