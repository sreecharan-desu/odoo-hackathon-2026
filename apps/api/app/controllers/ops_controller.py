from __future__ import annotations

from datetime import datetime, date, timezone
from email.message import EmailMessage
import smtplib

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db, require_roles
from app.exceptions.handlers import AppError
from app.models.driver import Driver
from app.models.user import User
from app.schemas import (
    DashboardKpis,
    ExpenseCreate,
    ExpenseResponse,
    FuelLogCreate,
    FuelLogResponse,
    LicenseReminderResponse,
    MaintenanceCreate,
    MaintenanceResponse,
    PaginatedResponse,
)
from app.services.fleet_ops_service import DashboardService, ExpenseService, FuelService, MaintenanceService
from app.services.report_service import ReportService
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
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> dict:
    return DashboardService.operational_cost(db, vehicle_id)


@router.get("/reports/operational-costs")
def operational_costs_bulk(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> dict:
    return {"items": DashboardService.operational_costs_all(db)}


@router.get("/reports/operational.csv")
def operational_csv(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> PlainTextResponse:
    rows = DashboardService.operational_costs_all(db)
    lines = [
        "vehicle_id,registration_number,status,distance_km,fuel_liters,fuel_efficiency_km_per_l,"
        "fuel_cost,maintenance_cost,other_expenses,estimated_revenue,acquisition_cost,roi,total"
    ]
    for costs in rows:
        lines.append(
            f"{costs['vehicle_id']},{costs['registration_number']},{costs['status']},"
            f"{costs['distance_km']},{costs['fuel_liters']},{costs['fuel_efficiency_km_per_l']},"
            f"{costs['fuel_cost']},{costs['maintenance_cost']},{costs['other_expenses']},"
            f"{costs['estimated_revenue']},{costs['acquisition_cost']},{costs['roi']},"
            f"{costs['total_operational_cost']}"
        )
    return PlainTextResponse("\n".join(lines) + "\n", media_type="text/csv")


@router.get("/reports/operational.pdf")
def operational_pdf(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "financial_analyst")),
) -> Response:
    fleet_data = DashboardService.operational_costs_all(db)
    pdf = ReportService.pdf_bytes(
        fleet_data,
        revenue_rate=settings.estimated_freight_revenue_per_km,
        reminder_days=settings.license_reminder_days,
    )
    today = date.today().isoformat()
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=transitops_report_{today}.pdf"},
    )


def _license_reminder_rows(db: Session) -> list[LicenseReminderResponse]:
    today = datetime.now(timezone.utc).date()
    rows: list[LicenseReminderResponse] = []
    drivers = db.query(Driver).filter(Driver.license_expiry.isnot(None)).all()
    for driver in drivers:
        days_remaining = (driver.license_expiry - today).days
        if days_remaining <= settings.license_reminder_days:
            email = None
            if driver.user_id:
                from app.models.user import User as UserModel

                user = db.query(UserModel).filter(UserModel.id == driver.user_id).first()
                email = user.email if user else None
            rows.append(
                LicenseReminderResponse(
                    driver_id=driver.id,
                    driver_name=driver.name,
                    license_number=driver.license_number,
                    license_expiry=driver.license_expiry,
                    days_remaining=days_remaining,
                    email=email,
                )
            )
    return rows


@router.get("/drivers/license-reminders", response_model=list[LicenseReminderResponse])
def license_reminders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "safety_officer")),
) -> list[LicenseReminderResponse]:
    return _license_reminder_rows(db)


@router.post("/drivers/license-reminders/send")
def send_license_reminders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "safety_officer")),
) -> dict:
    reminders = _license_reminder_rows(db)
    if not settings.smtp_host:
        raise AppError("SMTP is not configured")

    sent = 0
    for reminder in reminders:
        if not reminder.email:
            continue
        message = EmailMessage()
        message["Subject"] = f"TransitOps license reminder for {reminder.driver_name}"
        message["From"] = settings.smtp_from_email or settings.smtp_username or "no-reply@transitops.dev"
        message["To"] = reminder.email
        message.set_content(
            "\n".join(
                [
                    f"Driver: {reminder.driver_name}",
                    f"License: {reminder.license_number}",
                    f"Expiry: {reminder.license_expiry.isoformat()}",
                    f"Days remaining: {reminder.days_remaining}",
                ]
            )
        )
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_starttls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(message)
        sent += 1

    return {"sent": sent, "reminders": len(reminders)}

@router.get("/drivers/license-reminders", response_model=list[dict])
def license_reminders(
    db: Session = Depends(get_db),
    _: User = Depends(require_roles("fleet_manager", "safety_officer")),
) -> list[dict]:
    today = date.today()
    threshold = today.toordinal() + settings.license_reminder_days
    rows: list[dict] = []
    drivers = db.query(Driver).filter(Driver.license_expiry != None).all()  # noqa: E711
    for driver in drivers:
        days_remaining = driver.license_expiry.toordinal() - today.toordinal()
        if days_remaining <= settings.license_reminder_days:
            user = db.query(User).filter(User.id == driver.user_id).first() if driver.user_id else None
            rows.append(
                {
                    "driver_id": driver.id,
                    "driver_name": driver.name,
                    "license_number": driver.license_number,
                    "license_expiry": driver.license_expiry,
                    "days_remaining": days_remaining,
                    "email": user.email if user else None,
                }
            )
    return rows

