from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    allowed_origins: list[str] = ["*"]
    clickhouse_url: str = "clickhouse://clickhouse:9000"
    redis_url: str = "redis://redis:6379"
    model_path: str = "/models"

    class Config:
        env_file = ".env"

settings = Settings()
