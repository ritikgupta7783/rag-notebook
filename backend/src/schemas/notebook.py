from datetime import datetime

from pydantic import BaseModel, Field, field_validator

class NotebookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(default="", max_length=1000)

    @field_validator("title")
    @classmethod
    def _strip_title(cls, v: str) -> str:
        title = v.strip()
        if not title:
            raise ValueError("Title cannot be blank")
        return title

class NotebookUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=160)

    @field_validator("title")
    @classmethod
    def _strip_title(cls, v: str) -> str:
        title = v.strip()
        if not title:
            raise ValueError("Title cannot be blank")
        return title

class NotebookOut(BaseModel):
    id: str
    title: str
    description: str = ""
    source_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

