from app.constants import STANDARD_GOVERNMENT_WARNING as STANDARD_WARNING
from app.schemas import ExpectedFields, ExtractedFields
from app.services.verification_service import (
    calculate_overall_status,
    verify_alcohol_content,
    verify_brand_name,
    verify_class_type,
    verify_expected_fields,
    verify_government_warning,
    verify_net_contents,
)


OLD_UNNUMBERED_WARNING = (
    "GOVERNMENT WARNING: According to the Surgeon General, women should not drink alcoholic beverages during "
    "pregnancy because of the risk of birth defects. Consumption of alcoholic beverages impairs your ability "
    "to drive a car or operate machinery, and may cause health problems."
)


def test_brand_exact_match() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", "OLD TOM DISTILLERY")
    assert result.status == "pass"
    assert result.reason == "Brand name matches exactly."
    assert result.confidence == 1.0


def test_brand_case_normalization_passes() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", "Old Tom Distillery")
    assert result.status == "pass"
    assert result.reason == "Brand name matches after capitalization normalization."
    assert result.confidence == 1.0


def test_brand_safe_punctuation_normalization_passes() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", "OLD TOM DISTILLERY.")
    assert result.status == "pass"
    assert result.reason == "Brand name matches after punctuation normalization."
    assert result.confidence == 1.0


def test_brand_ambiguous_punctuation_remains_reviewable() -> None:
    result = verify_brand_name("STONE'S THROW", "Stones Throw")
    assert result.status == "normalized_match"


def test_brand_mismatch() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", "NEW TOM DISTILLERY")
    assert result.status == "fail"


def test_brand_missing() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", None)
    assert result.status == "missing"


def test_brand_high_similarity_needs_review() -> None:
    result = verify_brand_name("OLD TOM DISTILLERY", "OLD TOM DISTILLERIES")
    assert result.status == "needs_review"


def test_class_exact_match() -> None:
    result = verify_class_type("Kentucky Straight Bourbon Whiskey", "Kentucky Straight Bourbon Whiskey")
    assert result.status == "pass"


def test_class_normalized_match() -> None:
    result = verify_class_type("Kentucky Straight Bourbon Whiskey", "kentucky   straight\nbourbon whiskey")
    assert result.status == "pass"
    assert result.reason == "Class/type matches exactly."
    assert result.confidence == 1.0


def test_class_mismatch() -> None:
    result = verify_class_type("Kentucky Straight Bourbon Whiskey", "Vodka")
    assert result.status == "fail"


def test_class_missing() -> None:
    result = verify_class_type("Kentucky Straight Bourbon Whiskey", None)
    assert result.status == "missing"


def test_class_partial_match_needs_review() -> None:
    result = verify_class_type("Kentucky Straight Bourbon Whiskey", "Straight Bourbon Whiskey")
    assert result.status == "needs_review"


def test_alcohol_same_abv_passes() -> None:
    result = verify_alcohol_content("45% Alc./Vol. (90 Proof)", "45 % alc/vol (90 proof)")
    assert result.status == "pass"
    assert result.reason == "Alcohol content matches."
    assert result.confidence == 1.0


def test_alcohol_abv_and_proof_equivalence_passes() -> None:
    assert verify_alcohol_content("45%", "90 Proof").status == "pass"
    assert verify_alcohol_content("90 Proof", "45%").status == "pass"


def test_alcohol_wrong_abv_fails() -> None:
    result = verify_alcohol_content("45%", "40%")
    assert result.status == "fail"


def test_alcohol_conflicting_explicit_proof_fails() -> None:
    result = verify_alcohol_content("45% Alc./Vol. (90 Proof)", "45% Alc./Vol. (80 Proof)")
    assert result.status == "fail"


def test_alcohol_missing_value() -> None:
    result = verify_alcohol_content("45%", None)
    assert result.status == "missing"


def test_net_contents_equivalent_ml_values() -> None:
    assert verify_net_contents("750 mL", "750ml").status == "pass"
    assert verify_net_contents("750 mL", "750 ML").status == "pass"
    assert verify_net_contents("750 mL", "750 milliliters").status == "pass"
    assert verify_net_contents("0.75 L", "750 mL").status == "pass"


def test_net_contents_different_quantity_fails() -> None:
    result = verify_net_contents("750 mL", "500 mL")
    assert result.status == "fail"


def test_net_contents_missing_value() -> None:
    result = verify_net_contents("750 mL", None)
    assert result.status == "missing"


def test_government_warning_exact_uppercase_passes() -> None:
    result = verify_government_warning(STANDARD_WARNING, STANDARD_WARNING)
    assert result.status == "pass"
    assert result.confidence == 1.0


def test_government_warning_title_case_heading_fails() -> None:
    found = STANDARD_WARNING.replace("GOVERNMENT WARNING", "Government Warning")
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status == "fail"


def test_government_warning_lowercase_heading_fails() -> None:
    found = STANDARD_WARNING.replace("GOVERNMENT WARNING", "government warning")
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status == "fail"


def test_government_warning_mixed_case_heading_fails() -> None:
    found = STANDARD_WARNING.replace("GOVERNMENT WARNING", "GOVERNMENT Warning")
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status == "fail"


def test_government_warning_body_capitalization_does_not_pass() -> None:
    found = STANDARD_WARNING.replace("According to the Surgeon General", "according to the surgeon general")
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status == "needs_review"
    assert result.reason == "Government warning capitalization or punctuation does not match the standard warning text."


def test_government_warning_missing_value() -> None:
    result = verify_government_warning(STANDARD_WARNING, None)
    assert result.status == "missing"


def test_government_warning_changed_wording_fails() -> None:
    found = "GOVERNMENT WARNING: Consumption of alcoholic beverages is risky."
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status == "fail"


def test_government_warning_changed_punctuation_does_not_pass() -> None:
    found = STANDARD_WARNING.replace("GOVERNMENT WARNING:", "GOVERNMENT WARNING")
    result = verify_government_warning(STANDARD_WARNING, found)
    assert result.status != "pass"
    assert result.reason == "Government warning punctuation does not match the standard warning text."


def test_government_warning_without_numbered_clauses_fails() -> None:
    result = verify_government_warning(STANDARD_WARNING, OLD_UNNUMBERED_WARNING)
    assert result.status == "fail"


def test_overall_status_rules() -> None:
    pass_result = verify_brand_name("OLD TOM", "OLD TOM")
    normalized_result = verify_brand_name("STONE'S THROW", "Stones Throw")
    missing_result = verify_brand_name("OLD TOM", None)
    fail_result = verify_brand_name("OLD TOM", "NEW TOM")

    assert calculate_overall_status([pass_result]) == "pass"
    assert calculate_overall_status([normalized_result]) == "needs_review"
    assert calculate_overall_status([missing_result]) == "needs_review"
    assert calculate_overall_status([fail_result]) == "fail"


def test_verify_expected_fields_returns_field_results() -> None:
    expected = ExpectedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type="Kentucky Straight Bourbon Whiskey",
        alcohol_content="45% Alc./Vol. (90 Proof)",
        net_contents="750 mL",
        government_warning=STANDARD_WARNING,
    )
    extracted = ExtractedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type="Kentucky Straight Bourbon Whiskey",
        alcohol_content="90 Proof",
        net_contents="0.75 L",
        government_warning_text=STANDARD_WARNING,
    )

    results = verify_expected_fields(expected, extracted)

    assert [result.status for result in results] == ["pass", "pass", "pass", "pass", "pass"]


def test_verify_expected_fields_normalized_matches_return_overall_pass() -> None:
    expected = ExpectedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type="Kentucky Straight Bourbon Whiskey",
        alcohol_content="45% Alc./Vol. (90 Proof)",
        net_contents="750 mL",
        government_warning=STANDARD_WARNING,
    )
    extracted = ExtractedFields(
        brand_name="Old Tom Distillery",
        class_type="kentucky   straight\nbourbon whiskey",
        alcohol_content="45 % alc/vol (90 proof)",
        net_contents="750 ml",
        government_warning_text=STANDARD_WARNING,
    )

    results = verify_expected_fields(expected, extracted)

    assert [result.status for result in results] == ["pass", "pass", "pass", "pass", "pass"]
    assert calculate_overall_status(results) == "pass"


def test_verify_expected_fields_uses_canonical_government_warning() -> None:
    expected = ExpectedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type="",
        alcohol_content="",
        net_contents="",
        government_warning=OLD_UNNUMBERED_WARNING,
    )
    extracted = ExtractedFields(
        brand_name="OLD TOM DISTILLERY",
        government_warning_text=OLD_UNNUMBERED_WARNING,
    )

    results = verify_expected_fields(expected, extracted)
    warning_result = next(result for result in results if result.field_name == "government_warning")

    assert warning_result.expected == STANDARD_WARNING
    assert warning_result.status == "fail"


def test_verify_expected_fields_skips_blank_optional_expected_values() -> None:
    expected = ExpectedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type="",
        alcohol_content="",
        net_contents="",
        government_warning=STANDARD_WARNING,
    )
    extracted = ExtractedFields(
        brand_name="OLD TOM DISTILLERY",
        class_type=None,
        alcohol_content=None,
        net_contents=None,
        government_warning_text=STANDARD_WARNING,
    )

    results = verify_expected_fields(expected, extracted)

    assert [result.field_name for result in results] == ["brand_name", "government_warning"]
    assert [result.status for result in results] == ["pass", "pass"]
