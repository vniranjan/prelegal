import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response

from app.db import get_connection
from app.schemas import LoginRequest, UserResponse

router = APIRouter(prefix="/api", tags=["auth"])

SESSION_COOKIE = "session_id"


def get_current_user(session_id: str | None = Cookie(default=None)) -> UserResponse:
    if session_id is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    conn = get_connection()
    try:
        row = conn.execute(
            """
            SELECT users.id, users.email FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token = ?
            """,
            (session_id,),
        ).fetchone()
    finally:
        conn.close()

    if row is None:
        raise HTTPException(status_code=401, detail="Not logged in")

    return UserResponse(id=row["id"], email=row["email"])


@router.post("/login", response_model=UserResponse)
def login(body: LoginRequest, response: Response) -> UserResponse:
    """Fake login: any email/password succeeds. Creates the user if new."""
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (email) VALUES (?) ON CONFLICT(email) DO NOTHING",
            (body.email,),
        )
        conn.commit()
        user = conn.execute(
            "SELECT id, email FROM users WHERE email = ?", (body.email,)
        ).fetchone()

        token = secrets.token_urlsafe(32)
        conn.execute(
            "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
            (token, user["id"]),
        )
        conn.commit()
    finally:
        conn.close()

    response.set_cookie(
        SESSION_COOKIE, token, httponly=True, samesite="lax", path="/"
    )
    return UserResponse(id=user["id"], email=user["email"])


@router.post("/logout")
def logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(SESSION_COOKIE, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserResponse)
def me(user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return user
