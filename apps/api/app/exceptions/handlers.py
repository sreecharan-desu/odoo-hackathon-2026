"""Custom exceptions and handlers."""

from fastapi import Request
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})
