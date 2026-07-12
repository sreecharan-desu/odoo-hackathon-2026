"""Custom exceptions and handlers — consistent JSON error shape."""

from __future__ import annotations

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400, *, code: str | None = None):
        self.message = message
        self.status_code = status_code
        self.code = code or "app_error"
        super().__init__(message)


def _error_body(message: str, *, code: str = "app_error", details: object | None = None) -> dict:
    body: dict = {"detail": message, "error": message, "code": code}
    if details is not None:
        body["details"] = details
    return body


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(exc.message, code=exc.code),
    )


async def http_exception_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail
    message = detail if isinstance(detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(message, code="http_error", details=detail if not isinstance(detail, str) else None),
    )


async def validation_exception_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    parts: list[str] = []
    for err in errors:
        loc = ".".join(str(p) for p in err.get("loc", []) if p != "body")
        msg = err.get("msg", "invalid")
        parts.append(f"{loc}: {msg}" if loc else msg)
    message = "; ".join(parts) if parts else "Validation failed"
    return JSONResponse(
        status_code=422,
        content=_error_body(message, code="validation_error", details=errors),
    )
