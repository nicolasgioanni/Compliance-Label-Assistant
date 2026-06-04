from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_contract() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "alcohol-label-verification-api",
    }


def test_verify_mock_contract() -> None:
    response = client.post(
        "/verify",
        data={
            "brand_name": "OLD TOM DISTILLERY",
            "class_type": "Kentucky Straight Bourbon Whiskey",
            "alcohol_content": "45% Alc./Vol. (90 Proof)",
            "net_contents": "750 mL",
            "government_warning": "GOVERNMENT WARNING: Standard text.",
        },
        files={"file": ("old-tom.png", b"mock image bytes", "image/png")},
    )

    body = response.json()

    assert response.status_code == 200
    assert body["filename"] == "old-tom.png"
    assert body["overall_status"] == "needs_review"
    assert body["extraction_time_ms"] == 0
    assert len(body["field_results"]) == 5
    assert body["message"].startswith("Mock verification only.")

