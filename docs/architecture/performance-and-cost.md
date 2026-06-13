# Performance and Cost

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

## Representative Benchmark Targets

The values below are target placeholders for reviewer-facing benchmark reporting. They are not measured results and should be replaced with measurements from a final benchmark run before release. These targets are separate from the historical README smoke-test timing notes.

Provider-backed timings should be reviewed separately from backend-only, static frontend, upload validation, CSV export, and unsupported-file validation checks because provider latency can dominate end-to-end review time.

Required CI tests mock provider behavior and do not run provider-backed benchmarks. Coverage, lint, typecheck, build, and contract tests protect merge quality, but they are not evidence of live provider latency, extraction accuracy, or production cost. Provider-backed measurements should stay in separate benchmark runs with explicit fixtures and documented environment settings.

| Benchmark Area | Target Placeholder |
| --- | ---: |
| Static frontend Lighthouse performance | >= 90 |
| Static frontend Lighthouse accessibility | >= 95 |
| Frontend lint, typecheck, and production build | 0 blocking errors |
| Backend non-provider API response time | p95 <= 500 ms |
| Upload validation response | p95 <= 2.0 s for representative supported files |
| Provider-backed extraction completion | p95 <= 45 s for representative label images |
| Structured result parse success | >= 98% on supported reviewer test labels |
| Field-level extraction agreement | >= 90% on curated benchmark labels |
| CSV export generation | p95 <= 500 ms for representative exports |
| Formula-neutralized CSV export | 100% neutralization for formula-risk prefixes |
| Unsupported-file handling | 100% controlled validation errors for known unsupported cases |
| Estimated provider cost | Placeholder target <= $0.10 per representative label review |

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

- Warmup does not upload label files, send provider request content, send expected fields, or call extraction.
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
