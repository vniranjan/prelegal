from types import SimpleNamespace

from fastapi.testclient import TestClient

from app import chat as chat_module
from app.main import app


def _fake_completion_returning(reply: str, data: dict):
    from app.schemas import ChatResponse

    content = ChatResponse(reply=reply, data=data).model_dump_json()

    def fake_completion(**kwargs):
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
        )

    return fake_completion


def test_chat_requires_login():
    with TestClient(app) as client:
        response = client.post(
            "/api/chat", json={"messages": [], "data": {}}
        )
        assert response.status_code == 401


def test_chat_returns_reply_and_data(monkeypatch):
    monkeypatch.setattr(
        chat_module,
        "completion",
        _fake_completion_returning(
            reply="Got it, what's the effective date?",
            data={"purpose": "evaluating a partnership"},
        ),
    )

    with TestClient(app) as client:
        client.post(
            "/api/login", json={"email": "chatuser@example.com", "password": "x"}
        )
        response = client.post(
            "/api/chat",
            json={
                "messages": [
                    {"role": "user", "content": "We're evaluating a partnership"}
                ],
                "data": {},
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Got it, what's the effective date?"
    assert body["data"]["purpose"] == "evaluating a partnership"


def test_chat_returns_502_when_llm_call_fails(monkeypatch):
    def failing_completion(**kwargs):
        raise RuntimeError("provider unavailable")

    monkeypatch.setattr(chat_module, "completion", failing_completion)

    with TestClient(app) as client:
        client.post(
            "/api/login", json={"email": "chatfail@example.com", "password": "x"}
        )
        response = client.post(
            "/api/chat",
            json={"messages": [{"role": "user", "content": "hi"}], "data": {}},
        )

    assert response.status_code == 502
