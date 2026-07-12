from __future__ import annotations
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://app:app_secret@localhost:5433/hackathon"
    secret_key: str = "change-me"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]


settings = Settings()
