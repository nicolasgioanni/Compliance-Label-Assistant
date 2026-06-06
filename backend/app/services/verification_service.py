"""Deterministic field verification after AI extraction.

The OpenAI service extracts visible label text only. This module compares that
extracted text against expected application values using deterministic rules so
the resulting field statuses are explainable and auditable. It does not call
OpenAI, process image bytes, or make final legal compliance decisions.
"""

from app.schemas import ExpectedFields, ExtractedFields, FieldResult, OverallStatus
from app.utils.response_builders import build_field_result
from app.utils.text_normalization import (
    calculate_similarity,
    extract_abv,
    extract_proof,
    normalize_for_comparison,
    normalize_for_display,
    normalize_net_contents,
    normalize_punctuation,
    normalize_quotes,
    remove_extra_whitespace,
)


BRAND_REVIEW_THRESHOLD = 0.88
CLASS_REVIEW_THRESHOLD = 0.82
WARNING_REVIEW_THRESHOLD = 0.92
ABV_TOLERANCE = 0.1
PROOF_TOLERANCE = 0.2
NET_CONTENTS_TOLERANCE_ML = 0.5


def _is_missing(value: str | None) -> bool:
    return not normalize_for_display(value)


def _exact_display_match(expected: str, found: str) -> bool:
    return normalize_for_display(expected) == normalize_for_display(found)


def _normalized_match(expected: str, found: str) -> bool:
    return normalize_for_comparison(expected) == normalize_for_comparison(found)


def verify_brand_name(expected: str, found: str | None) -> FieldResult:
    if _is_missing(found):
        return build_field_result("brand_name", expected, found, "missing", "Brand name was not found on the label.", 0.6)

    found_value = found or ""
    if _exact_display_match(expected, found_value):
        return build_field_result("brand_name", expected, found, "pass", "Brand name matches exactly.", 1.0)

    if _normalized_match(expected, found_value):
        return build_field_result(
            "brand_name",
            expected,
            found,
            "normalized_match",
            "Brand name matches after capitalization, spacing, quote, or punctuation normalization.",
            0.95,
        )

    similarity = calculate_similarity(expected, found_value)
    if similarity >= BRAND_REVIEW_THRESHOLD:
        return build_field_result(
            "brand_name",
            expected,
            found,
            "needs_review",
            "Brand name is similar but not an exact or normalized match.",
            round(similarity, 2),
        )

    return build_field_result("brand_name", expected, found, "fail", "Brand name conflicts with expected value.", 0.95)


def _has_token_containment(expected: str, found: str) -> bool:
    expected_tokens = set(normalize_for_comparison(expected).split())
    found_tokens = set(normalize_for_comparison(found).split())
    if not expected_tokens or not found_tokens:
        return False
    return expected_tokens.issubset(found_tokens) or found_tokens.issubset(expected_tokens)


def verify_class_type(expected: str, found: str | None) -> FieldResult:
    if _is_missing(found):
        return build_field_result("class_type", expected, found, "missing", "Class/type was not found on the label.", 0.6)

    found_value = found or ""
    if _exact_display_match(expected, found_value):
        return build_field_result("class_type", expected, found, "pass", "Class/type matches exactly.", 1.0)

    if _normalized_match(expected, found_value):
        return build_field_result(
            "class_type",
            expected,
            found,
            "normalized_match",
            "Class/type matches after safe text normalization.",
            0.95,
        )

    similarity = calculate_similarity(expected, found_value)
    if _has_token_containment(expected, found_value) or similarity >= CLASS_REVIEW_THRESHOLD:
        return build_field_result(
            "class_type",
            expected,
            found,
            "needs_review",
            "Class/type is partial or similar and should be reviewed by a human.",
            round(max(similarity, 0.82), 2),
        )

    return build_field_result("class_type", expected, found, "fail", "Class/type conflicts with expected value.", 0.95)


def _values_match(left: float | None, right: float | None, tolerance: float) -> bool:
    if left is None or right is None:
        return False
    return abs(left - right) <= tolerance


def _has_alcohol_value(value: str | None) -> bool:
    return extract_abv(value) is not None or extract_proof(value) is not None


def verify_alcohol_content(expected: str, found: str | None) -> FieldResult:
    if _is_missing(found) or not _has_alcohol_value(found):
        return build_field_result(
            "alcohol_content",
            expected,
            found,
            "missing",
            "Alcohol content ABV or proof was not found on the label.",
            0.6,
        )

    expected_abv = extract_abv(expected)
    found_abv = extract_abv(found)
    expected_proof = extract_proof(expected)
    found_proof = extract_proof(found)

    # Proof is defined as twice the ABV percentage, so 45% ABV is equivalent to 90 proof.
    expected_abv_as_proof = expected_abv * 2 if expected_abv is not None else None
    found_abv_as_proof = found_abv * 2 if found_abv is not None else None

    if (
        _values_match(expected_abv, found_abv, ABV_TOLERANCE)
        or _values_match(expected_proof, found_proof, PROOF_TOLERANCE)
        or _values_match(expected_abv_as_proof, found_proof, PROOF_TOLERANCE)
        or _values_match(expected_proof, found_abv_as_proof, PROOF_TOLERANCE)
    ):
        return build_field_result("alcohol_content", expected, found, "pass", "Alcohol content matches.", 1.0)

    return build_field_result("alcohol_content", expected, found, "fail", "Alcohol content conflicts with expected value.", 0.95)


def verify_net_contents(expected: str, found: str | None) -> FieldResult:
    found_ml = normalize_net_contents(found)
    if _is_missing(found) or found_ml is None:
        return build_field_result("net_contents", expected, found, "missing", "Net contents were not found on the label.", 0.6)

    expected_ml = normalize_net_contents(expected)
    if expected_ml is not None and abs(expected_ml - found_ml) <= NET_CONTENTS_TOLERANCE_ML:
        return build_field_result("net_contents", expected, found, "pass", "Net contents match after unit normalization.", 1.0)

    return build_field_result("net_contents", expected, found, "fail", "Net contents conflict with expected value.", 0.95)


def _warning_heading_is_uppercase(found: str) -> bool:
    return "GOVERNMENT WARNING" in found


def _warning_text_for_exact_match(value: str | None) -> str:
    return remove_extra_whitespace(normalize_quotes(value))


def _warning_text_for_safe_match(value: str | None) -> str:
    return normalize_for_comparison(normalize_punctuation(value))


def verify_government_warning(expected: str, found: str | None) -> FieldResult:
    if _is_missing(found):
        return build_field_result(
            "government_warning",
            expected,
            found,
            "missing",
            "Government warning text was not found on the label.",
            0.6,
        )

    found_value = found or ""
    if not _warning_heading_is_uppercase(found_value):
        return build_field_result(
            "government_warning",
            expected,
            found,
            "fail",
            "Government warning heading is not uppercase as required.",
            0.95,
        )

    if _warning_text_for_exact_match(expected) == _warning_text_for_exact_match(found_value):
        return build_field_result(
            "government_warning",
            expected,
            found,
            "pass",
            "Government warning text matches exactly.",
            1.0,
        )

    if _warning_text_for_safe_match(expected) == _warning_text_for_safe_match(found_value):
        return build_field_result(
            "government_warning",
            expected,
            found,
            "normalized_match",
            "Government warning matches after safe punctuation, case, quote, or whitespace normalization.",
            0.95,
        )

    similarity = calculate_similarity(expected, found_value)
    if similarity >= WARNING_REVIEW_THRESHOLD:
        return build_field_result(
            "government_warning",
            expected,
            found,
            "needs_review",
            "Government warning text is similar but not an exact or normalized match.",
            round(similarity, 2),
        )

    return build_field_result(
        "government_warning",
        expected,
        found,
        "fail",
        "Government warning wording conflicts with expected value.",
        0.95,
    )


def calculate_overall_status(field_results: list[FieldResult]) -> OverallStatus:
    statuses = [field_result.status for field_result in field_results]
    if "error" in statuses:
        return "error"
    if "fail" in statuses:
        return "fail"
    if "missing" in statuses:
        return "needs_review"
    if "needs_review" in statuses:
        return "needs_review"
    if "normalized_match" in statuses:
        return "needs_review"
    return "pass"


def verify_expected_fields(expected_fields: ExpectedFields, extracted_fields: ExtractedFields) -> list[FieldResult]:
    field_results = [
        verify_brand_name(expected_fields.brand_name, extracted_fields.brand_name),
    ]

    if not _is_missing(expected_fields.class_type):
        field_results.append(verify_class_type(expected_fields.class_type, extracted_fields.class_type))

    if not _is_missing(expected_fields.alcohol_content):
        field_results.append(verify_alcohol_content(expected_fields.alcohol_content, extracted_fields.alcohol_content))

    if not _is_missing(expected_fields.net_contents):
        field_results.append(verify_net_contents(expected_fields.net_contents, extracted_fields.net_contents))

    field_results.append(verify_government_warning(expected_fields.government_warning, extracted_fields.government_warning_text))

    return field_results
