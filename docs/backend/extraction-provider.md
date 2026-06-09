# Extraction Provider

## Location

`backend/app/providers/openai/`

## Purpose

Provider modules contain OpenAI-specific code. They convert preprocessed JPEG bytes into a provider request, parse structured output, and return `ExtractedFields` for deterministic verification.

## Client Factory

File: `backend/app/providers/openai/client.py`

Exports:

- `get_openai_client(settings)`
- `clear_openai_client_cache()`

Behavior:

- Caches OpenAI clients by API key, timeout, and retry settings.
- Uses `settings.openai_api_key`, `settings.openai_timeout_seconds`, and `settings.openai_max_retries`.
- `clear_openai_client_cache` exists for tests.

## Extraction Module

File: `backend/app/providers/openai/extraction.py`

Exports:

- `ExtractionConfigurationError`
- `ExtractionServiceError`
- `InvalidExtractionResponseError`
- `extract_label_fields(image_bytes, settings=None)`

Internal behavior:

- Fails with `ExtractionConfigurationError` when `OPENAI_API_KEY` is missing.
- Base64-encodes preprocessed JPEG bytes as a data URL.
- Sends the configured model and image detail.
- Uses structured parsing into an internal `_ExtractionFields` model.
- Converts parsed output into public `ExtractedFields`.
- Maps connection, timeout, rate limit, provider status, and SDK errors to safe user-facing messages.
- Uses a per-event-loop semaphore keyed by `OPENAI_EXTRACTION_CONCURRENCY`.

## Output Fields

The provider boundary returns:

- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning_text`
- `raw_text`

Current code sets `raw_text` to `null`.

## Security Notes

- Provider key stays in backend settings.
- The frontend never receives provider secrets.
- Do not log request image bytes, base64 payloads, provider keys, or full provider responses.

## Testing

Tests in `backend/app/tests/test_openai_client.py` and `backend/app/tests/test_openai_extraction_service.py` cover client caching, missing configuration, provider call parameters, response parsing, and safe error mapping.
