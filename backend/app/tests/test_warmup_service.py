from app.config import Settings
from app.services import warmup_service


class FakeResponses:
    def parse(self, **kwargs):
        raise AssertionError("warmup must not make model requests")


class FakeModels:
    def __init__(self) -> None:
        self.retrieve_calls = []

    def retrieve(self, model, *, timeout):
        self.retrieve_calls.append({"model": model, "timeout": timeout})


class FakeClient:
    def __init__(self) -> None:
        self.models = FakeModels()
        self.responses = FakeResponses()


def test_warmup_reuses_openai_client_and_warms_network_when_key_exists(monkeypatch) -> None:
    calls = []
    fake_client = FakeClient()

    def fake_get_openai_client(settings):
        calls.append(settings)
        return fake_client

    monkeypatch.setattr(warmup_service, "get_openai_client", fake_get_openai_client)
    settings = Settings(
        openai_api_key="test-key",
        openai_model="gpt-4.1-mini",
        openai_warmup_timeout_seconds=3,
    )

    warmup_service.warm_verification_dependencies(settings)

    assert calls == [settings]
    assert fake_client.models.retrieve_calls == [{"model": "gpt-4.1-mini", "timeout": 3}]


def test_warmup_can_skip_network_warmup(monkeypatch) -> None:
    calls = []
    fake_client = FakeClient()

    def fake_get_openai_client(settings):
        calls.append(settings)
        return fake_client

    monkeypatch.setattr(warmup_service, "get_openai_client", fake_get_openai_client)
    settings = Settings(openai_api_key="test-key", openai_network_warmup=False)

    warmup_service.warm_verification_dependencies(settings)

    assert calls == [settings]
    assert fake_client.models.retrieve_calls == []


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


def test_warmup_swallows_network_warmup_errors(monkeypatch) -> None:
    class FailingModels:
        def retrieve(self, model, *, timeout):
            raise RuntimeError("provider internals should not escape")

    class FailingClient:
        responses = FakeResponses()
        models = FailingModels()

    monkeypatch.setattr(warmup_service, "get_openai_client", lambda settings: FailingClient())

    warmup_service.warm_verification_dependencies(Settings(openai_api_key="test-key"))
