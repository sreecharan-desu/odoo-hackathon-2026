from __future__ import annotations
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.exceptions.handlers import AppError
from app.models.user import ROLES, User


class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def list_users(db: Session, limit: int = 50) -> list[User]:
        return db.query(User).order_by(User.id.desc()).limit(limit).all()

    @staticmethod
    def register(db: Session, *, email: str, name: str, password: str, role: str = "driver") -> User:
        if role not in ROLES:
            raise AppError(f"Invalid role. Allowed: {', '.join(ROLES)}")
        if UserService.get_by_email(db, email):
            raise AppError("Email already registered", status_code=409)
        user = User(email=email.lower().strip(), name=name.strip(), password_hash=hash_password(password), role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate(db: Session, *, email: str, password: str) -> User:
        user = UserService.get_by_email(db, email.lower().strip())
        if not user or not verify_password(password, user.password_hash):
            raise AppError("Invalid email or password", status_code=401)
        return user
