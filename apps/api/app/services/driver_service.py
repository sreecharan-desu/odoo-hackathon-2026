from __future__ import annotations
from datetime import date

from sqlalchemy.orm import Session

from app.exceptions.handlers import AppError
from app.models.driver import DRIVER_STATUSES, Driver
from app.schemas import DriverCreate, DriverUpdate
from app.utils.pagination import DEFAULT_LIMIT, Page, paginate


class DriverService:
    @staticmethod
    def list(
        db: Session,
        status: str | None = None,
        *,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> Page[Driver]:
        q = db.query(Driver).order_by(Driver.id.desc())
        if status:
            q = q.filter(Driver.status == status)
        return paginate(q, limit=limit, offset=offset)

    @staticmethod
    def get(db: Session, driver_id: int) -> Driver:
        driver = db.query(Driver).filter(Driver.id == driver_id).first()
        if not driver:
            raise AppError("Driver not found", status_code=404)
        return driver

    @staticmethod
    def create(db: Session, data: DriverCreate) -> Driver:
        license_no = data.license_number.strip().upper()
        exists = db.query(Driver).filter(Driver.license_number == license_no).first()
        if exists:
            raise AppError(f"License number '{license_no}' already exists", status_code=409)
        if data.user_id is not None:
            linked = db.query(Driver).filter(Driver.user_id == data.user_id).first()
            if linked:
                raise AppError(f"User {data.user_id} is already linked to a driver", status_code=409)
        driver = Driver(
            name=data.name.strip(),
            license_number=license_no,
            license_category=data.license_category.strip(),
            license_expiry=data.license_expiry,
            contact_number=data.contact_number,
            safety_score=data.safety_score,
            status="Available",
            user_id=data.user_id,
        )
        db.add(driver)
        db.commit()
        db.refresh(driver)
        return driver

    @staticmethod
    def update(db: Session, driver_id: int, data: DriverUpdate) -> Driver:
        driver = DriverService.get(db, driver_id)
        payload = data.model_dump(exclude_unset=True)
        if "status" in payload and payload["status"] not in DRIVER_STATUSES:
            raise AppError(f"Invalid driver status. Allowed: {', '.join(DRIVER_STATUSES)}")
        if "user_id" in payload and payload["user_id"] is not None:
            linked = (
                db.query(Driver)
                .filter(Driver.user_id == payload["user_id"], Driver.id != driver_id)
                .first()
            )
            if linked:
                raise AppError(f"User {payload['user_id']} is already linked to a driver", status_code=409)
        for key, value in payload.items():
            setattr(driver, key, value)
        db.commit()
        db.refresh(driver)
        return driver

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> Driver | None:
        return db.query(Driver).filter(Driver.user_id == user_id).first()

    @staticmethod
    def assert_assignable(driver: Driver, today: date | None = None) -> None:
        today = today or date.today()
        if driver.status == "Suspended":
            raise AppError(f"Driver '{driver.name}' is Suspended and cannot be assigned")
        if driver.status == "On Trip":
            raise AppError(f"Driver '{driver.name}' is already On Trip")
        if driver.status == "Off Duty":
            raise AppError(f"Driver '{driver.name}' is Off Duty")
        if driver.license_expiry < today:
            raise AppError(
                f"Driver '{driver.name}' has an expired license ({driver.license_expiry.isoformat()})"
            )
        if driver.status != "Available":
            raise AppError(f"Driver '{driver.name}' is not Available (status: {driver.status})")
