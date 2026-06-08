# Verification

## Location

`backend/app/verification/`

## Purpose

Verification modules compare extracted fields against expected application data using deterministic code. They do not call the provider, read image bytes, or make final legal determinations.

## Files

| File | Purpose |
| --- | --- |
| `backend/app/verification/rules.py` | Field-level comparison rules and overall status resolution. |
| `backend/app/verification/results.py` | Helper for constructing `FieldResult` models. |

## Rule Inputs

`verify_expected_fields(expected_fields, extracted_fields)` accepts:

- `ExpectedFields`
- `ExtractedFields`

## Field Behavior

Brand name:

- Exact, capitalization, spacing, capitalization-and-spacing, and safe punctuation normalization can pass.
- Ambiguous punctuation differences can produce `normalized_match`.
- High similarity can produce `needs_review`.

Class/type:

- Exact and capitalization-and-spacing-normalized matches pass.
- Partial token containment and high similarity can produce `needs_review`.

Alcohol content:

- Parses ABV from percent values.
- Parses proof from `proof` or `prf`.
- Allows ABV/proof equivalence when values are numerically consistent.

Net contents:

- Normalizes milliliters and liters.
- Compares normalized milliliter values.

Government warning:

- Requires uppercase heading.
- Compares against `STANDARD_GOVERNMENT_WARNING`.
- Uses review statuses for similar or punctuation/capitalization differences that do not pass.

## Optional Expected Fields

`verify_expected_fields` always checks brand name and government warning. It skips class/type, alcohol content, and net contents when the expected value is blank.

## Overall Status

`calculate_overall_status` returns:

- `error` when any field is `error`.
- `fail` when any field is `fail`.
- `needs_review` when any field is `missing`, `needs_review`, or `normalized_match`.
- `pass` otherwise.

## Related Tests

- `backend/app/tests/test_verification_service.py`
- `backend/app/tests/test_text_normalization.py`
- `backend/app/tests/test_api_contract.py`
