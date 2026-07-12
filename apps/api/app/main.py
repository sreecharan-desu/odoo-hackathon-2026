from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.controllers import api_router
from app.core.config import settings
from app.db.session import Base, engine
from app.exceptions.handlers import (
    AppError,
    app_error_handler,
    http_exception_handler,
    validation_exception_handler,
)
import app.models  # noqa: F401 — register models on Base.metadata


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Safe for local/demo; production deploys should prefer Alembic migrations.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="TransitOps API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.backend_host, port=settings.backend_port, reload=True)
