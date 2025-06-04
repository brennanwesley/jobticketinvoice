import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "JobTicketInvoice API"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-very-secure-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # CORS settings
    CORS_ORIGINS: list = ["http://localhost:3000"]
    
    model_config = {
        "case_sensitive": True
    }

# Create settings instance
settings = Settings()
