"""
Centralized Configuration Management for JobTicketInvoice Backend

This module provides a comprehensive, secure, and validated configuration system
that replaces scattered os.getenv() calls throughout the application.

All environment variables are defined, validated, and documented here.
"""

import os
import secrets
from typing import List, Optional
from pydantic import Field, field_validator, EmailStr, HttpUrl, AliasChoices
from pydantic.types import SecretStr
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def generate_secure_key() -> str:
    """Generate a secure random key for development"""
    return secrets.token_urlsafe(32)


def generate_fernet_key() -> str:
    """Generate a Fernet encryption key for development"""
    from cryptography.fernet import Fernet
    return Fernet.generate_key().decode()


class DatabaseSettings(BaseSettings):
    """Database configuration settings"""
    
    url: str = Field(
        default="sqlite:///./jobticket.db",
        description="Database connection URL",
        validation_alias=AliasChoices('DATABASE_URL', 'database_url')
    )
    
    echo: bool = Field(
        default=False,
        description="Enable SQLAlchemy query logging (development only)"
    )
    
    @field_validator('url')
    def validate_database_url(cls, v, info):
        """Validate database URL format"""
        if not v:
            raise ValueError("Database URL cannot be empty")
        
        # Parse URL to validate format
        try:
            from urllib.parse import urlparse
            parsed = urlparse(v)
            scheme = parsed.scheme.lower()
        except Exception as e:
            raise ValueError(f"Invalid database URL format: {e}")
        
        # Validate supported database schemes
        supported_schemes = ['sqlite', 'postgresql', 'mysql']
        if scheme not in supported_schemes:
            raise ValueError(f"Unsupported database scheme: {scheme}. Supported: {supported_schemes}")
        
        return v
    
    model_config = {
        "env_prefix": "DATABASE_"
    }


class AuthenticationSettings(BaseSettings):
    """Authentication and JWT configuration settings"""
    
    secret_key: SecretStr = Field(
        default_factory=generate_secure_key,
        min_length=32,
        description="JWT secret key - MUST be at least 32 characters for security",
        validation_alias=AliasChoices('JWT_SECRET_KEY', 'SECRET_KEY', 'secret_key')
    )
    
    algorithm: str = Field(
        default="HS256",
        description="JWT signing algorithm",
        validation_alias=AliasChoices('JWT_ALGORITHM', 'ALGORITHM', 'algorithm')
    )
    
    access_token_expire_minutes: int = Field(
        default=30,
        ge=1,
        le=1440,  # Max 24 hours
        description="JWT access token expiration time in minutes",
        validation_alias=AliasChoices('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 'ACCESS_TOKEN_EXPIRE_MINUTES')
    )
    
    refresh_token_expire_days: int = Field(
        default=7,
        ge=1,
        le=30,  # Max 30 days
        description="JWT refresh token expiration time in days",
        validation_alias=AliasChoices('JWT_REFRESH_TOKEN_EXPIRE_DAYS', 'REFRESH_TOKEN_EXPIRE_DAYS')
    )
    
    @field_validator('secret_key')
    def validate_secret_key(cls, v, info):
        """Validate JWT secret key security requirements"""
        if isinstance(v, SecretStr):
            secret_value = v.get_secret_value()
        else:
            secret_value = v
        
        # Check for common insecure defaults
        insecure_defaults = [
            "your-very-secure-key",
            "secret",
            "key",
            "password",
            "changeme",
            "default",
            "test",
            "development"
        ]
        
        if secret_value.lower() in insecure_defaults:
            raise ValueError(f"SECRET_KEY cannot be a common insecure default. Please use a secure random key.")
        
        return v
    
    @field_validator('algorithm')
    def validate_algorithm(cls, v, info):
        """Validate JWT algorithm"""
        allowed_algorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']
        if v not in allowed_algorithms:
            raise ValueError(f"Algorithm must be one of: {allowed_algorithms}")
        return v
    
    model_config = {
        "env_prefix": "AUTH_"
    }


class EmailSettings(BaseSettings):
    """Email service configuration settings"""
    
    # SendGrid Settings
    sendgrid_api_key: Optional[SecretStr] = Field(
        default=None,
        description="SendGrid API key for email delivery",
        validation_alias=AliasChoices('EMAIL_SENDGRID_API_KEY', 'SENDGRID_API_KEY')
    )
    
    sendgrid_from_email: EmailStr = Field(
        default="noreply@jobticketinvoice.com",
        description="Default from email address for SendGrid",
        validation_alias=AliasChoices('EMAIL_SENDGRID_FROM_EMAIL', 'SENDGRID_FROM_EMAIL')
    )
    
    # SMTP Settings (alternative to SendGrid)
    smtp_server: str = Field(
        default="smtp.gmail.com",
        description="SMTP server hostname",
        validation_alias=AliasChoices('EMAIL_SMTP_SERVER', 'SMTP_SERVER')
    )
    
    smtp_port: int = Field(
        default=587,
        ge=1,
        le=65535,
        description="SMTP server port",
        validation_alias=AliasChoices('EMAIL_SMTP_PORT', 'SMTP_PORT')
    )
    
    smtp_username: Optional[str] = Field(
        default=None,
        description="SMTP authentication username",
        validation_alias=AliasChoices('EMAIL_SMTP_USERNAME', 'SMTP_USERNAME')
    )
    
    smtp_password: Optional[SecretStr] = Field(
        default=None,
        description="SMTP authentication password",
        validation_alias=AliasChoices('EMAIL_SMTP_PASSWORD', 'SMTP_PASSWORD')
    )
    
    from_email: Optional[EmailStr] = Field(
        default=None,
        description="Default from email address for SMTP",
        validation_alias=AliasChoices('EMAIL_FROM_EMAIL', 'FROM_EMAIL')
    )
    
    from_name: str = Field(
        default="JobTicketInvoice",
        description="Default from name for emails",
        validation_alias=AliasChoices('EMAIL_FROM_NAME', 'FROM_NAME')
    )
    
    # Email behavior settings
    dev_mode: bool = Field(
        default=False,
        description="Enable email development mode (logs instead of sending)",
        validation_alias=AliasChoices('EMAIL_DEV_MODE', 'DEV_MODE')
    )
    
    frontend_url: HttpUrl = Field(
        default="http://localhost:3000",
        description="Frontend application URL for email links",
        validation_alias=AliasChoices('EMAIL_FRONTEND_URL', 'FRONTEND_URL')
    )
    
    @field_validator('sendgrid_api_key')
    def validate_sendgrid_key(cls, v, info):
        """Validate SendGrid API key format"""
        if v is not None:
            key_value = v.get_secret_value() if isinstance(v, SecretStr) else v
            if key_value and not key_value.startswith('SG.'):
                raise ValueError("SendGrid API key must start with 'SG.'")
        return v
    
    model_config = {
        "env_prefix": "EMAIL_",
        "env_nested_delimiter": "_"
    }


class SecuritySettings(BaseSettings):
    """Security and encryption configuration settings"""
    
    fernet_key: SecretStr = Field(
        default_factory=generate_fernet_key,
        description="Fernet encryption key for field-level encryption",
        validation_alias=AliasChoices('SECURITY_FERNET_KEY', 'FERNET_KEY')
    )
    
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "https://jobticketinvoice.vercel.app"
        ],
        description="Allowed CORS origins for API access",
        validation_alias=AliasChoices('SECURITY_CORS_ORIGINS', 'CORS_ORIGINS')
    )
    
    cors_allow_credentials: bool = Field(
        default=True,
        description="Allow credentials in CORS requests"
    )
    
    cors_allow_methods: List[str] = Field(
        default=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        description="Allowed HTTP methods for CORS"
    )
    
    cors_allow_headers: List[str] = Field(
        default=["*"],
        description="Allowed headers for CORS"
    )
    
    @field_validator('fernet_key')
    def validate_fernet_key(cls, v, info):
        """Validate Fernet encryption key"""
        from cryptography.fernet import Fernet
        
        if v is not None:
            key_value = v.get_secret_value() if isinstance(v, SecretStr) else v
            try:
                # Validate key format
                Fernet(key_value.encode() if isinstance(key_value, str) else key_value)
            except Exception as e:
                raise ValueError(f"Invalid Fernet key format: {e}")
        
        return v
    
    @field_validator('cors_origins')
    def validate_cors_origins(cls, v, info):
        """Validate CORS origins format"""
        for origin in v:
            if not origin.startswith(('http://', 'https://')):
                raise ValueError(f"CORS origin must start with http:// or https://: {origin}")
        return v
    
    model_config = {
        "env_prefix": "SECURITY_"
    }


class ApplicationSettings(BaseSettings):
    """General application configuration settings"""
    
    environment: str = Field(
        default="development",
        description="Application environment (development, staging, production)",
        validation_alias=AliasChoices('APP_ENVIRONMENT', 'ENVIRONMENT')
    )
    
    debug: bool = Field(
        default=False,
        description="Enable debug mode",
        validation_alias=AliasChoices('APP_DEBUG', 'DEBUG')
    )
    
    api_v1_str: str = Field(
        default="/api/v1",
        description="API version 1 prefix",
        validation_alias=AliasChoices('APP_API_V1_PREFIX', 'API_V1_PREFIX')
    )
    
    project_name: str = Field(
        default="JobTicketInvoice API",
        description="Project name for documentation",
        validation_alias=AliasChoices('APP_PROJECT_NAME', 'PROJECT_NAME')
    )
    
    max_upload_size: int = Field(
        default=10485760,  # 10MB
        ge=1048576,  # 1MB minimum
        le=104857600,  # 100MB maximum
        description="Maximum file upload size in bytes",
        validation_alias=AliasChoices('APP_MAX_UPLOAD_SIZE', 'MAX_UPLOAD_SIZE')
    )
    
    @field_validator('environment')
    def validate_environment(cls, v, info):
        """Validate environment value"""
        allowed_environments = ['development', 'staging', 'production', 'testing']
        if v.lower() not in allowed_environments:
            raise ValueError(f"Environment must be one of: {allowed_environments}")
        return v.lower()
    
    @field_validator('debug')
    def validate_debug_in_production(cls, v, info):
        """Ensure debug is disabled in production"""
        if hasattr(info, 'data') and info.data.get('environment') == 'production' and v:
            raise ValueError("Debug mode must be disabled in production environment")
        return v
    
    model_config = {
        "env_prefix": "APP_",
        "env_nested_delimiter": "_"
    }


class FeatureFlags(BaseSettings):
    """Feature flags and operational settings"""
    
    allow_database_reset: bool = Field(
        default=False,
        description="Allow database reset operations (development only)",
        validation_alias=AliasChoices('FEATURE_ALLOW_DATABASE_RESET', 'ALLOW_DATABASE_RESET')
    )
    
    allow_data_deletion: bool = Field(
        default=False,
        description="Allow bulk data deletion operations (development only)",
        validation_alias=AliasChoices('FEATURE_ALLOW_DATA_DELETION', 'ALLOW_DATA_DELETION')
    )
    
    enable_request_logging: bool = Field(
        default=True,
        description="Enable detailed request/response logging"
    )
    
    enable_performance_monitoring: bool = Field(
        default=False,
        description="Enable performance monitoring and metrics"
    )
    
    @field_validator('allow_database_reset')
    def validate_allow_database_reset(cls, v, info):
        """Ensure allow_database_reset is disabled in production"""
        environment = info.data.get('environment', os.getenv('ENVIRONMENT', 'development')).lower()
        if environment == 'production' and v:
            raise ValueError("allow_database_reset cannot be enabled in production environment")
        return v
    
    @field_validator('allow_data_deletion')
    def validate_allow_data_deletion(cls, v, info):
        """Ensure allow_data_deletion is disabled in production"""
        environment = info.data.get('environment', os.getenv('ENVIRONMENT', 'development')).lower()
        if environment == 'production' and v:
            raise ValueError("allow_data_deletion cannot be enabled in production environment")
        return v
    
    model_config = {
        "env_prefix": "FEATURE_",
        "env_nested_delimiter": "_"
    }


class Settings(BaseSettings):
    """Main application settings combining all configuration domains"""
    
    # Configuration domains
    database: DatabaseSettings = DatabaseSettings()
    auth: AuthenticationSettings = AuthenticationSettings()
    email: EmailSettings = EmailSettings()
    security: SecuritySettings = SecuritySettings()
    app: ApplicationSettings = ApplicationSettings()
    features: FeatureFlags = FeatureFlags()
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore"
    }
    
    def __init__(self, **kwargs):
        """Initialize settings with validation"""
        super().__init__(**kwargs)
        self._validate_cross_domain_requirements()
    
    def _validate_cross_domain_requirements(self):
        """Validate requirements that span multiple configuration domains"""
        
        # Ensure email service is properly configured
        has_sendgrid = self.email.sendgrid_api_key is not None
        has_smtp = (self.email.smtp_username is not None and 
                   self.email.smtp_password is not None)
        
        if not has_sendgrid and not has_smtp and not self.email.dev_mode:
            raise ValueError(
                "Email service must be configured with either SendGrid API key, "
                "SMTP credentials, or dev mode must be enabled"
            )
        
        # Validate production environment requirements
        if self.app.environment == 'production':
            # Ensure secure configuration in production
            if self.app.debug:
                raise ValueError("Debug mode must be disabled in production")
            
            if not self.database.url.startswith('postgresql'):
                raise ValueError("Production environment requires PostgreSQL database")
            
            # Ensure HTTPS in production CORS origins
            for origin in self.security.cors_origins:
                if origin != '*' and origin.startswith('http://'):
                    raise ValueError(f"Production CORS origin must use HTTPS: {origin}")


# Create global settings instance
try:
    settings = Settings()
except Exception as e:
    print(f" Configuration Error: {e}")
    print("\n Required Environment Variables:")
    print("  - SECRET_KEY (minimum 32 characters)")
    print("  - FERNET_KEY (Fernet encryption key)")
    print("\n For development, you can generate secure keys:")
    print(f"  SECRET_KEY={generate_secure_key()}")
    print(f"  FERNET_KEY={generate_fernet_key()}")
    print("\n See .env.example for complete configuration template")
    raise


# Backward compatibility aliases (deprecated - use settings.domain.field instead)
DATABASE_URL = settings.database.url
SECRET_KEY = settings.auth.secret_key.get_secret_value()
ALGORITHM = settings.auth.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = settings.auth.access_token_expire_minutes
