# Performance

Speed is handled through preprocessing, bounded work, and deterministic verification.

## Implemented Strategy

- Images are resized to `MAX_IMAGE_WIDTH` before extraction.
- Images are compressed to configured `JPEG_QUALITY` before OpenAI calls.
- OpenAI clients are cached by backend API key, timeout, and retry settings to avoid repeated SDK setup overhead.
- OpenAI SDK retries default to `0` so slow calls do not hide behind retry delays.
- OpenAI extraction asks only for the fields needed by deterministic comparison, not a full raw text transcript.
- The backend makes one OpenAI extraction call per image.
- Field comparison runs in deterministic Python code after extraction.
- The frontend queue supports up to 10 labels and calls `/verify` once per ready queued item, with frontend concurrency capped at 2.
- Backend OpenAI extraction concurrency is capped with `OPENAI_EXTRACTION_CONCURRENCY`.
- Backend batch verification uses `BATCH_CONCURRENCY` with an asyncio semaphore when `/verify-batch` is used.
- Single and batch responses include validation, preprocessing, extraction, verification, and total processing time metrics.
- Uploaded files are not written to disk.

## Trade-Offs

- The main frontend queue is limited to 10 files to control latency and cost.
- The backend batch endpoint is limited to 10 files by default.
- The app uses live interactive OpenAI calls, not OpenAI's asynchronous Batch API.
- Smaller images and field-only extraction favor speed and cost, but tiny warning text may still require larger
  `MAX_IMAGE_WIDTH` or higher `JPEG_QUALITY`. Validate any tuning with representative labels.
- The app is optimized toward a sub-5 second target on clean representative labels, but actual latency depends on
  image quality, network conditions, model latency, and OpenAI response time.
- More detailed visual compliance checks, such as font size or placement, are deferred because they require additional image analysis beyond this prototype.
