from __future__ import annotations
from sqlalchemy.orm import Session

from app.exceptions.handlers import AppError
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import VEHICLE_STATUSES, Vehicle
from app.schemas import VehicleCreate, VehicleUpdate
from app.utils.pagination import DEFAULT_LIMIT, Page, paginate


class VehicleService:
    @staticmethod
    def list(
        db: Session,
        status: str | None = None,
        *,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> Page[Vehicle]:
        q = db.query(Vehicle).order_by(Vehicle.id.desc())
        if status:
            q = q.filter(Vehicle.status == status)
        return paginate(q, limit=limit, offset=offset)

    @staticmethod
    def list_all(db: Session, status: str | None = None) -> list[Vehicle]:
        q = db.query(Vehicle).order_by(Vehicle.id.desc())
        if status:
            q = q.filter(Vehicle.status == status)
        return q.all()

    @staticmethod
    def get(db: Session, vehicle_id: int) -> Vehicle:
        vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
        if not vehicle:
            raise AppError("Vehicle not found", status_code=404)
        return vehicle

    @staticmethod
    def create(db: Session, data: VehicleCreate) -> Vehicle:
        reg = data.registration_number.strip().upper()
        exists = db.query(Vehicle).filter(Vehicle.registration_number == reg).first()
        if exists:
            raise AppError(f"Registration number '{reg}' is already registered", status_code=409)
        vehicle = Vehicle(
            registration_number=reg,
            name=data.name.strip(),
            vehicle_type=data.vehicle_type.strip(),
            max_load_kg=data.max_load_kg,
            odometer=data.odometer,
            acquisition_cost=data.acquisition_cost,
            region=data.region,
            status="Available",
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def update(db: Session, vehicle_id: int, data: VehicleUpdate) -> Vehicle:
        vehicle = VehicleService.get(db, vehicle_id)
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload and payload["status"] not in VEHICLE_STATUSES:
            raise AppError(f"Invalid vehicle status. Allowed: {', '.join(VEHICLE_STATUSES)}")
        if payload.get("status") == "Available" and vehicle.status != "Available":
            has_open_maintenance = (
                db.query(MaintenanceLog.id)
                .filter(MaintenanceLog.vehicle_id == vehicle_id, MaintenanceLog.status == "Open")
                .first()
            )
            if has_open_maintenance:
                raise AppError(
                    f"Vehicle '{vehicle.registration_number}' cannot be marked Available while open maintenance logs exist"
                )
        for key, value in payload.items():
            setattr(vehicle, key, value)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    @staticmethod
    def dispatch_pool(db: Session) -> list[Vehicle]:
        return (
            db.query(Vehicle)
            .filter(Vehicle.status == "Available")
            .order_by(Vehicle.id.asc())
            .all()
        )
