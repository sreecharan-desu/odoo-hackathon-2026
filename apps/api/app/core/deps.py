from __future__ import annotations
from collections.abc import Callable, Generator

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.exceptions.handlers import AppError
from app.models.user import User
from app.services.user_service import UserService


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError("Authentication required", status_code=401)
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = decode_access_token(token)
        email = payload.get("sub")
    except Exception as exc:  # noqa: BLE001
        raise AppError("Invalid or expired token", status_code=401) from exc
    user = UserService.get_by_email(db, email) if email else None
    if not user:
        raise AppError("User not found", status_code=401)
    return user


def require_roles(*roles: str) -> Callable:
    def _dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise AppError("You do not have permission for this action", status_code=403)
        return user

    return _dep
