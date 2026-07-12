from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, func

from app.db.session import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False, index=True)
    category = Column(String(60), nullable=False)  # Fuel, Tolls, Repairs, Other
    amount = Column(Float, nullable=False)
    note = Column(Text, nullable=True)
    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
