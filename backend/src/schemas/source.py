from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SourceType = Literal["pdf", "docx", "txt"]
SourceStatus = Literal[
    "uploading",
    "processing",
    "ready",
    "failed",
]

class SourceOut(BaseModel):
    id: str
    name: str
    type: SourceType

    status: SourceStatus

    size_bytes: int = Field(ge=0)
    page_count: int = Field(ge=0)
    chunk_count: int = Field(ge=0)

    error: str | None = None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

