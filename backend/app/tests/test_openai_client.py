from app.config import Settings
from app.providers.openai import client as openai_client


def test_openai_client_is_cached_by_timeout_and_retry_settings(monkeypatch) -> None:
    created_clients = []

    class FakeOpenAI:
        def __init__(self, **kwargs):
            self.kwargs = kwargs
            created_clients.append(self)

    monkeypatch.setattr(openai_client, "OpenAI", FakeOpenAI)
    openai_client.clear_openai_client_cache()

    settings = Settings(openai_api_key="test-key", openai_timeout_seconds=10, openai_max_retries=0)
    first_client = openai_client.get_openai_client(settings)
    second_client = openai_client.get_openai_client(settings)
    different_timeout_client = openai_client.get_openai_client(
        Settings(openai_api_key="test-key", openai_timeout_seconds=11, openai_max_retries=0)
    )

    assert first_client is second_client
    assert different_timeout_client is not first_client
    assert created_clients[0].kwargs == {"api_key": "test-key", "timeout": 10, "max_retries": 0}
    assert len(created_clients) == 2

    openai_client.clear_openai_client_cache()
