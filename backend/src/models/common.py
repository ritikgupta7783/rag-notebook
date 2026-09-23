from datetime import datetime, timezone
from uuid import uuid4

def new_id() -> str:
    return uuid4().hex

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def ensure_utc(value: datetime | None) -> datetime | None:
    if isinstance(value, datetime) and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value

