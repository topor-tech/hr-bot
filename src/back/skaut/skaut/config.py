from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with AWS S3 credentials."""
    
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str = Field(
        default="",
        description="AWS Access Key ID for S3 access"
    )
    AWS_SECRET_ACCESS_KEY: str = Field(
        default="",
        description="AWS Secret Access Key for S3 access"
    )
    AWS_REGION: str = Field(
        default="us-east-1",
        description="AWS region for S3 bucket"
    )
    S3_BUCKET_NAME: str = Field(
        default="topor-tech-llm-hr-dev",
        description="S3 bucket name for file storage"
    )
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
