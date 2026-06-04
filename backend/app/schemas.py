"""Pydantic models for API request and response shapes."""

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
OverallStatus = Literal["pass", "fail", "needs_review", "error"]


class ExpectedFields(BaseModel):
    brand_name: str
    class_type: str
    alcohol_content: str
    net_contents: str
    government_warning: str


class ExtractedFields(BaseModel):
    brand_name: str | None = None
    class_type: str | None = None
    alcohol_content: str | None = None
    net_contents: str | None = None
    government_warning_text: str | None = None
    raw_text: str | None = None


class FieldResult(BaseModel):
    field_name: str
    expected: str
    found: str | None
    status: FieldStatus
    reason: str
    confidence: float = Field(ge=0, le=1)


class SingleVerificationResponse(BaseModel):
    filename: str
    overall_status: OverallStatus
    expected_fields: ExpectedFields
    extracted_fields: ExtractedFields
    field_results: list[FieldResult]
    processing_time_ms: int
    extraction_time_ms: int
    verification_time_ms: int
    message: str | None = None
    error: str | None = None


class BatchVerificationItem(SingleVerificationResponse):
    """Per-file batch result using the same shape as single verification."""


class BatchVerificationResponse(BaseModel):
    mode: Literal["batch"] = "batch"
    total_labels: int
    completed: int
    status_counts: dict[str, int]
    total_processing_time_ms: int
    results: list[BatchVerificationItem]


class ErrorResponse(BaseModel):
    detail: str
