"""Regression tests for sample-data label fixtures.

The tests upload the real fixture images and mock extraction with fixture data.
This keeps provider behavior out of the test while still exercising upload
validation, preprocessing, routing, response building, and deterministic rules.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.constants import STANDARD_GOVERNMENT_WARNING
from app.main import app
from app.schemas import ExtractedFields
from app.services import single_verification_service


REPO_ROOT = Path(__file__).resolve().parents[3]
FIXTURE_ROOT = REPO_ROOT / "sample-data"
FIXTURE_MANIFEST = FIXTURE_ROOT / "expected_outputs.json"
SUPPORTED_FIELD_NAMES = {
    "brand_name",
    "class_type",
    "alcohol_content",
    "net_contents",
    "government_warning",
}
CONTEXT_ONLY_FIELD_NAMES = {
    "bottler_producer",
    "country_of_origin",
    "label_country_of_origin",
    "government_warning_required",
}

client = TestClient(app)


def _load_fixture_manifest() -> dict[str, Any]:
    return json.loads(FIXTURE_MANIFEST.read_text(encoding="utf-8"))


def _load_fixture_cases() -> list[dict[str, Any]]:
    return _load_fixture_manifest()["test_cases"]


def _form_data(case: dict[str, Any]) -> dict[str, str]:
    application_fields = case["application_fields"]
    return {
        "brand_name": application_fields["brand_name"],
        "class_type": application_fields["class_type"],
        "alcohol_content": application_fields["alcohol_content"],
        "net_contents": application_fields["net_contents"],
        "government_warning": STANDARD_GOVERNMENT_WARNING,
    }


@pytest.mark.parametrize("case", _load_fixture_cases(), ids=lambda case: case["id"])
def test_sample_fixture_contracts_verify_current_supported_fields(monkeypatch, case: dict[str, Any]) -> None:
    image_path = FIXTURE_ROOT / case["image_file"]
    assert image_path.is_file(), f"Missing sample fixture image: {image_path}"

    extracted_fields = ExtractedFields(**case["mock_extracted_fields"])

    async def fake_extract_label_fields(image_bytes: bytes, settings):
        assert image_bytes
        assert settings.service_name == "alcohol-label-verification-api"
        return extracted_fields

    monkeypatch.setattr(single_verification_service, "extract_label_fields", fake_extract_label_fields)

    response = client.post(
        "/verify",
        data=_form_data(case),
        files={"file": (image_path.name, image_path.read_bytes(), "image/png")},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["filename"] == image_path.name
    assert body["overall_status"] == case["expected_overall_status"]
    assert body["preprocessed_image_bytes"] > 0
    assert body["preprocessed_image_width"] > 0
    assert body["expected_fields"]["government_warning"] == STANDARD_GOVERNMENT_WARNING

    actual_field_statuses = {
        field_result["field_name"]: field_result["status"]
        for field_result in body["field_results"]
    }
    assert actual_field_statuses == case["expected_field_statuses"]
    assert set(actual_field_statuses) == SUPPORTED_FIELD_NAMES
    assert CONTEXT_ONLY_FIELD_NAMES.isdisjoint(actual_field_statuses)


def test_fixture_manifest_documents_only_supported_assertion_fields() -> None:
    manifest = _load_fixture_manifest()

    assert set(manifest["supported_verification_fields"]) == SUPPORTED_FIELD_NAMES
    assert set(manifest["context_only_fields"]).issubset(CONTEXT_ONLY_FIELD_NAMES)

    for case in manifest["test_cases"]:
        assert set(case["application_fields"]) == SUPPORTED_FIELD_NAMES - {"government_warning"}
        assert set(case["expected_field_statuses"]) == SUPPORTED_FIELD_NAMES
        assert CONTEXT_ONLY_FIELD_NAMES.isdisjoint(case["expected_field_statuses"])
        assert set(case["context_fields"]).issubset(CONTEXT_ONLY_FIELD_NAMES)
