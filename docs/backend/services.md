# Backend Services

## Purpose

Service modules coordinate workflows and keep route handlers thin.

## `single_verification_service.py`

Exports:

- `verify_single_label(file, expected_fields)`
- `process_single_label(file, expected_fields, settings)`

Responsibilities:

- Read active settings.
- Validate upload bytes.
- Preprocess image bytes.
- Call `extract_label_fields`.
- Call `verify_expected_fields`.
- Build `SingleVerificationResponse`.
- Measure validation, preprocessing, extraction, verification, and total processing time.

Called by:

- `backend/app/routes/verification.py`
- `backend/app/services/batch_service.py`

## `batch_service.py`

Exports:

- `BatchRequestValidationError`
- `validate_batch_request`
- `validate_batch_filenames`
- `verify_batch_labels`

Responsibilities:

- Require at least 2 files.
- Enforce `settings.max_batch_size`.
- Reject duplicate basenames case-insensitively.
- Run per-file processing through `process_single_label`.
- Limit concurrent work with `settings.batch_concurrency`.
- Convert per-file failures into `BatchVerificationItem` error results.
- Build status counts for `pass`, `fail`, and `error`.

## `warmup_service.py`

Exports:

- `warm_verification_dependencies(settings=None)`

Responsibilities:

- Read active settings when not supplied.
- Skip when no provider key exists.
- Initialize the cached OpenAI client when possible.
- Optionally make one non-generation model metadata request to warm the provider network path.
- Never send image files, provider request content, expected fields, or extraction payloads.
- Swallow warmup failures because warmup is best effort.
- Runs provider network warmup at most once per model per backend process.

## `rate_limit_service.py`

Exports:

- `DAILY_VERIFICATION_LIMIT_MESSAGE`
- `VerificationRateLimitError`
- `reserve_verification_units(unit_cost, settings=None)`
- `build_rate_limit_headers(result)`
- `reset_verification_rate_limiter()`

Responsibilities:

- Reserve process-local daily verification units before OpenAI extraction can run.
- Raise a safe rate-limit error when the daily cap is exhausted.
- Build standard rate-limit response headers for routes.
- Provide a reset helper for tests.

## `timing_service.py`

Exports:

- `start_timer()`
- `get_elapsed_ms(start_time)`

Uses `time.perf_counter()` and returns integer milliseconds.

## Service Boundaries

Services should orchestrate workflow only. They should not contain HTTP form parsing, provider-specific payload details, deterministic comparison logic, or image validation implementation details.
