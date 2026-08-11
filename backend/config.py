import os
from pathlib import Path

def load_env_file(env_path: Path):
    if not env_path.exists():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip()
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass

env_path = Path(__file__).resolve().parent.parent / ".env"
load_env_file(env_path)

class Settings:
    PROJECT_NAME: str = "ProductIQ — AI Product Research Copilot"
    VERSION: str = "1.0.0"
    
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    TOP_K: int = int(os.getenv("TOP_K", "5"))
    SIMILARITY_THRESHOLD_OPENAI: float = float(os.getenv("SIMILARITY_THRESHOLD_OPENAI", "0.35"))
    SIMILARITY_THRESHOLD_LOCAL: float = float(os.getenv("SIMILARITY_THRESHOLD_LOCAL", "0.30"))
    
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "600"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "80"))
    
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    CHROMA_PERSIST_DIR: Path = BASE_DIR / "backend" / "chroma_db"
    DATA_DIR: Path = BASE_DIR / "backend" / "data"
    SAMPLE_DATA_DIR: Path = BASE_DIR / "sample_data"
    ANALYTICS_FILE: Path = BASE_DIR / "backend" / "analytics" / "events_log.json"

    @property
    def is_openai_available(self) -> bool:
        return bool(self.OPENAI_API_KEY and len(self.OPENAI_API_KEY) > 10)

    @property
    def active_embedding_mode(self) -> str:
        return "OpenAI" if self.is_openai_available else "Local Demo"

    @property
    def active_threshold(self) -> float:
        return self.SIMILARITY_THRESHOLD_OPENAI if self.is_openai_available else self.SIMILARITY_THRESHOLD_LOCAL

settings = Settings()
