import numpy as np
import google.generativeai as genai
from config import settings

def cosine_similarity(v1, v2):
    vec1 = np.array(v1, dtype=np.float32)
    vec2 = np.array(v2, dtype=np.float32)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(vec1, vec2) / (norm1 * norm2))

async def generate_embedding(text: str, task_type: str = "RETRIEVAL_QUERY", api_key: str = None) -> list:
    key = api_key or settings.GEMINI_API_KEY
    if not key:
        raise ValueError("No Gemini API key configured. Provide API key in request or set GEMINI_API_KEY.")
    
    genai.configure(api_key=key)
    result = genai.embed_content(
        model=settings.EMBEDDING_MODEL,
        content=text,
        task_type=task_type,
    )
    return result["embedding"]
