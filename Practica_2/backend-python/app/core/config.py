
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database - Amazon RDS (MySQL)
    DB_USER: str = "root"
    DB_PASSWORD: str = "root"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "taskflow_db"

    # Security - JWT
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
