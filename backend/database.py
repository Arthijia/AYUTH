import os
from supabase import create_client, Client
from config import settings

_supabase_client: Client = None

def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        url = settings.SUPABASE_URL or os.getenv("SUPABASE_URL")
        key = settings.SUPABASE_KEY or os.getenv("SUPABASE_KEY")
        if url and key:
            try:
                _supabase_client = create_client(url, key)
            except Exception as e:
                print(f"[Supabase] Init error: {e}")
    return _supabase_client

def is_supabase_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
