from motor.motor_asyncio import AsyncIOMotorDatabase

from models.message import Message

async def list_messages(
    db: AsyncIOMotorDatabase,
    notebook_id: str,
    *,
    limit: int = 100,
) -> list[Message]:

    cursor = (
        db[Message.Collection]
        .find({"notebook_id": notebook_id})
        .sort("created_at", 1)
        .limit(limit)
    )

    return [
        Message.from_document(document)
        async for document in cursor
    ]

async def save_message(
    db: AsyncIOMotorDatabase,
    message: Message,
) -> Message:

    await db[Message.Collection].insert_one(
        message.to_document()
    )

    return message

