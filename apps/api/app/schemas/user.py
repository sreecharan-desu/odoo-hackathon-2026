"""Request/response schemas (Pydantic) — separate from DB models."""

from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class MessageResponse(BaseModel):
    message: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str

    model_config = {"from_attributes": True}
