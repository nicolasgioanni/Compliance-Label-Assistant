# Performance

Speed is handled through preprocessing, bounded work, and deterministic verification.

## Implemented Strategy

- Images are resized to `MAX_IMAGE_WIDTH` before extraction.
- Images are compressed to configured `JPEG_QUALITY` before OpenAI calls.
- OpenAI clients are cached by backend API key, timeout, and retry settings to avoid repeated SDK setup overhead.
- OpenAI image detail defaults to `low` so the model uses a faster, lower-cost image processing path.
- OpenAI SDK retries default to `0` so slow calls do not hide behind retry delays.
- OpenAI extraction asks only for the fields needed by deterministic comparison, not a full raw text transcript.
- The backend makes one OpenAI extraction call per image.
- Field comparison runs in deterministic Python code after extraction.
- The frontend queue supports up to 10 labels and calls `/verify` once per ready queued item, with frontend concurrency capped at 2.
- Backend OpenAI extraction concurrency is capped with `OPENAI_EXTRACTION_CONCURRENCY`.
- Backend batch verification uses `BATCH_CONCURRENCY` with an asyncio semaphore when `/verify-batch` is used.
- Single and batch responses include validation, preprocessing, extraction, verification, and total processing time metrics.
- Uploaded files are not written to disk.
- Extraction results are not cached or persisted. The only backend cache is OpenAI SDK client reuse in memory.

## Trade-Offs

- The main frontend queue is limited to 10 files to control latency and cost.
- The backend batch endpoint is limited to 10 files by default.
- The app uses live interactive OpenAI calls, not OpenAI's asynchronous Batch API.
- The app intentionally does not cache OpenAI extraction results. A cache could reduce repeated-image cost and latency,
  but it would add cache-key, invalidation, retention, and deployment complexity that is not justified for the MVP.
- A file-backed extraction cache is a poor fit for the planned Render Starter backend unless a persistent disk is added;
  adding a disk would make deployment and scaling tradeoffs more complex. The current design remains stateless across
  deploys and restarts except for ordinary in-process client reuse.
- Smaller images, low image detail, and field-only extraction favor speed and cost, but tiny warning text may still
  require `OPENAI_IMAGE_DETAIL=auto` or `high`, larger `MAX_IMAGE_WIDTH`, or higher `JPEG_QUALITY`. Validate any
  tuning with representative labels.
- The app is optimized toward a sub-5 second target on clean representative labels, but actual latency depends on
  image quality, network conditions, model latency, and OpenAI response time.
- More detailed visual compliance checks, such as font size or placement, are deferred because they require additional image analysis beyond this prototype.

## Future Notes

- Prefer keeping the deployed prototype stateless: Vercel serves the frontend, Render runs the FastAPI backend, and the
  backend does not store uploaded images or extracted label text.
- Revisit extraction caching only if real usage shows repeated verification of the same images is common enough to
  justify a separate design for storage, cache keys, expiration, privacy, and invalidation.
- If caching is revisited, start with an explicitly bounded in-memory cache for a single backend instance before adding
  any persistent datastore. Do not include expected application fields in an extraction cache key; extraction is
  image/provider-config dependent, while verification is deterministic and expected-field dependent.
