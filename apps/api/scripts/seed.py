"""Seed TransitOps demo data (PDF Steps 1–9)."""

from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.security import hash_password  # noqa: E402
from app.db.session import Base, SessionLocal, engine  # noqa: E402
from app.models import Driver, FuelLog, MaintenanceLog, Trip, User, Vehicle  # noqa: E402
import app.models  # noqa: E402, F401


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Reset demo tables for a clean demo run
        for model in (FuelLog, MaintenanceLog, Trip, Vehicle, Driver, User):
            db.query(model).delete()
        db.commit()

        users = [
            ("fleet@example.com", "Fleet Manager", "fleet_manager"),
            ("driver@example.com", "Alex Driver", "driver"),
            ("safety@example.com", "Safety Officer", "safety_officer"),
            ("finance@example.com", "Finance Analyst", "financial_analyst"),
        ]
        password = hash_password("Password123!")
        for email, name, role in users:
            db.add(User(email=email, name=name, password_hash=password, role=role))

        van = Vehicle(
            registration_number="VAN-05",
            name="Van-05",
            vehicle_type="Van",
            max_load_kg=500,
            odometer=12000,
            acquisition_cost=850000,
            status="Available",
            region="West",
        )
        db.add(van)
        db.add(
            Vehicle(
                registration_number="TRK-12",
                name="Truck-12",
                vehicle_type="Truck",
                max_load_kg=2000,
                odometer=45000,
                acquisition_cost=1500000,
                status="Available",
                region="North",
            )
        )

        alex = Driver(
            name="Alex",
            license_number="DL-ALEX-001",
            license_category="LMV",
            license_expiry=date.today() + timedelta(days=365),
            contact_number="+91-9000000001",
            safety_score=92,
            status="Available",
        )
        db.add(alex)
        db.add(
            Driver(
                name="Expired Sam",
                license_number="DL-SAM-EXP",
                license_category="LMV",
                license_expiry=date.today() - timedelta(days=10),
                contact_number="+91-9000000002",
                safety_score=60,
                status="Available",
            )
        )
        db.commit()
        print("Seed complete.")
        print("Login: fleet@example.com / Password123!")
        print("Vehicle VAN-05 (500kg), Driver Alex ready for Steps 1–9.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
