from datetime import datetime
from typing import ClassVar, Literal

from pydantic import BaseModel, Field, field_validator

from .common import ensure_utc, new_id, utcnow


SourceType = Literal["pdf", "docx", "txt"]
SourceStatus = Literal[
    "uploading",
    "processing",
    "ready",
    "failed",
]


class Source(BaseModel):
    Collection: ClassVar[str] = "sources"

    id: str = Field(default_factory=new_id)

    notebook_id: str
    owner_id: str

    name: str
    type: SourceType = "pdf"
    size_bytes: int = Field(default=0, ge=0)
    s3_key: str

    status: SourceStatus = "uploading"
    page_count: int = Field(default=0, ge=0)
    chunk_count: int = Field(default=0, ge=0)

    error: str | None = None

    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)

    @field_validator(
        "created_at",
        "updated_at",
        mode="before",
    )
    @classmethod
    def _attach_utc(cls, value: datetime) -> datetime:
        return ensure_utc(value)

    def touch(self) -> None:
        self.updated_at = utcnow()

    def mark_processing(self) -> None:
        self.status = "processing"
        self.error = None
        self.touch()

    def mark_ready(
        self,
        *,
        page_count: int,
        chunk_count: int,
    ) -> None:
        self.status = "ready"
        self.page_count = page_count
        self.chunk_count = chunk_count
        self.error = None
        self.touch()

    def mark_failed(self, error: str) -> None:
        self.status = "failed"
        self.error = error
        self.touch()

    def to_document(self) -> dict:
        document = self.model_dump()
        document["_id"] = document.pop("id")
        return document

    @classmethod
    def from_document(cls, document: dict) -> "Source":
        document = dict(document)
        document["id"] = document.pop("_id")
        return cls.model_validate(document)
