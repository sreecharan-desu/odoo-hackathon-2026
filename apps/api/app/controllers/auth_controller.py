from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services.driver_service import DriverService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


def _user_response(db: Session, user: User) -> UserResponse:
    linked = DriverService.get_by_user(db, user.id)
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        driver_id=linked.id if linked else None,
    )


@router.post("/register", response_model=UserResponse)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    # Public signup defaults to driver; managers are seeded / promoted by admin later
    role = payload.role if payload.role == "driver" else "driver"
    user = UserService.register(
        db, email=payload.email, name=payload.name, password=payload.password, role=role
    )
    return _user_response(db, user)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = UserService.authenticate(db, email=payload.email, password=payload.password)
    token = create_access_token(subject=user.email, role=user.role)
    return TokenResponse(access_token=token, user=_user_response(db, user))


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserResponse:
    return _user_response(db, user)
