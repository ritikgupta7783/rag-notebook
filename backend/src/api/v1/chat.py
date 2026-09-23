from fastapi import APIRouter, HTTPException, Query, status

from models.message import Message
from schemas.chat import AskRequest, MessageOut
from services.chat import list_messages, save_message
from services.notebook import get_notebook
from sqs.producer import publish_retrieval_request
from utils.deps import CurrentUser, Db

router = APIRouter(
    prefix="/ask",
    tags=["chat"],
)

@router.post(
    "",
    response_model=MessageOut,
    status_code=status.HTTP_202_ACCEPTED,
)
async def ask(
    payload: AskRequest,
    current_user: CurrentUser,
    db: Db,
) -> MessageOut:

    notebook = await get_notebook(
        db,
        payload.notebook_id,
        current_user.id,
    )

    if notebook is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found",
        )

    user_message = Message(
        notebook_id=payload.notebook_id,
        role="user",
        content=payload.question,
    )
    await save_message(db, user_message)

    try:
        publish_retrieval_request(
            notebook_id=payload.notebook_id,
            user_message_id=user_message.id,
            question=payload.question,
        )
    except Exception as error:
        print(
            f"[opennotebook] Could not queue question for notebook "
            f"{payload.notebook_id}: {error}"
        )
        await save_message(
            db,
            Message(
                notebook_id=payload.notebook_id,
                role="assistant",
                status="failed",
                content="Could not start the answer. Please try again.",
            ),
        )

    return MessageOut.model_validate(user_message)

@router.get(
    "",
    response_model=list[MessageOut],
)
async def message_history(
    current_user: CurrentUser,
    db: Db,
    notebook_id: str = Query(...),
) -> list[MessageOut]:

    notebook = await get_notebook(
        db,
        notebook_id,
        current_user.id,
    )

    if notebook is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found",
        )

    messages = await list_messages(
        db,
        notebook_id,
        limit=200,
    )

    return [
        MessageOut.model_validate(message)
        for message in messages
    ]

