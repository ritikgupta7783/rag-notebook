import asyncio

from configs.db import get_db
from models.common import utcnow
from models.source import Source
from services.embeddings import embed_texts
from services.qdrant import insert_chunks
from sqs.core import PermanentMessageError, register_handler
from utils.chat import extract_and_chunk

db = get_db()

BATCH_SIZE = 32

@register_handler("source.processing")
async def handle_source_processing(body: dict) -> None:
    source_id = body["source_id"]
    notebook_id = body["notebook_id"]

    print(f"[opennotebook] Processing source={source_id} notebook={notebook_id}")

    source = await db[Source.Collection].find_one(
        {"_id": source_id, "notebook_id": notebook_id}
    )

    if not source:
        raise PermanentMessageError(f"Source not found: {source_id}")

    s3_key = source.get("s3_key")

    if not s3_key:
        raise PermanentMessageError(f"Source has no S3 key: {source_id}")

    try:
        await db[Source.Collection].update_one(
            {"_id": source_id},
            {"$set": {"status": "processing", "error": None, "updated_at": utcnow()}},
        )

        page_count, chunks = await asyncio.to_thread(
            extract_and_chunk,
            s3_key=s3_key,
            source_id=source_id,
            notebook_id=notebook_id,
            filename=source["name"],
        )

        if not chunks:
            raise PermanentMessageError("No readable text found in PDF")

        for start in range(0, len(chunks), BATCH_SIZE):
            batch = chunks[start : start + BATCH_SIZE]

            embeddings = await embed_texts([chunk["text"] for chunk in batch])

            points = [
                {
                    "notebook_id": notebook_id,
                    "source_id": source_id,
                    "filename": source["name"],
                    "page": chunk["page"],
                    "chunk_index": chunk["chunk_index"],
                    "text": chunk["text"],
                    "embedding": embedding,
                }
                for chunk, embedding in zip(batch, embeddings)
            ]

            await asyncio.to_thread(insert_chunks, points)

        await db[Source.Collection].update_one(
            {"_id": source_id},
            {
                "$set": {
                    "status": "ready",
                    "page_count": page_count,
                    "chunk_count": len(chunks),
                    "error": None,
                    "updated_at": utcnow(),
                }
            },
        )

        print(
            f"[opennotebook] Finished source={source_id} "
            f"chunks={len(chunks)} pages={page_count}"
        )

    except PermanentMessageError:
        raise

    except Exception as error:
        await db[Source.Collection].update_one(
            {"_id": source_id},
            {"$set": {"status": "failed", "error": str(error), "updated_at": utcnow()}},
        )
        raise

