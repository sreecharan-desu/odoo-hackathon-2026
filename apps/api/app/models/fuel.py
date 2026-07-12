from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, func

from app.db.session import Base


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    liters = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)
    trip_id = Column(Integer, ForeignKey("trips.id"), nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
