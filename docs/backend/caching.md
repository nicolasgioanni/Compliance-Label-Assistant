# Caching

## Implemented Cache

`backend/app/providers/openai/client.py` caches OpenAI client objects with `functools.lru_cache`.

Cache key:

- API key
- timeout seconds
- max retries

Purpose:

- Avoid repeated SDK client construction for identical settings.

## Test Cache Reset

`clear_openai_client_cache()` clears the cached clients for tests that patch the OpenAI constructor.

## Not Implemented

The current code does not implement:

- Extraction result caching.
- Uploaded image caching.
- Persistent response caching.
- Database-backed cache.
- Browser local-storage cache.

## Operational Notes

Repeat verification of the same image can make another provider call. This is current behavior.

Do not add persistent caching without defining retention, privacy, invalidation, and testing expectations.
