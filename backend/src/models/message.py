from datetime import datetime
from typing import ClassVar, Literal

from pydantic import BaseModel, Field, field_validator

from .common import ensure_utc, new_id, utcnow

class Message(BaseModel):

    Collection: ClassVar[str] = "messages"

    id: str = Field(default_factory=new_id)
    notebook_id: str

    role: Literal["user", "assistant"]

    status: Literal[
        "streaming",
        "complete",
        "failed",
    ] = "complete"

    content: str = ""

    model: str | None = None

    created_at: datetime = Field(
        default_factory=utcnow,
    )

    updated_at: datetime = Field(
        default_factory=utcnow,
    )

    @field_validator(
        "created_at",
        "updated_at",
        mode="before",
    )
    @classmethod
    def _attach_utc(cls, value):
        return ensure_utc(value)

    def to_document(self) -> dict:

        doc = self.model_dump()
        doc["_id"] = doc.pop("id")
        return doc

    @classmethod
    def from_document(
        cls,
        doc: dict,
    ) -> "Message":

        doc = dict(doc)
        doc["id"] = doc.pop("_id")
        return cls.model_validate(doc)

