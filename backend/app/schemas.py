"""Pydantic models for API request and response shapes.

These models are the backend/frontend JSON contract. Field names, nesting, and
status literals are intentionally stable because result cards, exports, and API
contract tests read the exact keys.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


FieldStatus = Literal[
    "pass",
    "normalized_match",
    "fail",
    "missing",
    "needs_review",
    "error",
]
OverallStatus = Literal["pass", "fail", "error"]


class ExpectedFields(BaseModel):
    """Reviewer-supplied target fields normalized into backend naming."""

    brand_name: str
    class_type: str
    alcohol_content: str
    net_contents: str
    bottler_producer: str = ""
    country_of_origin: str = ""
    government_warning: str


class ExtractedFields(BaseModel):
    """Provider-extracted label fields before deterministic comparison."""

    brand_name: str | None = None
    class_type: str | None = None
    alcohol_content: str | None = None
    net_contents: str | None = None
    bottler_producer: str | None = None
    country_of_origin: str | None = None
    government_warning_text: str | None = None
    raw_text: str | None = None


class FieldResult(BaseModel):
    """One deterministic comparison result for a checked field."""

    field_name: str
    expected: str
    found: str | None
    status: FieldStatus
    reason: str
    confidence: float = Field(ge=0, le=1)


class SingleVerificationResponse(BaseModel):
    """Frontend-facing result payload for one label verification request."""

    filename: str
    overall_status: OverallStatus
    expected_fields: ExpectedFields
    extracted_fields: ExtractedFields
    field_results: list[FieldResult]
    processing_time_ms: int = 0
    validation_time_ms: int = 0
    preprocessing_time_ms: int = 0
    extraction_time_ms: int = 0
    verification_time_ms: int = 0
    preprocessed_image_bytes: int = 0
    preprocessed_image_width: int = 0
    message: str | None = None
    error: str | None = None


class BatchVerificationItem(SingleVerificationResponse):
    """Per-file batch result using the same shape as single verification."""


class BatchVerificationResponse(BaseModel):
    """Shared-expected-fields batch response with one item per submitted file."""

    mode: Literal["batch"] = "batch"
    total_labels: int
    completed: int
    status_counts: dict[str, int]
    total_processing_time_ms: int
    results: list[BatchVerificationItem]
