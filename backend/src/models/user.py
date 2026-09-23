from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel, Field, field_validator

from .common import ensure_utc, new_id, utcnow


class User(BaseModel):
    Collection: ClassVar[str] = "users"

    id: str = Field(default_factory=new_id)
    name: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    last_login_at: datetime | None = None

    @field_validator(
        "created_at",
        "updated_at",
        "last_login_at",
        mode="before",
    )
    @classmethod
    def _attach_utc(cls, v):
        return ensure_utc(v)

    def to_document(self) -> dict:
        doc = self.model_dump()
        doc["_id"] = doc.pop("id")
        return doc

    @classmethod
    def from_document(cls, doc: dict) -> "User":
        doc = dict(doc)
        doc["id"] = doc.pop("_id")
        return cls.model_validate(doc)
