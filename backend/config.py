import os
import sys
import site
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Ensure user site packages are accessible
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

load_dotenv()

class Settings(BaseSettings):
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # LLM: Groq (llama-3.3-70b-versatile / llama-3.1-70b-versatile)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Vector DB: ChromaDB
    CHROMA_DIR: str = os.getenv("CHROMA_DIR", os.path.join(os.path.dirname(__file__), "chroma_data"))
    TOP_K: int = int(os.getenv("TOP_K", "4"))
    
    # Database & Storage: PostgreSQL + Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

settings = Settings()
