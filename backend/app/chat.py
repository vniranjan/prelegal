from fastapi import APIRouter, Depends, HTTPException
from litellm import completion

from app.auth import get_current_user
from app.schemas import ChatRequest, ChatResponse, UserResponse

router = APIRouter(prefix="/api", tags=["chat"])

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = """You are a friendly assistant helping a user fill in the cover page of a \
Common Paper Mutual NDA through natural conversation. Ask about one or two related fields \
at a time rather than listing everything at once.

Fields to collect (all optional, fill in as you learn them):
- purpose: the business reason the parties are sharing confidential information
- effective_date: the date the NDA takes effect, normalized to ISO format YYYY-MM-DD
- mnda_term_type: "expires" or "continues"; mnda_term_years: number of years as a string, \
only when mnda_term_type is "expires"
- confidentiality_term_type: "years" or "perpetuity"; confidentiality_term_years: number of \
years as a string, only when confidentiality_term_type is "years"
- governing_law_state: e.g. "Delaware"
- jurisdiction: e.g. "courts located in New Castle, DE"
- party1_name, party1_title, party1_company, party1_notice_address: the first party's details
- party2_name, party2_title, party2_company, party2_notice_address: the second party's details

Rules:
- Always return the complete set of fields you know, carrying forward everything listed in \
"Known so far" below unless the user's latest message corrects it.
- Never invent a value the user hasn't provided.
- Once every field is filled in, tell the user the NDA is ready to review, and let them know \
they can ask you to change anything."""


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest, user: UserResponse = Depends(get_current_user)
) -> ChatResponse:
    known_so_far = body.data.model_dump_json(exclude_none=True)
    messages = [
        {
            "role": "system",
            "content": f"{SYSTEM_PROMPT}\n\nKnown so far: {known_so_far}",
        },
        *[{"role": m.role, "content": m.content} for m in body.messages],
    ]

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        result = response.choices[0].message.content
        return ChatResponse.model_validate_json(result)
    except Exception as exc:
        raise HTTPException(
            status_code=502, detail="Chat service unavailable"
        ) from exc
