# Schemas And Models

## Location

`backend/app/schemas.py`

## Status Types

Field statuses:

- `pass`
- `normalized_match`
- `fail`
- `missing`
- `needs_review`
- `error`

Overall statuses:

- `pass`
- `fail`
- `error`

## Models

### `ExpectedFields`

Fields:

- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning`

Used by routes and services to represent expected application data.

### `ExtractedFields`

Fields:

- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `bottler_producer`
- `country_of_origin`
- `government_warning_text`
- `raw_text`

All fields are nullable and default to `null`.

### `FieldResult`

Fields:

- `field_name`
- `expected`
- `found`
- `status`
- `reason`
- `confidence`

`confidence` is constrained to `0 <= confidence <= 1`.

### `SingleVerificationResponse`

Fields:

- `filename`
- `overall_status`
- `expected_fields`
- `extracted_fields`
- `field_results`
- `processing_time_ms`
- `validation_time_ms`
- `preprocessing_time_ms`
- `extraction_time_ms`
- `verification_time_ms`
- `preprocessed_image_bytes`
- `preprocessed_image_width`
- `message`
- `error`

### `BatchVerificationItem`

Extends `SingleVerificationResponse` for per-file batch results.

### `BatchVerificationResponse`

Fields:

- `mode`
- `total_labels`
- `completed`
- `status_counts`
- `total_processing_time_ms`
- `results`

`mode` is always `batch`.
