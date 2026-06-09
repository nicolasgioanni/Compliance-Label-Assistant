# Performance And Cost

## Implemented Controls

Provider calls happen only in `backend/app/providers/openai/extraction.py`. The frontend never calls the provider directly.

Queue, batch, upload-size, pixel-count, timeout, and concurrency limits are the current lightweight cost and abuse controls. They do not replace production authentication or rate limiting.

Speed and cost-sensitive settings are centralized in `backend/app/config.py`:

| Setting | Default | Purpose |
| --- | ---: | --- |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Provider model name. |
| `OPENAI_TIMEOUT_SECONDS` | `10` | Provider request timeout, bounded from 2 to 30. |
| `OPENAI_IMAGE_DETAIL` | `low` | Image detail setting, allowed values `low`, `auto`, `high`. |
| `OPENAI_MAX_RETRIES` | `0` | SDK retry count, bounded from 0 to 2. |
| `OPENAI_EXTRACTION_CONCURRENCY` | `2` | Provider extraction concurrency, bounded from 1 to 4. |
| `OPENAI_NETWORK_WARMUP` | `true` | Enables a best-effort non-generation provider metadata request during warmup. |
| `OPENAI_WARMUP_TIMEOUT_SECONDS` | `2` | Warmup metadata request timeout, bounded from 1 to 5. |
| `MAX_IMAGE_WIDTH` | `640` | Preprocessed JPEG maximum width, bounded from 600 to 2000. |
| `JPEG_QUALITY` | `60` | Preprocessed JPEG quality, bounded from 50 to 95. |
| `BATCH_CONCURRENCY` | `3` | Backend `/verify-batch` per-file concurrency. |

## Image Preprocessing

Images are resized and compressed before provider calls. This reduces request payload size and provider work. Increasing `MAX_IMAGE_WIDTH`, `JPEG_QUALITY`, or `OPENAI_IMAGE_DETAIL` can improve extraction fidelity for small text, but may increase latency and provider usage.

## Concurrency

Frontend:

- Ready-label verification uses the `VERIFY_ALL_CONCURRENCY` setting. The current value is `2`.
- The frontend sends one `/verify` request per ready queued item.

Backend:

- Provider extraction uses a semaphore keyed by event loop and configured concurrency.
- `/verify-batch` uses an `asyncio.Semaphore` based on `BATCH_CONCURRENCY`.

## Caching

Implemented:

- OpenAI client objects are cached by API key, timeout, and retry settings in `backend/app/providers/openai/client.py`.
- The frontend calls `/warmup` once after the first successful queue addition. The backend builds the cached provider client and, when enabled, makes one model metadata request to warm the authenticated network path.

Warmup notes:

- Warmup does not upload label files, send prompts, send expected fields, or call extraction.
- The metadata request is not an image extraction or generation request, but it can still count as an API request and can be rate-limited.
- Warmup may reduce first-verification setup latency. It cannot eliminate provider/model tail latency.

Not implemented:

- No extraction result cache.
- No persisted uploaded file cache.
- No persistent result cache.

## Duplicate Work

The frontend avoids duplicate queue entries by basename. The backend `/verify-batch` rejects duplicate basenames before processing. The system does not deduplicate repeat verifications of the same image after expected data changes or reruns.

## Safe Optimization Areas

- Add a test-only provider stub for manual local workflows that should not make provider calls. Not currently documented in code.
- Add request-level extraction cache only if retention, privacy, and invalidation rules are explicitly defined.
- Tune image detail, width, and JPEG quality against representative labels before changing defaults.

## Do Not Change Casually

- Provider model and image detail defaults.
- Retry count and timeout.
- Image resize and compression defaults.
- Frontend or backend concurrency limits.
- Any behavior that would log image payloads or provider request bodies.
