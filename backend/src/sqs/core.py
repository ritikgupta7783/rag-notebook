import asyncio
import json
from typing import Awaitable, Callable

from configs.sqs import QUEUE_URL, sqs

class PermanentMessageError(Exception):
    pass

HANDLERS: dict[str, Callable[[dict], Awaitable[None]]] = {}

def register_handler(event: str):
    if event in HANDLERS:
        raise ValueError(f"Event {event!r} is already registered")

    def decorator(handler: Callable[[dict], Awaitable[None]]):
        HANDLERS[event] = handler
        return handler

    return decorator

async def process_message(message: dict) -> None:
    body = json.loads(message["Body"])
    handler = HANDLERS.get(body.get("event"))
    if handler is None:
        raise PermanentMessageError(f"Unknown event: {body.get('event')}")
    await handler(body)

async def acknowledge_message(message: dict) -> None:
    try:
        await asyncio.to_thread(
            sqs.delete_message,
            QueueUrl=QUEUE_URL,
            ReceiptHandle=message["ReceiptHandle"],
        )
    except Exception as error:
        print(f"[opennotebook] Failed to acknowledge message: {error}")

