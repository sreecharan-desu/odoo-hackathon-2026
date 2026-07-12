"""Seed TransitOps demo data (PDF Steps 1–9).

Run:  python scripts/seed.py
"""

from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.security import hash_password  # noqa: E402
from app.db.session import Base, SessionLocal, engine  # noqa: E402
from app.models import Driver, Expense, FuelLog, MaintenanceLog, Trip, User, Vehicle  # noqa: E402
import app.models  # noqa: E402, F401

DEMO_PASSWORD = "Password123!"


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # ── Reset demo tables for a clean demo run ──────────────────────
        for model in (Expense, FuelLog, MaintenanceLog, Trip, Vehicle, Driver, User):
            db.query(model).delete()
        db.commit()

        # ── Users (4 roles, same password) ──────────────────────────────
        users = [
            ("fleet@example.com", "Fleet Manager", "fleet_manager"),
            ("driver@example.com", "Alex Driver", "driver"),
            ("safety@example.com", "Safety Officer", "safety_officer"),
            ("finance@example.com", "Finance Analyst", "financial_analyst"),
        ]
        password = hash_password(DEMO_PASSWORD)
        for email, name, role in users:
            db.add(User(email=email, name=name, password_hash=password, role=role))

        # ── Vehicles ────────────────────────────────────────────────────
        # VAN-05: primary demo vehicle (Steps 2-7)
        db.add(
            Vehicle(
                registration_number="VAN-05",
                name="Van-05",
                vehicle_type="Van",
                max_load_kg=500,
                odometer=12000,
                acquisition_cost=850000,
                status="Available",
                region="West",
            )
        )
        # TRK-12: In Shop — Step 8 fail beat (cannot dispatch)
        db.add(
            Vehicle(
                registration_number="TRK-12",
                name="Truck-12",
                vehicle_type="Truck",
                max_load_kg=2000,
                odometer=45000,
                acquisition_cost=1500000,
                status="In Shop",
                region="North",
            )
        )
        # VAN-99: Retired — hidden from dispatch pool entirely
        db.add(
            Vehicle(
                registration_number="VAN-99",
                name="Van-99",
                vehicle_type="Van",
                max_load_kg=300,
                odometer=80000,
                acquisition_cost=400000,
                status="Retired",
                region="East",
            )
        )

        # ── Drivers ─────────────────────────────────────────────────────
        # Alex: valid license, available — primary demo driver (Steps 3-6)
        db.add(
            Driver(
                name="Alex",
                license_number="DL-ALEX-001",
                license_category="LMV",
                license_expiry=date.today() + timedelta(days=365),
                contact_number="+91-9000000001",
                safety_score=92,
                status="Available",
            )
        )
        # Expired Sam: expired license — Step 8 fail beat (cannot assign)
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
        print("✓ Seed complete.")
        print(f"  Login: fleet@example.com / {DEMO_PASSWORD}")
        print("  VAN-05 (500 kg, Available) — primary demo vehicle")
        print("  TRK-12 (2000 kg, In Shop)  — Step 8 fail beat")
        print("  VAN-99 (300 kg, Retired)    — hidden from dispatch")
        print("  Alex (valid license)        — primary demo driver")
        print("  Expired Sam (expired -10d)  — Step 8 fail beat")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
