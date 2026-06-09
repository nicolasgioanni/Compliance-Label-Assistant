# Request And Response Contracts

## Form Field Mapping

Frontend expected field object:

```js
{
  brandName,
  classType,
  alcoholContent,
  netContents,
  bottlerProducer,
  countryOfOrigin,
  governmentWarning
}
```

Multipart API fields:

```text
brand_name
class_type
alcohol_content
net_contents
bottler_producer
country_of_origin
government_warning
```

Mapping is implemented in `appendExpectedFields` in `frontend/src/api/verificationApi.js`.

## `ExpectedFields`

```json
{
  "brand_name": "Example Brand",
  "class_type": "Example Class Type",
  "alcohol_content": "45% Alc./Vol. (90 Proof)",
  "net_contents": "750 mL",
  "bottler_producer": "Example Bottler, Louisville, KY",
  "country_of_origin": "USA",
  "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
}
```

## `ExtractedFields`

```json
{
  "brand_name": "Example Brand",
  "class_type": "Example Class Type",
  "alcohol_content": "90 Proof",
  "net_contents": "750 mL",
  "bottler_producer": "Example Bottler, Louisville, KY",
  "country_of_origin": "USA",
  "government_warning_text": "<EXTRACTED_WARNING_TEXT>",
  "raw_text": null
}
```

All fields may be `null`.

## `FieldResult`

```json
{
  "field_name": "brand_name",
  "expected": "Example Brand",
  "found": "Example Brand",
  "status": "pass",
  "reason": "Brand name matches exactly.",
  "confidence": 1
}
```

`confidence` is a number from 0 through 1.

## `SingleVerificationResponse`

```json
{
  "filename": "label.png",
  "overall_status": "pass",
  "expected_fields": {
    "brand_name": "Example Brand",
    "class_type": "Example Class Type",
    "alcohol_content": "45% Alc./Vol. (90 Proof)",
    "net_contents": "750 mL",
    "bottler_producer": "Example Bottler, Louisville, KY",
    "country_of_origin": "USA",
    "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
  },
  "extracted_fields": {
    "brand_name": "Example Brand",
    "class_type": "Example Class Type",
    "alcohol_content": "90 Proof",
    "net_contents": "750 mL",
    "bottler_producer": "Example Bottler, Louisville, KY",
    "country_of_origin": "USA",
    "government_warning_text": "<EXTRACTED_WARNING_TEXT>",
    "raw_text": null
  },
  "field_results": [
    {
      "field_name": "brand_name",
      "expected": "Example Brand",
      "found": "Example Brand",
      "status": "pass",
      "reason": "Brand name matches exactly.",
      "confidence": 1
    }
  ],
  "processing_time_ms": 1,
  "validation_time_ms": 1,
  "preprocessing_time_ms": 1,
  "extraction_time_ms": 1,
  "verification_time_ms": 1,
  "preprocessed_image_bytes": 1,
  "preprocessed_image_width": 640,
  "message": "<VERIFICATION_MESSAGE>",
  "error": null
}
```

## `BatchVerificationResponse`

```json
{
  "mode": "batch",
  "total_labels": 1,
  "completed": 1,
  "status_counts": {
    "pass": 1,
    "fail": 0,
    "error": 0
  },
  "total_processing_time_ms": 1,
  "results": [
    {
      "filename": "label-a.png",
      "overall_status": "pass",
      "expected_fields": {
        "brand_name": "Example Brand",
        "class_type": "Example Class Type",
        "alcohol_content": "45% Alc./Vol. (90 Proof)",
        "net_contents": "750 mL",
        "bottler_producer": "Example Bottler, Louisville, KY",
        "country_of_origin": "USA",
        "government_warning": "<STANDARD_GOVERNMENT_WARNING>"
      },
      "extracted_fields": {
        "brand_name": "Example Brand",
        "class_type": "Example Class Type",
        "alcohol_content": "90 Proof",
        "net_contents": "750 mL",
        "bottler_producer": "Example Bottler, Louisville, KY",
        "country_of_origin": "USA",
        "government_warning_text": "<EXTRACTED_WARNING_TEXT>",
        "raw_text": null
      },
      "field_results": [
        {
          "field_name": "brand_name",
          "expected": "Example Brand",
          "found": "Example Brand",
          "status": "pass",
          "reason": "Brand name matches exactly.",
          "confidence": 1
        }
      ],
      "processing_time_ms": 1,
      "validation_time_ms": 1,
      "preprocessing_time_ms": 1,
      "extraction_time_ms": 1,
      "verification_time_ms": 1,
      "preprocessed_image_bytes": 1,
      "preprocessed_image_width": 640,
      "message": "<VERIFICATION_MESSAGE>",
      "error": null
    }
  ]
}
```

`results` contains `BatchVerificationItem` objects with the same shape as `SingleVerificationResponse`.

## Backwards Compatibility Notes

- `government_warning` remains accepted in form data.
- `bottler_producer` and `country_of_origin` default to blank when omitted by direct API clients.
- Backend verification uses the server-owned standard warning text regardless of the submitted `government_warning` value.
- `/verify-batch` remains available even though the current frontend queue does not call it.
