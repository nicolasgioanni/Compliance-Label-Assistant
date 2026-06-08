from app.config import Settings
from app.services import warmup_service


def test_warmup_reuses_openai_client_when_key_exists(monkeypatch) -> None:
    calls = []

    class FakeResponses:
        def parse(self, **kwargs):
            raise AssertionError("warmup must not make model requests")

    class FakeClient:
        responses = FakeResponses()

    def fake_get_openai_client(settings):
        calls.append(settings)
        return FakeClient()

    monkeypatch.setattr(warmup_service, "get_openai_client", fake_get_openai_client)
    settings = Settings(openai_api_key="test-key")

    warmup_service.warm_verification_dependencies(settings)

    assert calls == [settings]


def test_warmup_skips_openai_client_without_api_key(monkeypatch) -> None:
    def fail_if_called(settings):
        raise AssertionError("OpenAI client should not be created without an API key")

    monkeypatch.setattr(warmup_service, "get_openai_client", fail_if_called)

    warmup_service.warm_verification_dependencies(Settings(openai_api_key=""))


def test_warmup_swallows_client_initialization_errors(monkeypatch) -> None:
    def fail_client_initialization(settings):
        raise RuntimeError("provider internals should not escape")

    monkeypatch.setattr(warmup_service, "get_openai_client", fail_client_initialization)

    warmup_service.warm_verification_dependencies(Settings(openai_api_key="test-key"))
