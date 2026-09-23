from pydantic import BaseModel, EmailStr, Field, field_validator

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)

class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, v: str) -> str:
        name = v.strip()
        if not name:
            raise ValueError("Name cannot be blank")
        return name

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

