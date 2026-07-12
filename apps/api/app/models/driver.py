from sqlalchemy import Column, Date, DateTime, Float, Integer, String, func

from app.db.session import Base

DRIVER_STATUSES = ("Available", "On Trip", "Off Duty", "Suspended")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    license_number = Column(String(64), unique=True, nullable=False, index=True)
    license_category = Column(String(20), nullable=False, default="LMV")
    license_expiry = Column(Date, nullable=False)
    contact_number = Column(String(30), nullable=True)
    safety_score = Column(Float, nullable=False, default=100.0)
    status = Column(String(20), nullable=False, default="Available", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
