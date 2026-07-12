from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.models.user import User
from app.schemas import DriverCreate, DriverResponse, DriverUpdate
from app.services.driver_service import DriverService

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("", response_model=list[DriverResponse])
def list_drivers(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return DriverService.list(db, status=status)


@router.post("", response_model=DriverResponse)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "safety_officer")),
) -> object:
    return DriverService.create(db, payload)


@router.get("/{driver_id}", response_model=DriverResponse)
def get_driver(
    driver_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> object:
    return DriverService.get(db, driver_id)


@router.patch("/{driver_id}", response_model=DriverResponse)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "safety_officer")),
) -> object:
    return DriverService.update(db, driver_id, payload)
