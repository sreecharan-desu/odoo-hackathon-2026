from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import api_router
from app.core.config import settings
from app.exceptions.handlers import AppError, app_error_handler

app = FastAPI(title="Odoo Hackathon API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.backend_host, port=settings.backend_port, reload=True)
