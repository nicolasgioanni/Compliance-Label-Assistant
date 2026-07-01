"""Helpers for building deterministic verification result objects."""

from app.schemas import FieldResult, FieldStatus


def build_field_result(
    field_name: str,
    expected: str,
    found: str | None,
    status: FieldStatus,
    reason: str,
    confidence: float,
) -> FieldResult:
    """Centralize field result construction so reason strings stay explicit."""
    return FieldResult(
        field_name=field_name,
        expected=expected,
        found=found,
        status=status,
        reason=reason,
        confidence=confidence,
    )
