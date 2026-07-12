from __future__ import annotations
from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.models.user import User
from app.schemas import (
    DashboardKpis,
    ExpenseCreate,
    ExpenseResponse,
    FuelLogCreate,
    FuelLogResponse,
    MaintenanceCreate,
    MaintenanceResponse,
)
from app.services.fleet_ops_service import DashboardService, ExpenseService, FuelService, MaintenanceService
from app.services.vehicle_service import VehicleService

router = APIRouter(tags=["operations"])


@router.get("/maintenance", response_model=list[MaintenanceResponse])
def list_maintenance(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return MaintenanceService.list(db, status=status)


@router.post("/maintenance", response_model=MaintenanceResponse)
def open_maintenance(
    payload: MaintenanceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> object:
    return MaintenanceService.open(db, payload)


@router.post("/maintenance/{log_id}/close", response_model=MaintenanceResponse)
def close_maintenance(
    log_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> object:
    return MaintenanceService.close(db, log_id)


@router.get("/fuel-logs", response_model=list[FuelLogResponse])
def list_fuel(
    vehicle_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return FuelService.list(db, vehicle_id=vehicle_id)


@router.post("/fuel-logs", response_model=FuelLogResponse)
def create_fuel(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst", "driver")),
) -> object:
    return FuelService.create(db, payload)


@router.get("/expenses", response_model=list[ExpenseResponse])
def list_expenses(
    vehicle_id: int | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return ExpenseService.list(db, vehicle_id=vehicle_id)


@router.post("/expenses", response_model=ExpenseResponse)
def create_expense(
    payload: ExpenseCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> object:
    return ExpenseService.create(db, payload)


@router.get("/dashboard/kpis", response_model=DashboardKpis)
def dashboard_kpis(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    return DashboardService.kpis(db)


@router.get("/vehicles/{vehicle_id}/operational-cost")
def operational_cost(
    vehicle_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    return DashboardService.operational_cost(db, vehicle_id)


@router.get("/reports/operational.csv")
def operational_csv(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> PlainTextResponse:
    vehicles = VehicleService.list(db)
    lines = ["vehicle_id,registration_number,status,fuel_cost,maintenance_cost,other_expenses,total"]
    for v in vehicles:
        costs = DashboardService.operational_cost(db, v.id)
        lines.append(
            f"{v.id},{v.registration_number},{v.status},"
            f"{costs['fuel_cost']},{costs['maintenance_cost']},{costs['other_expenses']},{costs['total_operational_cost']}"
        )
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/csv")
