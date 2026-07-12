from __future__ import annotations
from sqlalchemy.orm import Session

from app.exceptions.handlers import AppError
from app.models.driver import Driver
from app.models.fuel import FuelLog
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.schemas import TripComplete, TripCreate
from app.services.driver_service import DriverService
from app.services.vehicle_service import VehicleService


class TripService:
    @staticmethod
    def list(db: Session, status: str | None = None) -> list[Trip]:
        q = db.query(Trip).order_by(Trip.id.desc())
        if status:
            q = q.filter(Trip.status == status)
        return q.all()

    @staticmethod
    def get(db: Session, trip_id: int) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise AppError("Trip not found", status_code=404)
        return trip

    @staticmethod
    def create(db: Session, data: TripCreate, *, created_by: int | None) -> Trip:
        vehicle = VehicleService.get(db, data.vehicle_id)
        driver = DriverService.get(db, data.driver_id)

        if vehicle.status in ("Retired", "In Shop"):
            raise AppError(
                f"Vehicle '{vehicle.registration_number}' is {vehicle.status} and cannot be dispatched"
            )
        if vehicle.status == "On Trip":
            raise AppError(f"Vehicle '{vehicle.registration_number}' is already On Trip")
        if vehicle.status != "Available":
            raise AppError(f"Vehicle must be Available (current: {vehicle.status})")

        DriverService.assert_assignable(driver)

        if data.cargo_weight > vehicle.max_load_kg:
            raise AppError(
                f"Cargo weight {data.cargo_weight} kg exceeds vehicle capacity "
                f"{vehicle.max_load_kg} kg"
            )

        trip = Trip(
            source=data.source.strip(),
            destination=data.destination.strip(),
            vehicle_id=vehicle.id,
            driver_id=driver.id,
            cargo_weight=data.cargo_weight,
            planned_distance=data.planned_distance,
            status="Draft",
            created_by=created_by,
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def dispatch(db: Session, trip_id: int) -> Trip:
        trip = TripService.get(db, trip_id)
        if trip.status != "Draft":
            raise AppError(f"Only Draft trips can be dispatched (current: {trip.status})")

        vehicle = VehicleService.get(db, trip.vehicle_id)
        driver = DriverService.get(db, trip.driver_id)

        if vehicle.status != "Available":
            raise AppError(
                f"Vehicle '{vehicle.registration_number}' is not Available "
                f"(status: {vehicle.status})"
            )
        DriverService.assert_assignable(driver)
        if trip.cargo_weight > vehicle.max_load_kg:
            raise AppError(
                f"Cargo weight {trip.cargo_weight} kg exceeds capacity {vehicle.max_load_kg} kg"
            )

        trip.status = "Dispatched"
        vehicle.status = "On Trip"
        driver.status = "On Trip"
        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def complete(db: Session, trip_id: int, data: TripComplete) -> Trip:
        trip = TripService.get(db, trip_id)
        if trip.status != "Dispatched":
            raise AppError(f"Only Dispatched trips can be completed (current: {trip.status})")

        vehicle = VehicleService.get(db, trip.vehicle_id)
        driver = DriverService.get(db, trip.driver_id)

        if data.final_odometer < vehicle.odometer:
            raise AppError("Final odometer cannot be less than current vehicle odometer")

        trip.status = "Completed"
        trip.final_odometer = data.final_odometer
        trip.fuel_consumed = data.fuel_consumed
        vehicle.odometer = data.final_odometer
        vehicle.status = "Available"
        driver.status = "Available"

        if data.fuel_consumed > 0:
            db.add(
                FuelLog(
                    vehicle_id=vehicle.id,
                    liters=data.fuel_consumed,
                    cost=data.fuel_cost,
                    trip_id=trip.id,
                )
            )

        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def cancel(db: Session, trip_id: int) -> Trip:
        trip = TripService.get(db, trip_id)
        if trip.status == "Completed":
            raise AppError("Completed trips cannot be cancelled")
        if trip.status == "Cancelled":
            raise AppError("Trip is already Cancelled")

        vehicle = VehicleService.get(db, trip.vehicle_id)
        driver = DriverService.get(db, trip.driver_id)

        if trip.status == "Dispatched":
            vehicle.status = "Available"
            driver.status = "Available"

        trip.status = "Cancelled"
        db.commit()
        db.refresh(trip)
        return trip
