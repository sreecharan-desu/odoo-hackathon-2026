from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from app.db.session import Base

MAINTENANCE_STATUSES = ("Open", "Closed")


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    estimated_cost = Column(Float, nullable=False, default=0.0)
    status = Column(String(20), nullable=False, default="Open", index=True)
    opened_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)
