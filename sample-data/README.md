# Sample Label Fixtures

This folder contains synthetic alcohol label images for manual smoke testing and deterministic backend fixture tests.

## How To Use These Manually

1. Start the backend and frontend as described in [../docs/take-home/setup-and-run.md](../docs/take-home/setup-and-run.md).
2. Open the frontend at `http://localhost:5173`.
3. Upload one or more images from [images/](images/).
4. Select a queued image and enter the fields from the table below.
5. Run verification and compare the result with the expected current prototype result.

The current prototype verifies these fields:

- Brand name
- Class or type
- Alcohol content
- Net contents
- Government warning text

The current prototype does not verify bottler or producer information, and it does not verify country of origin. Those fields appear only as fixture context.

## Standard Government Warning

The frontend supplies the standard government warning by default. For direct API testing, use:

```text
GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.
```

## Manual Test Matrix

| Case | Image | Brand name | Class or type | Alcohol content | Net contents | Expected current prototype result | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC01 | `images/tc01_valid_bourbon.png` | `OLD TOM DISTILLERY` | `Kentucky Straight Bourbon Whiskey` | `45% Alc./Vol. (90 Proof)` | `750 mL` | `pass` | Baseline case where all supported fields match. |
| TC02 | `images/tc02_brand_case_normalization.png` | `Stone's Throw` | `American Single Malt Whiskey` | `46% Alc./Vol. (92 Proof)` | `750 mL` | `pass` | Label brand is uppercase; expected field uses title case. |
| TC03 | `images/tc03_abv_mismatch.png` | `RIVER BEND VODKA` | `Vodka` | `45% Alc./Vol. (90 Proof)` | `750 mL` | `fail` | Label shows `40% Alc./Vol. (80 Proof)`, so alcohol content should fail. |
| TC04 | `images/tc04_missing_government_warning.png` | `MOUNTAIN PEAK GIN` | `Distilled Gin` | `43% Alc./Vol. (86 Proof)` | `750 mL` | `fail` | Label does not include the standard warning text. |
| TC05 | `images/tc05_warning_header_wrong_case.png` | `LAKEHOUSE MERLOT` | `Merlot Red Wine` | `13.5% Alc./Vol.` | `750 mL` | `fail` | Label uses `Government Warning:` instead of uppercase `GOVERNMENT WARNING:`. |
| TC06 | `images/tc06_net_contents_mismatch.png` | `NORTH STAR RUM` | `Aged Rum` | `42% Alc./Vol. (84 Proof)` | `750 mL` | `fail` | Label shows `700 mL`, so net contents should fail. |
| TC07 | `images/tc07_class_type_mismatch.png` | `GOLDEN BARREL` | `Vodka` | `35% Alc./Vol. (70 Proof)` | `750 mL` | `fail` | Label shows `Spiced Rum`, so class or type should fail. |
| TC08 | `images/tc08_country_origin_mismatch.png` | `HIGHLAND VALE` | `Single Malt Scotch Whisky` | `40% Alc./Vol. (80 Proof)` | `750 mL` | `pass` | Country of origin differs in fixture context, but country of origin is not currently verified. |
| TC09 | `images/tc09_valid_wine_rotated_glare.png` | `SUNSET RIDGE CHARDONNAY` | `Chardonnay White Wine` | `14.2% Alc./Vol.` | `750 mL` | `pass` | Rotated/glare image. Manual result may depend on provider extraction quality. |
| TC10 | `images/tc10_multiple_errors_low_light.png` | `BLUE HARBOR SILVER` | `Tequila Blanco` | `40% Alc./Vol. (80 Proof)` | `750 mL` | `fail` | Low-light image with multiple supported-field mismatches. |

## Automated Test Data

[expected_outputs.json](expected_outputs.json) is used by `backend/app/tests/test_sample_fixtures.py`.

The automated tests do not call the extraction provider. Instead, they:

1. Upload the real PNG fixture to `POST /verify`.
2. Mock extracted fields from `expected_outputs.json`.
3. Run real upload validation, image preprocessing, route handling, response construction, and deterministic verification.
4. Assert the current prototype overall status and field-level statuses.

This keeps the tests deterministic while still validating that the fixture files, route contract, and verification rules work together.

## Fixture Scope

- These images are synthetic and are not legal advice.
- These fixtures are for prototype evaluation and regression testing.
- Provider extraction can vary during manual testing, especially on rotated, glared, or low-light images.
- TC08 is intentionally included as future-scope context for country-of-origin verification.
