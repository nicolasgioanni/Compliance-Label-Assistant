# Extraction And Verification Flow

## Purpose

Extraction and verification are deliberately separate. Provider code extracts visible label fields from a preprocessed image. Verification code compares those extracted values against expected data using deterministic rules.

## Modules

- Extraction provider: `backend/app/providers/openai/extraction.py`
- Provider client factory: `backend/app/providers/openai/client.py`
- Field rules: `backend/app/verification/rules.py`
- Field result builder: `backend/app/verification/results.py`
- Text helpers: `backend/app/utils/text_normalization.py`

## Extracted Fields

`ExtractedFields` contains:

- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `government_warning_text`
- `raw_text`

The current provider parser sets `raw_text` to `null`.

## Expected Fields

`ExpectedFields` contains:

- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `government_warning`

The route accepts `government_warning` for API compatibility, but `_build_expected_fields` replaces it with the backend standard warning from `backend/app/constants.py`.

## Deterministic Rules

Brand name:

- Passes exact, capitalization-normalized, spacing-normalized, capitalization-and-spacing-normalized, or safe punctuation-normalized matches.
- Uses similarity threshold `BRAND_REVIEW_THRESHOLD = 0.88` for reviewable near matches.
- Marks missing values as `missing` and conflicts as `fail`.

Class/type:

- Passes exact or capitalization-and-spacing-normalized matches.
- Marks partial token containment or similarity above `CLASS_REVIEW_THRESHOLD = 0.82` as `needs_review`.
- Marks missing values as `missing` and conflicts as `fail`.

Alcohol content:

- Parses ABV from percent notation.
- Parses proof from `proof` or `prf`.
- Treats ABV and proof as equivalent when numerically consistent.
- Uses `ABV_TOLERANCE = 0.1` and `PROOF_TOLERANCE = 0.2`.

Net contents:

- Normalizes milliliters and liters to milliliters.
- Uses `NET_CONTENTS_TOLERANCE_ML = 0.5`.

Government warning:

- Requires the extracted warning to start with uppercase `GOVERNMENT WARNING`.
- Compares against the backend standard warning text.
- Marks punctuation, capitalization, or high-similarity differences as `needs_review` when they are not safe passes.

## Response Construction

`process_single_label` combines:

- `filename`
- `expected_fields`
- `extracted_fields`
- `field_results`
- `overall_status`
- timing metrics
- preprocessed image metadata
- `message`
- `error`

Batch responses wrap the same per-file shape in `BatchVerificationResponse`.
