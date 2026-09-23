import asyncio

from configs.db import get_db
from configs.llm import CHAT_MODEL, llm
from models.message import Message
from models.source import Source
from services.chat import list_messages, save_message
from services.embeddings import embed_query
from services.qdrant import search_chunks
from sqs.core import PermanentMessageError, register_handler
from utils.chat import (
    MAX_CHUNKS,
    NO_MATCH_CONTENT,
    NO_SOURCES_CONTENT,
    assistant_message,
    build_messages,
    chunks_from_points,
    greeting_content,
)

db = get_db()

FAILED_CONTENT = "Could not generate an answer. Please try again."

@register_handler("chat.ask")
async def handle_chat_ask(body: dict) -> None:
    notebook_id = body["notebook_id"]
    user_message_id = body["user_message_id"]
    question = body["question"]

    if await _reply_exists(notebook_id, user_message_id):
        print(f"[opennotebook] Reply already exists for message={user_message_id} — skipping")
        return

    print(f"[opennotebook] Retrieving notebook={notebook_id}: {question[:80]}")

    try:
        reply = await _answer(notebook_id, user_message_id, question)
        await save_message(db, reply)
    except Exception as error:
        print(f"[opennotebook] Retrieval failed for notebook={notebook_id}: {error}")
        await save_message(
            db,
            Message(
                notebook_id=notebook_id,
                role="assistant",
                status="failed",
                content=FAILED_CONTENT,
            ),
        )
        raise PermanentMessageError("Retrieval failed; reply persisted as failed") from error

async def _reply_exists(notebook_id: str, user_message_id: str) -> bool:
    messages = await list_messages(db, notebook_id, limit=200)
    index = next(
        (i for i, message in enumerate(messages) if message.id == user_message_id),
        -1,
    )
    return index != -1 and any(
        message.role == "assistant" for message in messages[index + 1 :]
    )

async def _answer(notebook_id: str, user_message_id: str, question: str) -> Message:
    ready_count = await db[Source.Collection].count_documents(
        {"notebook_id": notebook_id, "status": "ready"}
    )

    greeting = greeting_content(question, has_sources=ready_count > 0)

    if greeting:
        return assistant_message(notebook_id=notebook_id, content=greeting)

    if ready_count == 0:
        return assistant_message(notebook_id=notebook_id, content=NO_SOURCES_CONTENT)

    query_vector = await embed_query(question)

    points = await asyncio.to_thread(
        search_chunks,
        notebook_id=notebook_id,
        query_vector=query_vector,
        limit=MAX_CHUNKS,
    )

    chunks = chunks_from_points(points)

    if not chunks:
        return assistant_message(notebook_id=notebook_id, content=NO_MATCH_CONTENT)

    history = await list_messages(db, notebook_id, limit=20)
    history = [
        message
        for message in history
        if message.id != user_message_id and message.status != "failed"
    ]

    response = await llm.chat.completions.create(
        model=CHAT_MODEL,
        messages=build_messages(question, history, chunks),
        temperature=0.2,
        max_tokens=1200,
    )

    content = (
        response.choices[0].message.content or ""
        if response.choices
        else ""
    )

    if not content.strip():
        raise RuntimeError("Empty model response")

    return assistant_message(
        notebook_id=notebook_id,
        content=content,
        model=CHAT_MODEL,
    )

