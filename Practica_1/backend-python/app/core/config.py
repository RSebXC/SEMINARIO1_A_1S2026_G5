
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "cloudCinema"
    
    # Security
    SECRET_KEY: str = "supersecretkey" 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = ""
    S3_PUBLIC_BASE_URL: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
