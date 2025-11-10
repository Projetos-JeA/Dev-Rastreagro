from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    api_title: str = Field(default="RastreAgro API", alias="API_TITLE")
    api_description: str = Field(
        default="API para plataforma de rastreabilidade e marketplace de animais",
        alias="API_DESCRIPTION",
    )
    api_version: str = Field(default="1.0.0", alias="API_VERSION")

    sql_server_dsn: str = Field(
        default=(
            "mssql+pyodbc://SA:Your_password123@localhost,1433/"
            "RastreAgro?driver=ODBC+Driver+17+for+SQL+Server"
        ),
        alias="SQL_SERVER_DSN",
    )

    jwt_secret_key: str = Field(default="change-me", alias="JWT_SECRET_KEY")
    jwt_refresh_secret_key: str = Field(default="change-me-refresh", alias="JWT_REFRESH_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_access_token_expire_minutes: int = Field(default=30, alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    jwt_refresh_token_expire_minutes: int = Field(default=60 * 24 * 7, alias="JWT_REFRESH_TOKEN_EXPIRE_MINUTES")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        populate_by_name = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
