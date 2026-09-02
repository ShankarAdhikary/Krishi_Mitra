from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Crop Advisory Backend"
    app_env: str = "development"
    app_debug: bool = True
    database_url: str = "sqlite:///./crop_advisory.db"
    secret_key: str = "change-me-in-production-at-least-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    sms_provider: str = "mock"
    sms_sender_id: str = "TESTSMS"
    ivr_provider: str = "mock"
    ingestion_provider: str = "mock"
    data_unavailable_after_failures: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
