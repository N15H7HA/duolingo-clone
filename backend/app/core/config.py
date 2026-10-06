from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Duolingo Clone API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    # Base directory
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    
    # SQLite Database URL
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/duolingo.db"
    
    # Default gamification settings
    DEFAULT_HEARTS: int = 5
    MAX_HEARTS: int = 5
    HEART_REGEN_MINUTES: int = 30
    DEFAULT_TIMEZONE: str = "Asia/Kolkata"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
