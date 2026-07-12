from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.models.user import User
from app.schemas import PaginatedResponse, VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.vehicle_service import VehicleService
from app.utils.pagination import DEFAULT_LIMIT, MAX_LIMIT

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("", response_model=PaginatedResponse[VehicleResponse])
def list_vehicles(
    status: str | None = None,
    limit: int = Query(DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    page = VehicleService.list(db, status=status, limit=limit, offset=offset)
    return {"items": page.items, "total": page.total, "limit": page.limit, "offset": page.offset}


@router.get("/dispatch-pool", response_model=list[VehicleResponse])
def dispatch_pool(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list:
    return VehicleService.dispatch_pool(db)


@router.post("", response_model=VehicleResponse)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> object:
    return VehicleService.create(db, payload)


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(
    vehicle_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> object:
    return VehicleService.get(db, vehicle_id)


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> object:
    return VehicleService.update(db, vehicle_id, payload)
