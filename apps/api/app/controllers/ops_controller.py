from __future__ import annotations

from fastapi import APIRouter, Depends, Query
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
    PaginatedResponse,
)
from app.services.fleet_ops_service import DashboardService, ExpenseService, FuelService, MaintenanceService
from app.services.vehicle_service import VehicleService
from app.utils.pagination import DEFAULT_LIMIT, MAX_LIMIT

router = APIRouter(tags=["operations"])


@router.get("/maintenance", response_model=PaginatedResponse[MaintenanceResponse])
def list_maintenance(
    status: str | None = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    page = MaintenanceService.list(db, status=status, limit=limit, offset=offset)
    return {"items": page.items, "total": page.total, "limit": page.limit, "offset": page.offset}


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


@router.get("/fuel-logs", response_model=PaginatedResponse[FuelLogResponse])
def list_fuel(
    vehicle_id: int | None = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    page = FuelService.list(db, vehicle_id=vehicle_id, limit=limit, offset=offset)
    return {"items": page.items, "total": page.total, "limit": page.limit, "offset": page.offset}


@router.post("/fuel-logs", response_model=FuelLogResponse)
def create_fuel(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst", "driver")),
) -> object:
    return FuelService.create(db, payload)


@router.get("/expenses", response_model=PaginatedResponse[ExpenseResponse])
def list_expenses(
    vehicle_id: int | None = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    page = ExpenseService.list(db, vehicle_id=vehicle_id, limit=limit, offset=offset)
    return {"items": page.items, "total": page.total, "limit": page.limit, "offset": page.offset}


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
    vehicles = VehicleService.list_all(db)
    lines = [
        "vehicle_id,registration_number,status,distance_km,fuel_liters,fuel_efficiency_km_per_l,"
        "fuel_cost,maintenance_cost,other_expenses,estimated_revenue,acquisition_cost,roi,total"
    ]
    for v in vehicles:
        costs = DashboardService.operational_cost(db, v.id)
        lines.append(
            f"{v.id},{v.registration_number},{v.status},"
            f"{costs['distance_km']},{costs['fuel_liters']},{costs['fuel_efficiency_km_per_l']},"
            f"{costs['fuel_cost']},{costs['maintenance_cost']},{costs['other_expenses']},"
            f"{costs['estimated_revenue']},{costs['acquisition_cost']},{costs['roi']},"
            f"{costs['total_operational_cost']}"
        )
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/csv")
