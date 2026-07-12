from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func

from app.db.session import Base

TRIP_STATUSES = ("Draft", "Dispatched", "Completed", "Cancelled")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    source = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=False, index=True)
    cargo_weight = Column(Float, nullable=False)
    planned_distance = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="Draft", index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    final_odometer = Column(Float, nullable=True)
    fuel_consumed = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
