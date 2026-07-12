from __future__ import annotations
"""Pydantic schemas — TransitOps."""

from datetime import date, datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, EmailStr, Field

T = TypeVar("T")


class HealthResponse(BaseModel):
    status: str
    service: str


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int


class MessageResponse(BaseModel):
    message: str


class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="driver")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    driver_id: int | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class VehicleCreate(BaseModel):
    registration_number: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=120)
    vehicle_type: str = "Van"
    max_load_kg: float = Field(gt=0)
    odometer: float = Field(default=0, ge=0)
    acquisition_cost: float = Field(default=0, ge=0)
    region: str | None = None


class VehicleUpdate(BaseModel):
    name: str | None = None
    vehicle_type: str | None = None
    max_load_kg: float | None = Field(default=None, gt=0)
    odometer: float | None = Field(default=None, ge=0)
    acquisition_cost: float | None = Field(default=None, ge=0)
    status: str | None = None
    region: str | None = None


class VehicleResponse(BaseModel):
    id: int
    registration_number: str
    name: str
    vehicle_type: str
    max_load_kg: float
    odometer: float
    acquisition_cost: float
    status: str
    region: str | None

    model_config = {"from_attributes": True}


class DriverCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    license_number: str = Field(min_length=1, max_length=64)
    license_category: str = "LMV"
    license_expiry: date
    contact_number: str | None = None
    safety_score: float = Field(default=100, ge=0, le=100)
    user_id: int | None = None


class DriverUpdate(BaseModel):
    name: str | None = None
    license_category: str | None = None
    license_expiry: date | None = None
    contact_number: str | None = None
    safety_score: float | None = Field(default=None, ge=0, le=100)
    status: str | None = None
    user_id: int | None = None


class DriverResponse(BaseModel):
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry: date
    contact_number: str | None
    safety_score: float
    status: str
    user_id: int | None = None

    model_config = {"from_attributes": True}


class TripCreate(BaseModel):
    source: str = Field(min_length=1, max_length=200)
    destination: str = Field(min_length=1, max_length=200)
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(gt=0)
    planned_distance: float = Field(default=0, ge=0)


class TripComplete(BaseModel):
    final_odometer: float = Field(ge=0)
    fuel_consumed: float = Field(ge=0)
    fuel_cost: float = Field(default=0, ge=0)


class TripResponse(BaseModel):
    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    status: str
    final_odometer: float | None
    fuel_consumed: float | None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    title: str = Field(min_length=1, max_length=120)
    description: str | None = None
    estimated_cost: float = Field(default=0, ge=0)


class MaintenanceResponse(BaseModel):
    id: int
    vehicle_id: int
    title: str
    description: str | None
    estimated_cost: float
    status: str
    opened_at: datetime | None = None
    closed_at: datetime | None = None

    model_config = {"from_attributes": True}


class FuelLogCreate(BaseModel):
    vehicle_id: int
    liters: float = Field(gt=0)
    cost: float = Field(ge=0)
    trip_id: int | None = None


class FuelLogResponse(BaseModel):
    id: int
    vehicle_id: int
    liters: float
    cost: float
    trip_id: int | None
    logged_at: datetime | None = None

    model_config = {"from_attributes": True}


class ExpenseCreate(BaseModel):
    vehicle_id: int
    category: str = Field(min_length=1, max_length=60)
    amount: float = Field(gt=0)
    note: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    vehicle_id: int
    category: str
    amount: float
    note: str | None
    logged_at: datetime | None = None

    model_config = {"from_attributes": True}


class DashboardKpis(BaseModel):
    active_vehicles: int
    available_vehicles: int
    vehicles_on_trip: int
    vehicles_in_shop: int
    active_trips: int
    pending_trips: int
    drivers_on_duty: int
    fleet_utilization_pct: float
    safety_alerts: int
