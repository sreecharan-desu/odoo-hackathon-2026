from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.exceptions.handlers import AppError
from app.core.config import settings
from app.models.expense import Expense
from app.models.fuel import FuelLog
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.schemas import ExpenseCreate, FuelLogCreate, MaintenanceCreate
from app.services.vehicle_service import VehicleService
from app.utils.pagination import DEFAULT_LIMIT, Page, paginate


class MaintenanceService:
    @staticmethod
    def list(
        db: Session,
        status: str | None = None,
        *,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> Page[MaintenanceLog]:
        q = db.query(MaintenanceLog).order_by(MaintenanceLog.id.desc())
        if status:
            q = q.filter(MaintenanceLog.status == status)
        return paginate(q, limit=limit, offset=offset)

    @staticmethod
    def open(db: Session, data: MaintenanceCreate) -> MaintenanceLog:
        vehicle = VehicleService.get(db, data.vehicle_id)
        if vehicle.status == "Retired":
            raise AppError("Cannot open maintenance on a Retired vehicle")
        if vehicle.status == "On Trip":
            raise AppError("Cannot open maintenance while vehicle is On Trip — complete or cancel the trip first")

        log = MaintenanceLog(
            vehicle_id=vehicle.id,
            title=data.title.strip(),
            description=data.description,
            estimated_cost=data.estimated_cost,
            status="Open",
        )
        vehicle.status = "In Shop"
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def close(db: Session, log_id: int) -> MaintenanceLog:
        log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
        if not log:
            raise AppError("Maintenance log not found", status_code=404)
        if log.status != "Open":
            raise AppError("Maintenance log is already closed")

        vehicle = VehicleService.get(db, log.vehicle_id)
        log.status = "Closed"
        log.closed_at = datetime.now(timezone.utc)
        if vehicle.status != "Retired":
            vehicle.status = "Available"
        db.commit()
        db.refresh(log)
        return log


class FuelService:
    @staticmethod
    def list(
        db: Session,
        vehicle_id: int | None = None,
        *,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> Page[FuelLog]:
        q = db.query(FuelLog).order_by(FuelLog.id.desc())
        if vehicle_id:
            q = q.filter(FuelLog.vehicle_id == vehicle_id)
        return paginate(q, limit=limit, offset=offset)

    @staticmethod
    def create(db: Session, data: FuelLogCreate) -> FuelLog:
        VehicleService.get(db, data.vehicle_id)
        row = FuelLog(
            vehicle_id=data.vehicle_id,
            liters=data.liters,
            cost=data.cost,
            trip_id=data.trip_id,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


class ExpenseService:
    @staticmethod
    def list(
        db: Session,
        vehicle_id: int | None = None,
        *,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> Page[Expense]:
        q = db.query(Expense).order_by(Expense.id.desc())
        if vehicle_id:
            q = q.filter(Expense.vehicle_id == vehicle_id)
        return paginate(q, limit=limit, offset=offset)

    @staticmethod
    def create(db: Session, data: ExpenseCreate) -> Expense:
        VehicleService.get(db, data.vehicle_id)
        row = Expense(
            vehicle_id=data.vehicle_id,
            category=data.category.strip(),
            amount=data.amount,
            note=data.note,
        )
        db.add(row)
        db.commit()
        db.refresh(row)
        return row


class DashboardService:
    @staticmethod
    def kpis(db: Session) -> dict:
        total = db.query(func.count(Vehicle.id)).scalar() or 0
        available = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "Available").scalar() or 0
        on_trip = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "On Trip").scalar() or 0
        in_shop = db.query(func.count(Vehicle.id)).filter(Vehicle.status == "In Shop").scalar() or 0
        active = total - (db.query(func.count(Vehicle.id)).filter(Vehicle.status == "Retired").scalar() or 0)

        from app.models.driver import Driver
        from app.models.trip import Trip

        active_trips = db.query(func.count(Trip.id)).filter(Trip.status == "Dispatched").scalar() or 0
        pending_trips = db.query(func.count(Trip.id)).filter(Trip.status == "Draft").scalar() or 0
        drivers_on_duty = (
            db.query(func.count(Driver.id)).filter(Driver.status.in_(["Available", "On Trip"])).scalar() or 0
        )
        safety_alerts = (
            db.query(func.count(Driver.id))
            .filter((Driver.status == "Suspended") | (Driver.safety_score < 70))
            .scalar()
            or 0
        )
        utilization = round((on_trip / active) * 100, 1) if active else 0.0

        return {
            "active_vehicles": active,
            "available_vehicles": available,
            "vehicles_on_trip": on_trip,
            "vehicles_in_shop": in_shop,
            "active_trips": active_trips,
            "pending_trips": pending_trips,
            "drivers_on_duty": drivers_on_duty,
            "fleet_utilization_pct": utilization,
            "safety_alerts": safety_alerts,
        }

    @staticmethod
    def operational_cost(db: Session, vehicle_id: int) -> dict:
        from app.models.trip import Trip

        vehicle = VehicleService.get(db, vehicle_id)
        fuel_cost = db.query(func.coalesce(func.sum(FuelLog.cost), 0.0)).filter(FuelLog.vehicle_id == vehicle_id).scalar()
        fuel_liters = (
            db.query(func.coalesce(func.sum(FuelLog.liters), 0.0)).filter(FuelLog.vehicle_id == vehicle_id).scalar()
        )
        maint = (
            db.query(func.coalesce(func.sum(MaintenanceLog.estimated_cost), 0.0))
            .filter(MaintenanceLog.vehicle_id == vehicle_id, MaintenanceLog.status == "Closed")
            .scalar()
        )
        other = (
            db.query(func.coalesce(func.sum(Expense.amount), 0.0)).filter(Expense.vehicle_id == vehicle_id).scalar()
        )
        distance = (
            db.query(func.coalesce(func.sum(Trip.planned_distance), 0.0))
            .filter(Trip.vehicle_id == vehicle_id, Trip.status == "Completed")
            .scalar()
        )
        revenue_rate = settings.estimated_freight_revenue_per_km
        revenue = float(distance or 0) * float(revenue_rate)
        fuel = float(fuel_cost or 0)
        maintenance = float(maint or 0)
        other_exp = float(other or 0)
        liters = float(fuel_liters or 0)
        dist = float(distance or 0)
        acquisition = float(vehicle.acquisition_cost or 0)
        efficiency = round(dist / liters, 2) if liters > 0 else None
        roi = round((revenue - (maintenance + fuel)) / acquisition, 4) if acquisition > 0 else None

        return {
            "vehicle_id": vehicle_id,
            "fuel_cost": fuel,
            "fuel_liters": liters,
            "distance_km": dist,
            "fuel_efficiency_km_per_l": efficiency,
            "maintenance_cost": maintenance,
            "other_expenses": other_exp,
            "estimated_revenue": revenue,
            "total_operational_cost": fuel + maintenance + other_exp,
            "acquisition_cost": acquisition,
            "roi": roi,
        }

    @staticmethod
    def operational_costs_all(db: Session) -> list[dict]:
        """Return operational cost metrics for every vehicle (single list for analytics UI)."""
        vehicles = VehicleService.list_all(db)
        rows: list[dict] = []
        for vehicle in vehicles:
            costs = DashboardService.operational_cost(db, vehicle.id)
            rows.append(
                {
                    **costs,
                    "registration_number": vehicle.registration_number,
                    "name": vehicle.name,
                    "status": vehicle.status,
                    "vehicle_type": vehicle.vehicle_type,
                }
            )
        return rows
