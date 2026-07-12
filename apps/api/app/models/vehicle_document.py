from __future__ import annotations

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.db.session import Base


class VehicleDocument(Base):
    __tablename__ = "vehicle_documents"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    doc_type = Column(String(80), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)