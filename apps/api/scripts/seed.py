"""Seed TransitOps with a compact realistic fleet dataset.

Preserves demo spine (VAN-05, TRK-12, VAN-99, Alex, Expired Sam).
Run:  python scripts/seed.py
"""

from __future__ import annotations

import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.security import hash_password  # noqa: E402
from app.core.config import settings  # noqa: E402
from app.db.session import Base, SessionLocal, engine  # noqa: E402
from app.models import Driver, Expense, FuelLog, MaintenanceLog, Trip, User, Vehicle  # noqa: E402
import app.models  # noqa: E402, F401

DEMO_PASSWORD = "Password123!"
RNG = random.Random(20260712)
FREIGHT_REVENUE_PER_KM = settings.estimated_freight_revenue_per_km

REGIONS = ("West", "North", "East", "South", "Central")
CITIES = (
    "Mumbai",
    "Pune",
    "Ahmedabad",
    "Surat",
    "Jaipur",
    "Delhi",
    "Noida",
    "Gurugram",
    "Bengaluru",
    "Chennai",
    "Hyderabad",
    "Nagpur",
    "Indore",
    "Kolkata",
    "Kochi",
)
STATE_CODES = (
    "AP", "MH", "KA", "TN", "DL", "GJ", "TS", "UP", "HR", "RJ",
    "MP", "WB", "KL", "CH", "PB"
)
MAINT_TITLES = (
    "Oil Change",
    "Brake Pads",
    "Tyre Rotation",
    "Battery Check",
    "AC Service",
    "Clutch Repair",
    "Engine Diagnostics",
    "Suspension Tune",
    "Coolant Flush",
    "Electrical Fault",
)
EXPENSE_CATS = ("Tolls", "Parking", "Repairs", "Cleaning", "Insurance", "Other")
FIRST_NAMES = (
    "Riya",
    "Arjun",
    "Neha",
    "Kabir",
    "Priya",
    "Rohan",
    "Ananya",
    "Vikram",
    "Ishita",
    "Dev",
    "Meera",
    "Siddharth",
    "Kavya",
    "Aman",
    "Sneha",
    "Rahul",
    "Pooja",
    "Nikhil",
    "Tanvi",
    "Harsh",
    "Diya",
    "Yash",
    "Aisha",
    "Kunal",
    "Nisha",
    "Varun",
    "Shreya",
    "Aditya",
    "Ira",
    "Manish",
    "Sara",
    "Gaurav",
    "Lakshmi",
    "Omar",
    "Fatima",
    "Joseph",
    "Emily",
    "Carlos",
)

LAST_NAMES = (
    "Patel",
    "Sharma",
    "Khan",
    "Reddy",
    "Nair",
    "Das",
    "Iyer",
    "Singh",
    "Gupta",
    "Joshi",
)

SEED_PROFILE = {
    "users": 6,
    "vehicle_templates": 5,
    "vehicles_per_template": 4,
    "driver_bulk": 10,
    "active_dispatches": 4,
    "completed_trips": 24,
    "draft_trips": 6,
    "cancelled_trips": 5,
    "fuel_topups": 14,
    "maintenance_history": 12,
    "maintenance_open": 3,
    "expenses": 28,
}


def _pick(*values: str) -> str:
    return RNG.choice(values)


def _person_name(first: str) -> str:
    return f"{first} {_pick(*LAST_NAMES)}"


def _phone_number() -> str:
    return f"+91-9{RNG.randint(100000000, 999999999)}"


def _license_number(prefix: str, index: int) -> str:
    return f"DL-{prefix}-{100 + index:03d}"


def _registration_number() -> str:
    state = RNG.choice(STATE_CODES)
    rto = RNG.randint(1, 99)
    chars = "".join(RNG.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=RNG.randint(1, 2)))
    num = RNG.randint(1000, 9999)
    return f"{state}{rto:02d}{chars}{num}"


def _recent_days(min_days: int, max_days: int) -> int:
    return RNG.randint(min_days, max_days)


def _rand_amount(low: int, high: int) -> float:
    return round(RNG.uniform(low, high), 2)


def _utc_days_ago(days: int, hour: int = 10) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days, hours=hour % 5)


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if os.getenv("SEED_IF_EMPTY", "").lower() in {"1", "true", "yes"}:
            if db.query(User).first() is not None:
                print("✓ Seed skipped — database already has users (SEED_IF_EMPTY=1).")
                return

        for model in (Expense, FuelLog, MaintenanceLog, Trip, Vehicle, Driver, User):
            db.query(model).delete()
        db.commit()

        # ── Users ───────────────────────────────────────────────────────
        password = hash_password(DEMO_PASSWORD)
        users = [
            User(email="fleet@example.com", name="Fleet Manager", password_hash=password, role="fleet_manager"),
            User(email="driver@example.com", name="Alex Driver", password_hash=password, role="driver"),
            User(email="safety@example.com", name="Safety Officer", password_hash=password, role="safety_officer"),
            User(email="finance@example.com", name="Finance Analyst", password_hash=password, role="financial_analyst"),
        ]
        for i in range(1, max(SEED_PROFILE["users"] - len(users) + 1, 1)):
            users.append(
                User(
                    email=f"ops{i}@example.com",
                    name=f"Ops Coordinator {i}",
                    password_hash=password,
                    role="fleet_manager" if i % 2 else "safety_officer",
                )
            )
        db.add_all(users)
        db.flush()
        fleet_user_id = users[0].id
        driver_user_id = users[1].id  # driver@example.com → linked to Alex

        # ── Vehicles (demo spine + fleet bulk) ──────────────────────────
        vehicles: list[Vehicle] = [
            Vehicle(
                registration_number="MH04AB1234",
                name="Van-05",
                vehicle_type="Van",
                max_load_kg=500,
                odometer=12000,
                acquisition_cost=850000,
                status="Available",
                region="West",
            ),
            Vehicle(
                registration_number="DL01XY9876",
                name="Truck-12",
                vehicle_type="Truck",
                max_load_kg=2000,
                odometer=45000,
                acquisition_cost=1500000,
                status="In Shop",
                region="North",
            ),
            Vehicle(
                registration_number="GJ05ZZ5555",
                name="Van-99",
                vehicle_type="Van",
                max_load_kg=300,
                odometer=80000,
                acquisition_cost=400000,
                status="Retired",
                region="East",
            ),
        ]

        specs = [
            ("VAN", "Van", 400, 700, 450000, 950000),
            ("TRK", "Truck", 1500, 5000, 900000, 2800000),
            ("SUV", "SUV", 300, 600, 700000, 1600000),
            ("BUS", "MiniBus", 800, 2000, 1200000, 3200000),
            ("PICK", "Pickup", 600, 1200, 550000, 1100000),
        ]
        # Status mix for bulk: mostly Available, with a smaller live-ops slice.
        status_cycle = (
            ["Available"] * 8
            + ["On Trip"] * 4
            + ["In Shop"] * 2
            + ["Retired"] * 2
        )
        RNG.shuffle(status_cycle)

        n = 0
        for prefix, vtype, lo, hi, cost_lo, cost_hi in specs[: SEED_PROFILE["vehicle_templates"]]:
            for i in range(1, SEED_PROFILE["vehicles_per_template"] + 1):
                n += 1
                reg = _registration_number()
                while any(v.registration_number == reg for v in vehicles):
                    reg = _registration_number()
                status = status_cycle[(n - 1) % len(status_cycle)]
                vehicles.append(
                    Vehicle(
                        registration_number=reg,
                        name=f"{vtype}-{i:02d}",
                        vehicle_type=vtype,
                        max_load_kg=float(RNG.randint(lo, hi)),
                        odometer=float(RNG.randint(2_000, 180_000)),
                        acquisition_cost=float(RNG.randint(cost_lo, cost_hi)),
                        status=status,
                        region=RNG.choice(REGIONS),
                    )
                )

        db.add_all(vehicles)
        db.flush()

        # ── Drivers (demo spine + bulk) ─────────────────────────────────
        drivers: list[Driver] = [
            Driver(
                name="Alex",
                license_number="DL-ALEX-001",
                license_category="LMV",
                license_expiry=date.today() + timedelta(days=365),
                contact_number="+91-9000000001",
                safety_score=92,
                status="Available",
                user_id=driver_user_id,
            ),
            Driver(
                name="Expired Sam",
                license_number="DL-SAM-EXP",
                license_category="LMV",
                license_expiry=date.today() - timedelta(days=10),
                contact_number="+91-9000000002",
                safety_score=60,
                status="Available",
            ),
        ]

        driver_statuses = ["Available"] * 3 + ["On Trip"] * 4 + ["Off Duty"] * 2 + ["Suspended"] * 1
        RNG.shuffle(driver_statuses)

        for i, first in enumerate(FIRST_NAMES[:SEED_PROFILE["driver_bulk"]], start=1):
            status = driver_statuses[(i - 1) % len(driver_statuses)]
            expiry_offset = RNG.choice([90, 180, 365, 400, 500, -5, -20]) if i % 17 == 0 else RNG.randint(60, 700)
            # Keep only Expired Sam as the intentional expired demo case for Available drivers
            if expiry_offset < 0 and status == "Available":
                expiry_offset = RNG.randint(60, 400)
            drivers.append(
                Driver(
                    name=f"{first} {RNG.choice(['Patel', 'Sharma', 'Khan', 'Reddy', 'Nair', 'Das', 'Iyer', 'Singh'])}",
                    license_number=f"DL-{1000 + i}-{RNG.randint(10, 99)}",
                    license_category=RNG.choice(["LMV", "HMV", "MGV"]),
                    license_expiry=date.today() + timedelta(days=expiry_offset),
                    contact_number=f"+91-9{RNG.randint(100000000, 999999999)}",
                    safety_score=float(RNG.randint(55, 99)),
                    status=status,
                )
            )

        db.add_all(drivers)
        db.flush()

        available_vehicles = [v for v in vehicles if v.status == "Available" and v.registration_number != "VAN-99"]
        on_trip_vehicles = [v for v in vehicles if v.status == "On Trip"]
        in_shop_vehicles = [v for v in vehicles if v.status == "In Shop"]
        available_drivers = [d for d in drivers if d.status == "Available" and d.name != "Expired Sam"]
        on_trip_drivers = [d for d in drivers if d.status == "On Trip"]

        # Pair On Trip vehicles with On Trip drivers for active dispatches
        active_pairs = list(zip(on_trip_vehicles, on_trip_drivers))
        leftover_trip_vehicles = on_trip_vehicles[len(active_pairs) :]
        for v in leftover_trip_vehicles:
            v.status = "Available"
            available_vehicles.append(v)
        leftover_trip_drivers = on_trip_drivers[len(active_pairs) :]
        for d in leftover_trip_drivers:
            d.status = "Available"
            available_drivers.append(d)

        trips: list[Trip] = []
        fuel_logs: list[FuelLog] = []
        expenses: list[Expense] = []
        maintenance: list[MaintenanceLog] = []

        # Active dispatched trips
        for idx, (veh, drv) in enumerate(active_pairs[: SEED_PROFILE["active_dispatches"]]):
            src, dst = RNG.sample(CITIES, 2)
            cargo = min(veh.max_load_kg * 0.7, veh.max_load_kg - 10)
            trips.append(
                Trip(
                    source=src,
                    destination=dst,
                    vehicle_id=veh.id,
                    driver_id=drv.id,
                    cargo_weight=round(cargo, 1),
                    planned_distance=float(RNG.randint(40, 650)),
                    status="Dispatched",
                    created_by=fleet_user_id,
                    created_at=_utc_days_ago(RNG.randint(0, 3)),
                )
            )

        # Completed trips (history) — use Available fleet + Alex heavily
        history_pool_v = [v for v in vehicles if v.status in ("Available", "On Trip", "In Shop") and v.registration_number != "VAN-99"]
        history_pool_d = [d for d in drivers if d.name != "Expired Sam"]
        for i in range(SEED_PROFILE["completed_trips"]):
            veh = RNG.choice(history_pool_v)
            drv = RNG.choice(history_pool_d)
            src, dst = RNG.sample(CITIES, 2)
            cargo = round(RNG.uniform(20, max(30.0, veh.max_load_kg * 0.85)), 1)
            dist = float(RNG.randint(25, 800))
            days_ago = RNG.randint(1, 90)
            start_odo = max(0.0, veh.odometer - dist - RNG.randint(0, 200))
            trips.append(
                Trip(
                    source=src,
                    destination=dst,
                    vehicle_id=veh.id,
                    driver_id=drv.id,
                    cargo_weight=cargo,
                    planned_distance=dist,
                    status="Completed",
                    created_by=fleet_user_id,
                    final_odometer=round(start_odo + dist, 1),
                    fuel_consumed=round(dist / RNG.uniform(8.0, 14.0), 1),
                    created_at=_utc_days_ago(days_ago),
                )
            )

        # Draft trips ready to dispatch in UI
        for i in range(SEED_PROFILE["draft_trips"]):
            veh = RNG.choice(available_vehicles)
            drv = RNG.choice(available_drivers)
            src, dst = RNG.sample(CITIES, 2)
            trips.append(
                Trip(
                    source=src,
                    destination=dst,
                    vehicle_id=veh.id,
                    driver_id=drv.id,
                    cargo_weight=round(RNG.uniform(40, min(200.0, veh.max_load_kg * 0.5)), 1),
                    planned_distance=float(RNG.randint(30, 400)),
                    status="Draft",
                    created_by=fleet_user_id,
                    created_at=_utc_days_ago(RNG.randint(0, 5)),
                )
            )

        # Cancelled trips
        for i in range(SEED_PROFILE["cancelled_trips"]):
            veh = RNG.choice(history_pool_v)
            drv = RNG.choice(history_pool_d)
            src, dst = RNG.sample(CITIES, 2)
            trips.append(
                Trip(
                    source=src,
                    destination=dst,
                    vehicle_id=veh.id,
                    driver_id=drv.id,
                    cargo_weight=round(RNG.uniform(30, 250), 1),
                    planned_distance=float(RNG.randint(20, 300)),
                    status="Cancelled",
                    created_by=fleet_user_id,
                    created_at=_utc_days_ago(RNG.randint(5, 60)),
                )
            )

        db.add_all(trips)
        db.flush()

        completed = [t for t in trips if t.status == "Completed"]

        # Fuel logs linked to completed trips + extra fills
        for t in completed:
            liters = t.fuel_consumed or RNG.uniform(8, 60)
            fuel_logs.append(
                FuelLog(
                    vehicle_id=t.vehicle_id,
                    liters=round(liters, 1),
                    cost=round(liters * RNG.uniform(96, 112), 2),
                    trip_id=t.id,
                    logged_at=t.created_at + timedelta(hours=RNG.randint(2, 10)),
                )
            )
        for i in range(SEED_PROFILE["fuel_topups"]):
            veh = RNG.choice(vehicles)
            liters = RNG.uniform(12, 72)
            fuel_logs.append(
                FuelLog(
                    vehicle_id=veh.id,
                    liters=round(liters, 1),
                    cost=round(liters * RNG.uniform(96, 112), 2),
                    trip_id=None,
                    logged_at=_utc_days_ago(RNG.randint(0, 100)),
                )
            )

        # Maintenance — open for In Shop vehicles, closed history for others
        for veh in in_shop_vehicles[: SEED_PROFILE["maintenance_open"]]:
            maintenance.append(
                MaintenanceLog(
                    vehicle_id=veh.id,
                    title=RNG.choice(MAINT_TITLES),
                    description=f"Open job for {veh.registration_number}",
                    estimated_cost=float(RNG.randint(3200, 38000)),
                    status="Open",
                    opened_at=_utc_days_ago(RNG.randint(0, 10)),
                )
            )
        for i in range(SEED_PROFILE["maintenance_history"]):
            veh = RNG.choice(vehicles)
            opened = _utc_days_ago(RNG.randint(10, 120))
            maintenance.append(
                MaintenanceLog(
                    vehicle_id=veh.id,
                    title=RNG.choice(MAINT_TITLES),
                    description="Completed scheduled service",
                    estimated_cost=float(RNG.randint(1800, 48000)),
                    status="Closed",
                    opened_at=opened,
                    closed_at=opened + timedelta(days=RNG.randint(1, 7)),
                )
            )

        # Expenses
        for i in range(SEED_PROFILE["expenses"]):
            veh = RNG.choice(vehicles)
            cat = RNG.choice(EXPENSE_CATS)
            expenses.append(
                Expense(
                    vehicle_id=veh.id,
                    category=cat,
                    amount=round(RNG.uniform(120, 8500), 2),
                    note=f"{cat} for {veh.registration_number} ({veh.vehicle_type})",
                    logged_at=_utc_days_ago(RNG.randint(0, 90)),
                )
            )

        db.add_all(fuel_logs)
        db.add_all(maintenance)
        db.add_all(expenses)
        db.commit()

        print("✓ Seed complete — compact realistic dataset ready.")
        print(f"  Login: fleet@example.com / {DEMO_PASSWORD}")
        print(f"  Users:        {db.query(User).count()}")
        print(f"  Vehicles:     {db.query(Vehicle).count()}")
        print(f"  Drivers:      {db.query(Driver).count()}")
        print(f"  Trips:        {db.query(Trip).count()} "
              f"(Draft={db.query(Trip).filter_by(status='Draft').count()}, "
              f"Dispatched={db.query(Trip).filter_by(status='Dispatched').count()}, "
              f"Completed={db.query(Trip).filter_by(status='Completed').count()}, "
              f"Cancelled={db.query(Trip).filter_by(status='Cancelled').count()})")
        print(f"  Freight rate: ₹{FREIGHT_REVENUE_PER_KM:.2f}/km")
        print(f"  Maintenance:  {db.query(MaintenanceLog).count()}")
        print(f"  Fuel logs:    {db.query(FuelLog).count()}")
        print(f"  Expenses:     {db.query(Expense).count()}")
        print("  Demo spine kept: VAN-05, TRK-12 (In Shop), VAN-99 (Retired), Alex, Expired Sam")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
