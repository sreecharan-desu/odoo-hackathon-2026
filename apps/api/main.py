"""Vercel / ASGI entry — re-export the FastAPI application."""

from app.main import app

__all__ = ["app"]
