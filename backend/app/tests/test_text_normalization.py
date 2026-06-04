from app.utils.text_normalization import (
    calculate_similarity,
    extract_abv,
    extract_proof,
    normalize_for_comparison,
    normalize_net_contents,
    normalize_punctuation,
    normalize_quotes,
    remove_extra_whitespace,
)


def test_casing_differences_normalize_for_comparison() -> None:
    assert normalize_for_comparison("OLD TOM DISTILLERY") == normalize_for_comparison("old tom distillery")


def test_punctuation_differences_normalize_for_comparison() -> None:
    assert normalize_for_comparison("Stone's Throw") == normalize_for_comparison("Stones Throw")
    assert normalize_punctuation("Kentucky-Straight Bourbon.") == "Kentucky Straight Bourbon"


def test_quote_normalization() -> None:
    assert normalize_quotes("\u201cStone\u2019s Throw\u201d") == "\"Stone's Throw\""


def test_whitespace_normalization() -> None:
    assert remove_extra_whitespace("Old\n  Tom\tDistillery") == "Old Tom Distillery"


def test_similarity_uses_normalized_text() -> None:
    assert calculate_similarity("OLD TOM DISTILLERY", "Old Tom Distilleries") > 0.88


def test_extract_abv() -> None:
    assert extract_abv("45%") == 45
    assert extract_abv("45% ABV") == 45
    assert extract_abv("45% Alc./Vol.") == 45


def test_extract_proof() -> None:
    assert extract_proof("90 Proof") == 90
    assert extract_proof("90 prf") == 90


def test_normalize_net_contents() -> None:
    assert normalize_net_contents("750 mL") == 750
    assert normalize_net_contents("750ml") == 750
    assert normalize_net_contents("0.75 L") == 750

