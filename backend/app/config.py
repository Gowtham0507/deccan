from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    groq_api_key: str = ""
    gemini_api_key: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    chroma_persist_dir: str = "./chroma_db"
    frontend_url: str = "http://localhost:3000"
    resend_api_key: str = ""
    app_url: str = "http://localhost:3000"  # public URL for form links

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
