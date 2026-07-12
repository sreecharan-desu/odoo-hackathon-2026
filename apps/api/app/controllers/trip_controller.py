from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_roles
from app.models.user import User
from app.schemas import TripComplete, TripCreate, TripResponse
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=list[TripResponse])
def list_trips(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return TripService.list(db, status=status)


@router.post("", response_model=TripResponse)
def create_trip(
    payload: TripCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("fleet_manager", "driver")),
) -> object:
    return TripService.create(db, payload, created_by=user.id)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> object:
    return TripService.get(db, trip_id)


@router.post("/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> object:
    return TripService.dispatch(db, trip_id)


@router.post("/{trip_id}/complete", response_model=TripResponse)
def complete_trip(
    trip_id: int,
    payload: TripComplete,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "driver")),
) -> object:
    return TripService.complete(db, trip_id, payload)


@router.post("/{trip_id}/cancel", response_model=TripResponse)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> object:
    return TripService.cancel(db, trip_id)
