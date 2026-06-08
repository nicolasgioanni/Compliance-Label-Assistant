# Compliance Label Assistant Prototype Plan

## Summary

- Build the monorepo from the current placeholder repo into `/frontend`, `/backend`, `docs`, and `sample-data`.
- Implement the product framing consistently: AI extracts visible label text, backend code verifies fields, and a human agent makes the final compliance judgment.
- Use the corrected Render command everywhere: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Include results export because it is small, useful, and requested as a stretch feature. Defer CSV import until larger filename-mapped batches are needed.

## Key Changes

- Backend: FastAPI app with thin routes for `GET /health`, `POST /verify`, and `POST /verify-batch`; centralized settings in `config.py`; CORS from `ALLOWED_ORIGINS`; no file persistence.
- Backend services: isolate image preprocessing, OpenAI extraction, deterministic verification, batch orchestration, timing, response building, file validation, logging, and text normalization. Add one small shared label-processing helper if needed to keep routes thin.
- OpenAI extraction: use backend-only OpenAI SDK with one vision call per image, base64 image input, short extraction-only prompt, structured JSON output, timeout, and one retry. Use the current OpenAI Python SDK syntax for Responses API image input and Structured Outputs. Prefer schema-enforced structured output with a Pydantic model when practical. Verify the exact SDK syntax during implementation instead of relying on stale examples.
- Verification: expose lowercase API status values: `pass`, `normalized_match`, `fail`, `missing`, `needs_review`, `error`; roll any `fail` to overall `fail`, errors to `error`, unclear/missing cases to `needs_review`, and harmless normalized matches to `pass`.
- Frontend: React/Vite one-page UI with a unified label queue, upload control, per-label expected fields form, standard warning button, API client, queue summary, field cards, selected detail view, raw extracted text panel, results export, and friendly error banner.
- Future CSV import: allow a spreadsheet with `filename`, `brand_name`, `class_type`, `alcohol_content`, `net_contents`, and `government_warning` to prefill queued labels by exact filename match before verification.

## API And Behavior

- `POST /verify` accepts `file`, `brand_name`, `class_type`, `alcohol_content`, `net_contents`, and `government_warning`; returns one `SingleVerificationResponse`.
- `POST /verify-batch` accepts `files[]` plus the same expected fields; supports 2-10 files, shared expected values, concurrency `3`, partial per-file errors, and total timing.
- Single response shape: `filename`, `overall_status`, `expected_fields`, `extracted_fields`, `field_results`, `processing_time_ms`, `extraction_time_ms`, `verification_time_ms`, and optional `error`.
- Batch response shape: `total_labels`, `status_counts`, `total_processing_time_ms`, and `results` using the same per-file shape as single verification.
- File validation rejects empty files, oversized files, excessive pixel counts, bad extensions, bad MIME types, decoded format mismatches, duplicate batch basenames, excessive batch size, and images Pillow cannot open.

## Verification Rules

- Brand/class: exact and harmless normalized case, whitespace, line-break, and safe punctuation matches are `pass`; ambiguous punctuation or high similarity is reviewable; clear conflict is `fail`; absent found value is `missing`.
- Alcohol content: parse ABV and proof; treat `45%`, `45% ABV`, `45% Alc./Vol.`, and `90 Proof` as equivalent; wrong ABV/proof fails.
- Net contents: normalize `750 mL`, `750ml`, `750 milliliters`, and `0.75 L` to the same milliliter value; different quantities fail.
- Government warning: require exact uppercase `GOVERNMENT WARNING` heading before any normalized comparison; title-case, lowercase, or mixed-case headings fail. Full statement wording is compared against the backend standard warning text, with punctuation or body capitalization uncertainty marked reviewable rather than passed. Missing warning is missing; bold/font/placement checks are documented as limitations.

## Test Plan

- Backend unit tests for text normalization, brand/class matching, ABV/proof equivalence, net contents conversion, government warning checks, file validation, duplicate batch handling, and API contract.
- API tests mock the extraction service so no test requires a real OpenAI API call.
- Frontend automated tests cover upload controls, file metadata validation, queue duplicate planning, and mixed upload warning behavior. Build verification remains `npm run build`.
- Manual frontend smoke tests cover browser folder picker behavior, health check, one-label queue verification, multi-label queue verification, item selection, extracted text rendering, errors, and results export.
- Final self-audit: confirm route thinness, backend-only API key, configurable CORS/limits/model, image compression, batch concurrency, no sensitive logging, no permanent storage, and docs matching implemented behavior.

## Assumptions

- The frontend queue supports separate expected application data per label.
- Backend `/verify-batch` uses one shared expected application dataset for all uploaded labels.
- No authentication, database, COLA integration, generated sample images, or final legal compliance engine.
- `sample-data/labels` will include a README only; expected-value JSON samples will be created.
- Docs will state live demo URLs as placeholders unless deployment URLs are provided later.
- If `OPENAI_API_KEY` is missing, `/verify` should fail cleanly with a user-facing setup/configuration error. The frontend should show this clearly instead of crashing.
