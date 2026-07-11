import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    cors_origins: str = "http://localhost:5173"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/telegenesis"

    # Fireworks AI
    fireworks_api_key: str = ""
    fireworks_base_url: str = "https://api.fireworks.ai/inference/v1"
    fireworks_model: str = "accounts/fireworks/models/deepseek-v3"
    fireworks_model_fast: str = "accounts/fireworks/models/glm-5p2"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
