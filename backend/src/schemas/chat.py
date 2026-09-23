from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

class AskRequest(BaseModel):

    question: str = Field(
        min_length=1,
        max_length=10_000,
    )
    notebook_id: str

class MessageOut(BaseModel):

    id: str
    role: Literal["user", "assistant"]
    status: Literal[
        "streaming",
        "complete",
        "failed",
    ]

    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

