from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.core.security import create_access_token
from app.models.user import User
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    # Public signup defaults to driver; managers are seeded / promoted by admin later
    role = payload.role if payload.role == "driver" else "driver"
    return UserService.register(
        db, email=payload.email, name=payload.name, password=payload.password, role=role
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = UserService.authenticate(db, email=payload.email, password=payload.password)
    token = create_access_token(subject=user.email, role=user.role)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user
