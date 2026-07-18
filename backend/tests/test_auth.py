from fastapi.testclient import TestClient

from app.main import app


def test_login_creates_user_and_sets_session_cookie():
    with TestClient(app) as client:
        response = client.post(
            "/api/login", json={"email": "alice@example.com", "password": "anything"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == "alice@example.com"
        assert "session_id" in response.cookies


def test_me_without_cookie_is_unauthorized():
    with TestClient(app) as client:
        response = client.get("/api/me")
        assert response.status_code == 401


def test_me_with_valid_session_returns_user():
    with TestClient(app) as client:
        client.post(
            "/api/login", json={"email": "bob@example.com", "password": "anything"}
        )
        response = client.get("/api/me")
        assert response.status_code == 200
        assert response.json()["email"] == "bob@example.com"


def test_logout_clears_session():
    with TestClient(app) as client:
        client.post(
            "/api/login", json={"email": "carol@example.com", "password": "anything"}
        )
        client.post("/api/logout")
        response = client.get("/api/me")
        assert response.status_code == 401


def test_login_reuses_existing_user_on_repeat_login():
    with TestClient(app) as client:
        first = client.post(
            "/api/login", json={"email": "dave@example.com", "password": "x"}
        )
        second = client.post(
            "/api/login", json={"email": "dave@example.com", "password": "y"}
        )
        assert first.json()["id"] == second.json()["id"]
