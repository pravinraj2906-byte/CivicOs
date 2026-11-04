import os
import secrets
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite:///./civicos.db"
    
    # JWT Security
    JWT_SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(48))
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # Environment & Auto-seed
    ENVIRONMENT: str = "development"
    AUTO_SEED: bool = True
    
    # Gemini AI Intelligence
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash"
    
    # n8n Workflow Automation
    N8N_ENABLED: bool = False
    N8N_WEBHOOK_URL: Optional[str] = None
    N8N_WEBHOOK_SECRET: Optional[str] = None
    N8N_TIMEOUT_SECONDS: float = 3.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )



settings = Settings()
