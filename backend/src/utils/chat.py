import os
import re
import tempfile
from typing import Any

import pymupdf

from models.message import Message
from services.chunking import chunk_text
from services.s3 import download_from_s3

SYSTEM_PROMPT = (
    "You are OpenNotebook, an AI assistant that answers questions using only "
    "the user's uploaded documents.\n\n"
    "Rules:\n"
    "1. Ground every claim in the provided context passages. Never answer from "
    "outside knowledge.\n"
    "2. If the context does not contain the answer, say you could not find it "
    "in the uploaded documents. Never guess or invent.\n"
    "3. Use markdown: **bold** for key terms, short paragraphs, and lists only "
    "when they help.\n"
    "4. Be concise and direct. Reply in the same language as the question."
)

def format_chunks(chunks: list[dict]) -> str:

    return "\n\n".join(
        f"[{i}] (Source: {chunk['filename']}, "
        f"page {chunk['page']})\n{chunk['text']}"
        for i, chunk in enumerate(chunks, start=1)
    )

def build_messages(
    question: str,
    history: list,
    chunks: list[dict],
) -> list[dict]:

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    for message in history[-6:]:
        messages.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": (
                f"Context passages from the user's documents:\n\n"
                f"{format_chunks(chunks)}\n\n"
                f"Question: {question}\n\n"
                "Answer the question using ONLY the context above."
            ),
        }
    )

    return messages

MAX_CHUNKS = 8

NO_SOURCES_CONTENT = (
    "This notebook doesn't have any processed sources yet. "
    "Upload a PDF and wait for it to finish processing, "
    "then ask me again."
)

NO_MATCH_CONTENT = (
    "I couldn't find anything relevant in this notebook's sources "
    "to answer that. Try rephrasing your question, or upload more "
    "documents for better coverage."
)

GREETING_RE = re.compile(
    r"^(hi+|hello+|hey+|yo|howdy|hola|namaste|greetings|"
    r"good (morning|afternoon|evening)|what'?s up|sup)"
    r"( there)?[\s!.,?]*$",
    re.IGNORECASE,
)

def match_greeting(question: str) -> str | None:

    match = GREETING_RE.match(question.strip())

    if not match:
        return None

    return match.group(1).strip().capitalize()

def greeting_content(
    question: str,
    *,
    has_sources: bool,
) -> str | None:

    greeting = match_greeting(question)

    if not greeting:
        return None

    if has_sources:
        return (
            f"{greeting}! What can I help you with "
            "from the sources you uploaded?"
        )

    return f"{greeting}! Please upload some sources to ask questions."

def chunks_from_points(points: list[Any]) -> list[dict]:

    return [
        {
            "source_id": point.payload["source_id"],
            "filename": point.payload["filename"],
            "page": point.payload.get("page"),
            "text": point.payload["text"],
            "score": float(point.score or 0.0),
        }
        for point in points
    ]

def assistant_message(
    *,
    notebook_id: str,
    content: str,
    model: str | None = None,
) -> Message:

    return Message(
        notebook_id=notebook_id,
        role="assistant",
        content=content,
        model=model,
    )

def extract_and_chunk(
    *,
    s3_key: str,
    source_id: str,
    notebook_id: str,
    filename: str,
) -> tuple[int, list[dict]]:

    with tempfile.NamedTemporaryFile(
        suffix=".pdf",
        delete=False,
    ) as temp_file:
        temp_path = temp_file.name

    page_count = 0
    all_chunks: list[dict] = []

    try:
        download_from_s3(
            s3_key,
            temp_path,
        )

        document = pymupdf.open(temp_path)

        try:
            page_count = document.page_count

            for page_number, page in enumerate(
                document,
                start=1,
            ):
                chunks = chunk_text(
                    page.get_text("text"),
                    page=page_number,
                )

                for chunk in chunks:
                    chunk.update(
                        {
                            "source_id": source_id,
                            "notebook_id": notebook_id,
                            "filename": filename,
                        }
                    )

                all_chunks.extend(chunks)

        finally:
            document.close()

    finally:
        try:
            os.unlink(temp_path)
        except FileNotFoundError:
            pass

    return page_count, all_chunks

