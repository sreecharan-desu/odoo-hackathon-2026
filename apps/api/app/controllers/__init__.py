from __future__ import annotations
from fastapi import APIRouter

from app.controllers.auth_controller import router as auth_router
from app.controllers.driver_controller import router as driver_router
from app.controllers.health_controller import router as health_router
from app.controllers.ops_controller import router as ops_router
from app.controllers.trip_controller import router as trip_router
from app.controllers.vehicle_controller import router as vehicle_router

api_router = APIRouter(prefix="/api")
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(vehicle_router)
api_router.include_router(driver_router)
api_router.include_router(trip_router)
api_router.include_router(ops_router)
