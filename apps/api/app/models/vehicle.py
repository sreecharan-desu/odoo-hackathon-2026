from sqlalchemy import Column, DateTime, Float, Integer, String, func

from app.db.session import Base

VEHICLE_STATUSES = ("Available", "On Trip", "In Shop", "Retired")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(64), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    vehicle_type = Column(String(60), nullable=False, default="Van")
    max_load_kg = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False, default=0.0)
    acquisition_cost = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="Available", index=True)
    region = Column(String(80), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
