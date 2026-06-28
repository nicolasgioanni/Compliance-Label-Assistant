# Configuration

## Source Of Truth

Backend configuration is centralized in:

- `backend/app/config.py`

Routes and services should import settings from this module instead of reading environment variables directly.

## Settings

`Settings` is a frozen dataclass with:

- `service_name`
- `openai_api_key`
- `openai_model`
- `openai_timeout_seconds`
- `openai_image_detail`
- `openai_max_retries`
- `openai_extraction_concurrency`
- `openai_max_output_tokens`
- `openai_network_warmup`
- `openai_warmup_timeout_seconds`
- `verification_rate_limit_enabled`
- `verification_daily_unit_limit`
- `verification_rate_limit_window_seconds`
- `max_file_size_mb`
- `max_image_pixels`
- `max_batch_size`
- `batch_concurrency`
- `max_image_width`
- `jpeg_quality`
- `allowed_origins`

## Helpers

- `_read_int`: reads an integer with fallback default.
- `_read_bounded_int`: reads an integer and clamps it between minimum and maximum.
- `_read_bool`: reads common boolean strings with fallback default.
- `_read_choice`: reads a string and falls back to default unless it is allowed.
- `_read_origins`: splits `ALLOWED_ORIGINS` on commas and trims blanks.
- `get_settings`: returns cached `Settings`.

## Defaults And Bounds

| Setting | Default | Bounds or allowed values |
| --- | ---: | --- |
| `OPENAI_MODEL` | `gpt-4.1-mini` | Any string. |
| `OPENAI_TIMEOUT_SECONDS` | `10` | 2 to 30. |
| `OPENAI_IMAGE_DETAIL` | `low` | `low`, `auto`, `high`. |
| `OPENAI_MAX_RETRIES` | `0` | 0 to 2. |
| `OPENAI_EXTRACTION_CONCURRENCY` | `2` | 1 to 4. |
| `OPENAI_MAX_OUTPUT_TOKENS` | `500` | 1 to 2000. |
| `OPENAI_NETWORK_WARMUP` | `true` | Common boolean values. |
| `OPENAI_WARMUP_TIMEOUT_SECONDS` | `2` | 1 to 5. |
| `VERIFICATION_RATE_LIMIT_ENABLED` | `true` | Common boolean values. |
| `VERIFICATION_DAILY_UNIT_LIMIT` | `50` | 1 to 10000. |
| `VERIFICATION_RATE_LIMIT_WINDOW_SECONDS` | `86400` | 60 to 604800. |
| `MAX_FILE_SIZE_MB` | `5` | Integer; no explicit bound. |
| `MAX_IMAGE_PIXELS` | `25000000` | Integer; values above 0 enforce a limit. |
| `MAX_BATCH_SIZE` | `10` | Integer; used by batch request validation. |
| `BATCH_CONCURRENCY` | `3` | Integer; service uses at least 1. |
| `MAX_IMAGE_WIDTH` | `640` | 600 to 2000. |
| `JPEG_QUALITY` | `60` | 50 to 95. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated origins. |

## Local Examples

Use `backend/.env.example` as a placeholder template. Do not copy real secret values into committed files.
