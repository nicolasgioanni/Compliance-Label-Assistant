# API Contract

Base URL locally: `http://127.0.0.1:8000`

## GET /health

Response:

```json
{
  "status": "ok",
  "service": "alcohol-label-verification-api"
}
```

## POST /verify

Accepts `multipart/form-data`:

- `file`
- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `government_warning` (accepted for API compatibility; the backend verifies against its standard warning text)

Supported upload formats are JPG/JPEG, PNG, WebP, and TIFF/TIF. Uploads are also constrained by file size and decoded image pixel count.

Response:

```json
{
  "filename": "label.png",
  "overall_status": "needs_review",
  "expected_fields": {
    "brand_name": "OLD TOM DISTILLERY",
    "class_type": "Kentucky Straight Bourbon Whiskey",
    "alcohol_content": "45% Alc./Vol. (90 Proof)",
    "net_contents": "750 mL",
    "government_warning": "GOVERNMENT WARNING: ..."
  },
  "extracted_fields": {
    "brand_name": "OLD TOM DISTILLERY",
    "class_type": "Kentucky Straight Bourbon Whiskey",
    "alcohol_content": "90 Proof",
    "net_contents": "750 mL",
    "government_warning_text": "GOVERNMENT WARNING: ...",
    "raw_text": "Visible extracted text..."
  },
  "field_results": [
    {
      "field_name": "brand_name",
      "expected": "OLD TOM DISTILLERY",
      "found": "OLD TOM DISTILLERY",
      "status": "pass",
      "reason": "Brand name matches exactly.",
      "confidence": 1
    }
  ],
  "processing_time_ms": 1200,
  "extraction_time_ms": 1100,
  "verification_time_ms": 1,
  "message": "AI extraction completed and deterministic field verification was applied.",
  "error": null
}
```

## POST /verify-batch

Accepts `multipart/form-data`:

- `files`
- `brand_name`
- `class_type`
- `alcohol_content`
- `net_contents`
- `government_warning` (accepted for API compatibility; the backend verifies against its standard warning text)

Batch mode accepts 2 to `MAX_BATCH_SIZE` files and uses one shared expected application dataset.
Supported upload formats are JPG/JPEG, PNG, WebP, and TIFF/TIF. Uploads are also constrained by file size and decoded image pixel count. Duplicate basenames in the same batch request are rejected case-insensitively before processing.

Response:

```json
{
  "mode": "batch",
  "total_labels": 2,
  "completed": 1,
  "status_counts": {
    "pass": 1,
    "fail": 0,
    "needs_review": 0,
    "error": 1
  },
  "total_processing_time_ms": 2400,
  "results": [
    {
      "filename": "label-a.png",
      "overall_status": "pass",
      "expected_fields": {
        "brand_name": "OLD TOM DISTILLERY",
        "class_type": "Kentucky Straight Bourbon Whiskey",
        "alcohol_content": "45% Alc./Vol. (90 Proof)",
        "net_contents": "750 mL",
        "government_warning": "GOVERNMENT WARNING: ..."
      },
      "extracted_fields": {
        "brand_name": "OLD TOM DISTILLERY",
        "class_type": "Kentucky Straight Bourbon Whiskey",
        "alcohol_content": "90 Proof",
        "net_contents": "750 mL",
        "government_warning_text": "GOVERNMENT WARNING: ...",
        "raw_text": "Visible extracted text..."
      },
      "field_results": [
        {
          "field_name": "brand_name",
          "expected": "OLD TOM DISTILLERY",
          "found": "OLD TOM DISTILLERY",
          "status": "pass",
          "reason": "Brand name matches exactly.",
          "confidence": 1
        }
      ],
      "processing_time_ms": 1200,
      "extraction_time_ms": 1100,
      "verification_time_ms": 1,
      "message": "AI extraction completed and deterministic field verification was applied.",
      "error": null
    }
  ]
}
```

Each `results` item uses the same per-file shape as `/verify`.

## Status Values

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
- `needs_review`
- `error`

## Error Responses

Request-level errors return JSON:

```json
{
  "detail": "User-facing error message."
}
```

Batch per-file errors are returned as result items with `overall_status: "error"` and an `error` message.
