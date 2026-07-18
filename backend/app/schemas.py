from typing import Literal

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class NdaChatData(BaseModel):
    """Flat, all-optional mirror of the frontend's NdaFormData, used as the
    LLM's structured-output schema and echoed back to the frontend to merge."""

    purpose: str | None = None
    effective_date: str | None = None
    mnda_term_type: Literal["expires", "continues"] | None = None
    mnda_term_years: str | None = None
    confidentiality_term_type: Literal["years", "perpetuity"] | None = None
    confidentiality_term_years: str | None = None
    governing_law_state: str | None = None
    jurisdiction: str | None = None
    party1_name: str | None = None
    party1_title: str | None = None
    party1_company: str | None = None
    party1_notice_address: str | None = None
    party2_name: str | None = None
    party2_title: str | None = None
    party2_company: str | None = None
    party2_notice_address: str | None = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    data: NdaChatData


class ChatResponse(BaseModel):
    reply: str
    data: NdaChatData
