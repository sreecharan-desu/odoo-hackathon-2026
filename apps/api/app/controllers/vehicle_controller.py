from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db, require_roles
from app.models.user import User
from app.schemas import PaginatedResponse, VehicleCreate, VehicleDocumentResponse, VehicleResponse, VehicleUpdate
from app.models.vehicle_document import VehicleDocument
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
    _: User = Depends(require_roles("fleet_manager")),
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


@router.get("/{vehicle_id}/documents", response_model=list[VehicleDocumentResponse])
def list_documents(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[VehicleDocument]:
    return (
        db.query(VehicleDocument)
        .filter(VehicleDocument.vehicle_id == vehicle_id)
        .order_by(VehicleDocument.id.desc())
        .all()
    )


@router.post("/{vehicle_id}/documents", response_model=VehicleDocumentResponse)
def create_document(
    vehicle_id: int,
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager")),
) -> VehicleDocument:
    VehicleService.get(db, vehicle_id)
    storage_dir = Path(settings.document_storage_dir)
    storage_dir.mkdir(parents=True, exist_ok=True)
    safe_name = f"vehicle-{vehicle_id}-{file.filename or 'document'}"
    file_path = storage_dir / safe_name
    file_path.write_bytes(file.file.read())
    doc = VehicleDocument(
        vehicle_id=vehicle_id,
        doc_type=doc_type.strip(),
        file_name=file.filename or safe_name,
        file_path=str(file_path),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
