# Performance

Speed is handled through preprocessing, bounded work, and deterministic verification.

## Implemented Strategy

- Images are resized to `MAX_IMAGE_WIDTH` before extraction.
- Images are compressed to JPEG quality around 82 before OpenAI calls.
- The backend makes one OpenAI extraction call per image.
- Field comparison runs in deterministic Python code after extraction.
- The frontend queue verifies up to 5 labels and calls `/verify` once per ready queued item, with frontend concurrency capped at 2.
- Backend batch verification uses `BATCH_CONCURRENCY` with an asyncio semaphore when `/verify-batch` is used.
- Single and batch responses include processing time metrics.
- Uploaded files are not written to disk.

## Trade-Offs

- The main frontend queue is limited to 5 files to control latency and cost.
- The backend batch endpoint is limited to 10 files by default.
- The app uses live interactive OpenAI calls, not OpenAI's asynchronous Batch API.
- More detailed visual compliance checks, such as font size or placement, are deferred because they require additional image analysis beyond this prototype.
