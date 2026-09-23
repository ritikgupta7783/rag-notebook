from configs.sqs import publish_message

def publish_source_processing(
    *,
    source_id: str,
    notebook_id: str,
) -> str:
    return publish_message(
        {
            "event": "source.processing",
            "source_id": source_id,
            "notebook_id": notebook_id,
        }
    )

def publish_retrieval_request(
    *,
    notebook_id: str,
    user_message_id: str,
    question: str,
) -> str:
    return publish_message(
        {
            "event": "chat.ask",
            "notebook_id": notebook_id,
            "user_message_id": user_message_id,
            "question": question,
        }
    )

