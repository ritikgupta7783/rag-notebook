from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from utils.security import decode_access_token

class AuthMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("Authorization", "")

        if auth_header.lower().startswith("bearer "):
            user_id = decode_access_token(auth_header[7:].strip())
            if user_id:
                request.state.user_id = user_id

        return await call_next(request)

