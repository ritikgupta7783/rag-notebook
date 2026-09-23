from motor.motor_asyncio import AsyncIOMotorDatabase

from models.common import utcnow
from models.message import Message
from models.notebook import Notebook
from models.source import Source
from services.qdrant import delete_source_chunks
from services.s3 import delete_from_s3

async def list_notebooks(
    db: AsyncIOMotorDatabase,
    owner_id: str,
) -> list[Notebook]:
    cursor = db[Notebook.Collection].find({"owner_id": owner_id}).sort("updated_at", -1)
    return [Notebook.from_document(doc) async for doc in cursor]

async def get_notebook(
    db: AsyncIOMotorDatabase,
    notebook_id: str,
    owner_id: str,
) -> Notebook | None:
    doc = await db[Notebook.Collection].find_one(
        {"_id": notebook_id, "owner_id": owner_id}
    )
    return Notebook.from_document(doc) if doc else None

async def create_notebook(
    db: AsyncIOMotorDatabase,
    owner_id: str,
    title: str,
    description: str = "",
) -> Notebook:
    notebook = Notebook(
        owner_id=owner_id,
        title=title.strip(),
        description=description.strip(),
    )
    await db[Notebook.Collection].insert_one(notebook.to_document())
    return notebook

async def count_sources(db: AsyncIOMotorDatabase, notebook_id: str) -> int:
    return await db[Source.Collection].count_documents({"notebook_id": notebook_id})

async def update_notebook(
    db: AsyncIOMotorDatabase,
    notebook_id: str,
    owner_id: str,
    title: str,
) -> Notebook | None:
    result = await db[Notebook.Collection].update_one(
        {"_id": notebook_id, "owner_id": owner_id},
        {"$set": {"title": title.strip(), "updated_at": utcnow()}},
    )
    if result.matched_count == 0:
        return None
    return await get_notebook(db, notebook_id, owner_id)

async def delete_notebook(
    db: AsyncIOMotorDatabase,
    notebook_id: str,
    owner_id: str,
) -> bool:
    notebook = await get_notebook(db, notebook_id, owner_id)
    if not notebook:
        return False

    cursor = db[Source.Collection].find({"notebook_id": notebook_id})
    sources = [Source.from_document(document) async for document in cursor]

    for source in sources:
        if source.s3_key:
            try:
                delete_from_s3(source.s3_key)
            except Exception:
                pass
        try:
            delete_source_chunks(source.id)
        except Exception:
            pass

    await db[Source.Collection].delete_many({"notebook_id": notebook_id})
    await db[Message.Collection].delete_many({"notebook_id": notebook_id})
    await db[Notebook.Collection].delete_one({"_id": notebook_id})

    return True

