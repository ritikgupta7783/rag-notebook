import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

JWT_ALGORITHM = "HS256"

_DEV_SECRET_KEY = "dev-only-change-me-0123456789abcdef0123456789abcdef"
SECRET_KEY = os.getenv("SECRET_KEY") or _DEV_SECRET_KEY

_IS_DEV = os.getenv("DEBUG", "true").lower() in ("1", "true", "yes", "on")
if SECRET_KEY == _DEV_SECRET_KEY and not _IS_DEV:
    raise RuntimeError("SECRET_KEY must be set when DEBUG is false (fail closed)")

def _expire_minutes() -> int:

    try:
        return int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    except ValueError:
        return 10080

ACCESS_TOKEN_EXPIRE_MINUTES = _expire_minutes()

def hash_password(password: str) -> str:

    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:

    return password_hash.verify(plain_password, hashed_password)

def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:

    expires_at = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    payload = {
        "sub": subject,
        "iat": datetime.now(timezone.utc),
        "exp": expires_at,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> str | None:

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
    except jwt.PyJWTError:
        return None

    return payload.get("sub")

