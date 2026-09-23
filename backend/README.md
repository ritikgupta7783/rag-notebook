# OpenNotebook — Backend

FastAPI backend backed by **MongoDB** (async via [Motor](https://www.mongodb.com/docs/drivers/motor/)).

## Structure

```
src/
├── main.py            # entry point (uvicorn), CORS, /health, lifespan
├── api/v1/            # routers: auth, notebooks, sources, chat
├── configs/           # db (Motor client) + env-driven configuration
├── middlewares/       # auth + logging middleware
├── models/            # MongoDB document models (Pydantic)
├── schemas/           # API request/response schemas (Pydantic)
├── services/          # business logic: auth, notebook, rag pipeline stubs
├── llm/               # LLM provider wrapper + prompts (RAG pipeline)
├── sqs/               # SQS client / producer / consumer (async RAG pipeline)
└── utils/             # shared deps (Db, get_current_user) + password/JWT security
```

## Setup

```bash
cd backend
uv sync

# MongoDB — either run it locally, or set your Atlas connection string:
cp .env.example .env   # then edit MONGODB_URI (e.g. mongodb+srv://…) and
                       # DB_NAME (the database name).
```

## Run

Either command works from the `backend` directory (configuration comes from `.env`):

```bash
uv run uvicorn main:app --app-dir src --reload
# or
uv run uvicorn src.main:app --reload
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Test

Tests run against an in-memory MongoDB mock (no server needed):

```bash
uv run pytest
```

> Note: the `tests/` folder was removed; the dev deps (`pytest`, `mongomock-motor`) are still declared for when it comes back.

## Troubleshooting

**Server starts but the log says `MongoDB unreachable`** — the app boots
anyway (DB requests fail until connectivity returns). If you use Atlas:

1. Atlas → **Network Access** → add your current IP (or `0.0.0.0/0` for dev).
   A missing allowlist entry shows up as an abrupt
   `SSL handshake failed: tlsv1 alert internal error` — not a clean timeout.
2. Atlas → **Database Access** → confirm the user in `MONGODB_URI` exists.
3. Set the database name via the `DB_NAME` env var in `.env`
   (e.g. `DB_NAME=opennotebook`).
4. Restart the server — a successful start logs
   `MongoDB connected … indexes ready`.

## Background jobs (SQS)

Long-running work is queued on SQS and processed **inside the app** — the
worker (`sqs/worker.py`) polls one queue (`AWS_SQS_QUEUE_URL`) and routes
each message to the consumer registered for its event type (via
`sqs/core.py`'s `register_handler`):

- `source.processing` → `sqs/consumers/source.py` — ingest a PDF: download
  from S3 → extract text page by page → chunk → embed (OpenRouter) → upsert
  into Qdrant → mark the source `ready`.
- `chat.ask` → `sqs/consumers/chat.py` — answer a question: embed the query →
  retrieve chunks from Qdrant → generate a grounded answer → persist the
  assistant message.

The worker is started automatically in `main.py`'s lifespan, so there is no
separate process to run. Just start the API:

```bash
uv run uvicorn main:app --app-dir src --reload
```

The chat flow is asynchronous: `POST /api/v1/ask` persists the user message,
queues a `chat.ask` job, and returns `202`; the frontend polls the history
endpoint until the reply appears and reveals it progressively to simulate
streaming.

### Required AWS IAM permissions

The IAM user used by `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` must be
allowed to act on the SQS queue in `AWS_SQS_QUEUE_URL`:

- `sqs:SendMessage` — the API (producer) needs this to enqueue uploads.
- `sqs:ReceiveMessage` + `sqs:DeleteMessage` — the consumer needs these.

If `SendMessage` is missing, uploads still succeed (S3 + metadata) but the
source is marked `failed` with the reason; if `ReceiveMessage`/`DeleteMessage`
are missing, the consumer retries every 5s and prints the AccessDenied error.

## API

| Method | Path                  | Auth   | Description              |
| ------ | --------------------- | ------ | ------------------------ |
| POST   | `/api/v1/auth/signup` | —      | Create account (201/409) |
| POST   | `/api/v1/auth/login`  | —      | Get JWT (Bearer token)   |
| POST   | `/api/v1/auth/logout` | —      | Stateless no-op          |
| GET    | `/api/v1/auth/me`     | Bearer | Current user             |
| GET    | `/api/v1/notebooks`   | Bearer | List user's notebooks    |
| POST   | `/api/v1/notebooks`   | Bearer | Create a notebook        |
| GET    | `/api/v1/sources`     | Bearer | List a notebook's sources (`?notebook_id=`) |
| POST   | `/api/v1/sources`     | Bearer | Upload a PDF (`multipart file` + `notebook_id`) |
| DELETE | `/api/v1/sources/:id` | Bearer | Delete a source (S3 + Qdrant + metadata) |
| POST   | `/api/v1/ask`        | Bearer | Queue a question — answered async via SQS (202) |
| GET    | `/api/v1/ask`        | Bearer | Notebook conversation history (`?notebook_id=`) |
