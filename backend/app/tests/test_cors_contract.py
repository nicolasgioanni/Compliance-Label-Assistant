from fastapi.testclient import TestClient

from app import main as app_main
from app.config import Settings


ALLOWED_ORIGIN = "http://localhost:5173"
DISALLOWED_ORIGIN = "https://evil.example"


def _client_with_allowed_origin(monkeypatch) -> TestClient:
    settings = Settings(allowed_origins=[ALLOWED_ORIGIN])
    monkeypatch.setattr(app_main, "get_settings", lambda: settings)
    return TestClient(app_main.create_app())


def test_allowed_origin_preflight_includes_cors_headers(monkeypatch) -> None:
    client = _client_with_allowed_origin(monkeypatch)

    response = client.options(
        "/verify",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code in {200, 204}
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN
    assert "POST" in response.headers["access-control-allow-methods"]


def test_disallowed_origin_preflight_does_not_allow_origin(monkeypatch) -> None:
    client = _client_with_allowed_origin(monkeypatch)

    response = client.options(
        "/verify",
        headers={
            "Origin": DISALLOWED_ORIGIN,
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.headers.get("access-control-allow-origin") != DISALLOWED_ORIGIN
