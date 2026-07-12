from sqlalchemy import Column, DateTime, Integer, String, func

from app.db.session import Base

# fleet_manager | driver | safety_officer | financial_analyst
ROLES = ("fleet_manager", "driver", "safety_officer", "financial_analyst")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(40), nullable=False, default="driver")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
