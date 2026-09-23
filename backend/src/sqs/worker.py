import asyncio

from configs.sqs import QUEUE_URL, sqs
from sqs.consumers import chat, source
from sqs.core import HANDLERS, PermanentMessageError, acknowledge_message, process_message

async def consume() -> None:
    print(f"[opennotebook] SQS consumer started - {QUEUE_URL}")
    print(f"[opennotebook] Registered events: {sorted(HANDLERS)}")

    last_error = None

    while True:
        try:
            response = await asyncio.to_thread(
                sqs.receive_message,
                QueueUrl=QUEUE_URL,
                MaxNumberOfMessages=10,
                WaitTimeSeconds=20,
                VisibilityTimeout=300,
            )
        except Exception as error:
            error_message = str(error)
            if error_message != last_error:
                print(f"[opennotebook] SQS receive failed (retrying in 5s): {error_message}")
                last_error = error_message
            await asyncio.sleep(5)
            continue

        last_error = None

        for message in response.get("Messages", []):
            try:
                await process_message(message)
            except PermanentMessageError as error:
                print(f"[opennotebook] Acknowledging dead message: {error}")
                await acknowledge_message(message)
            except Exception as error:
                print(f"[opennotebook] Failed to process message (will retry): {error}")
            else:
                await acknowledge_message(message)

