# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The current implementation covers only the Mutual NDA (via a plain form, not AI chat yet) behind a fake login screen with no persistence. See "Implementation status" at the end of this file for details.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

There is an OPENROUTER_API_KEY in the .env file in the project root.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
Consider statically building the frontend and serving it via FastAPI, if that will work.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Color Scheme
- Accent Yellow: `#ecad0a`
- Blue Primary: `#209dd7`
- Purple Secondary: `#753991` (submit buttons)
- Dark Navy: `#032147` (headings)
- Gray Text: `#888888`

## Implementation status

**Done (PL-3, PL-4):**
- `frontend/`: Next.js app, statically exported (`output: "export"`). `/` is a fake login screen (any email/password succeeds); `/app` is the Mutual NDA Creator prototype (form + live preview + PDF download), session-gated behind login.
- `backend/`: uv-managed FastAPI service serving the static frontend plus `/api/login`, `/api/logout`, `/api/me` (cookie-based session, no real auth) and `/health`. SQLite `users`/`sessions` schema is dropped and recreated on every startup — temporary by design, no persistence across restarts.
- Packaged as a single Docker image (`Dockerfile`); `scripts/start-*`/`stop-*` for mac/linux/windows build and run it.
- Backend test suite: `backend/tests/`, run via `uv run pytest`.

**Not yet implemented:**
- Real user authentication and durable document/user persistence.
- AI chat for establishing document type and filling in fields (see "AI design" above) — the Mutual NDA form is currently filled in manually, not via chat.
- The other 10 document types from `catalog.json` — only the Mutual NDA is wired into the frontend.
