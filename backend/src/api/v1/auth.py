from fastapi import APIRouter, HTTPException, status

from schemas.auth import LoginRequest, SignupRequest, Token, UserOut
from services.auth import authenticate_user, create_user, update_last_login
from utils.deps import CurrentUser, Db
from utils.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post(
    "/signup",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
async def signup(
    payload: SignupRequest,
    db: Db,
) -> UserOut:
    try:
        user = await create_user(
            db=db,
            name=payload.name,
            email=payload.email,
            password=payload.password,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        )

    return UserOut(id=user.id, name=user.name, email=user.email)

@router.post(
    "/login",
    response_model=Token,
)
async def login(
    payload: LoginRequest,
    db: Db,
) -> Token:
    user = await authenticate_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await update_last_login(db, user.id)

    return Token(access_token=create_access_token(user.id))

@router.post(
    "/logout",
)
async def logout() -> dict[str, str]:
    return {"status": "ok"}

@router.get(
    "/me",
    response_model=UserOut,
)
async def me(
    current_user: CurrentUser,
) -> UserOut:
    return UserOut(id=current_user.id, name=current_user.name, email=current_user.email)

