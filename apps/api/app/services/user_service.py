from sqlalchemy.orm import Session

from app.models.user import User


class UserService:
    @staticmethod
    def get_by_email(db: Session, email: str) -> User | None:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def list_users(db: Session, limit: int = 50) -> list[User]:
        return db.query(User).order_by(User.id.desc()).limit(limit).all()
