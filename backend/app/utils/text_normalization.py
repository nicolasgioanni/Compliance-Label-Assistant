"""Pure text cleanup and parsing helpers for deterministic verification.

These helpers normalize extracted and expected label text without making any
field-level compliance decisions. Verification rules live in
verification_service.py so parsing and comparison remain easy to test.
"""

from __future__ import annotations

from difflib import SequenceMatcher
import re
import string


QUOTE_TRANSLATION = str.maketrans(
    {
        "\u2018": "'",
        "\u2019": "'",
        "\u201a": "'",
        "\u201b": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u201e": '"',
        "\u201f": '"',
    }
)

def remove_extra_whitespace(value: str | None) -> str:
    if value is None:
        return ""
    return " ".join(str(value).split())


def normalize_quotes(value: str | None) -> str:
    if value is None:
        return ""
    return str(value).translate(QUOTE_TRANSLATION)


def normalize_punctuation(value: str | None) -> str:
    normalized_value = normalize_quotes(value)
    cleaned_characters: list[str] = []
    for character in normalized_value:
        if character in {"'", '"'}:
            continue
        if character in string.punctuation:
            cleaned_characters.append(" ")
            continue
        cleaned_characters.append(character)
    return remove_extra_whitespace("".join(cleaned_characters))


def normalize_for_display(value: str | None) -> str:
    return remove_extra_whitespace(normalize_quotes(value))


def normalize_for_comparison(value: str | None) -> str:
    normalized_value = normalize_punctuation(value).lower()
    return remove_extra_whitespace(normalized_value)


def calculate_similarity(expected: str | None, found: str | None) -> float:
    expected_normalized = normalize_for_comparison(expected)
    found_normalized = normalize_for_comparison(found)
    if not expected_normalized or not found_normalized:
        return 0.0
    return SequenceMatcher(None, expected_normalized, found_normalized).ratio()


def extract_abv(value: str | None) -> float | None:
    normalized_value = normalize_quotes(value)
    match = re.search(r"(\d+(?:\.\d+)?)\s*%", normalized_value)
    if not match:
        return None
    return float(match.group(1))


def extract_proof(value: str | None) -> float | None:
    normalized_value = normalize_quotes(value)
    match = re.search(r"(\d+(?:\.\d+)?)\s*(?:proof|prf)\b", normalized_value, flags=re.IGNORECASE)
    if not match:
        return None
    return float(match.group(1))


def normalize_net_contents(value: str | None) -> float | None:
    normalized_value = normalize_quotes(value)
    match = re.search(r"(\d+(?:\.\d+)?)\s*(ml|mL|ML|l|L)\b", normalized_value)
    if not match:
        return None

    amount = float(match.group(1))
    unit = match.group(2).lower()
    if unit == "l":
        return amount * 1000
    return amount
