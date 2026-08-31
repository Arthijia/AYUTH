import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from config import settings
from services.rag_service import (
    search_knowledge_documents,
    generate_agent_response,
    add_document_to_knowledge_base,
    get_all_knowledge_documents,
    save_invention_record,
    get_invention_records,
)
from services.classifier_service import evaluate_invention_profile
from database import is_supabase_configured

app = FastAPI(
    title="AYUTH Autonomous RAG & Statutory Compliance Agent",
    description="Dataset-grounded IP advisory agent with document proofs, section management, and timestamped invention security.",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: Optional[str] = None
    question: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []
    jurisdiction: Optional[str] = "all"
    inventionProfile: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"
    limit: Optional[int] = 4
    apiKey: Optional[str] = None

class DocumentUploadRequest(BaseModel):
    title: str
    category: str
    content: str
    citation: str
    jurisdiction: Optional[List[str]] = ["india", "international"]

class SaveInventionRequest(BaseModel):
    title: Optional[str] = "Invention Submission"
    description: str
    problem: Optional[str] = ""
    novelty: Optional[str] = ""
    disclosure: Optional[str] = ""
    bioResources: Optional[str] = ""
    sha256Hash: Optional[str] = ""

@app.get("/api/health")
async def health_check():
    all_docs = get_all_knowledge_documents()
    return {
        "status": "ok",
        "service": "AYUTH Autonomous Legal RAG Engine",
        "version": "2.1.0",
        "engine": "Autonomous RAG Knowledge Agent (Direct Statutory Grounding)",
        "totalKnowledgeRecords": len(all_docs),
        "totalInventionRecords": len(get_invention_records()),
        "supabaseConfigured": is_supabase_configured(),
    }

@app.get("/api/kb")
@app.get("/api/documents")
async def get_documents():
    docs = get_all_knowledge_documents()
    return {"records": docs, "total": len(docs)}

@app.post("/api/documents/upload")
async def upload_document(payload: DocumentUploadRequest):
    if not payload.title.strip() or not payload.content.strip():
        raise HTTPException(status_code=400, detail="Document title and content are required")

    new_doc = add_document_to_knowledge_base({
        "category": payload.category or "Custom Legal Section",
        "title": payload.title,
        "content": payload.content,
        "citation": payload.citation or payload.title,
        "jurisdiction": payload.jurisdiction or ["india", "international"],
    })
    return {"status": "success", "message": "Document indexed successfully into AYUTH knowledge base", "document": new_doc}

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    query_text = (payload.message or payload.question or "").strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Missing message or question")

    try:
        matches = search_knowledge_documents(
            query=query_text,
            limit=payload.limit or 4,
        )
        response = generate_agent_response(
            query=query_text,
            matches=matches,
            history=payload.history,
            invention_profile=payload.inventionProfile,
            language=payload.language or "en",
            api_key=payload.apiKey,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/search")
async def rag_search(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "").strip()
    limit = payload.get("limit", 4)
    if not query:
        raise HTTPException(status_code=400, detail="Missing query")

    matches = search_knowledge_documents(query=query, limit=limit)
    return {"query": query, "totalResults": len(matches), "results": matches}

@app.post("/api/classify")
async def classify_invention(payload: Dict[str, Any] = Body(...)):
    profile = payload.get("profile", {})
    if not profile:
        raise HTTPException(status_code=400, detail="Missing invention profile")
    return evaluate_invention_profile(profile)

@app.post("/api/inventions/save")
async def save_invention(payload: SaveInventionRequest):
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Invention description is required")

    record = save_invention_record({
        "title": payload.title,
        "description": payload.description,
        "problem": payload.problem,
        "novelty": payload.novelty,
        "disclosure": payload.disclosure,
        "bioResources": payload.bioResources,
        "sha256Hash": payload.sha256Hash,
    })
    return {"status": "success", "message": "Invention document timestamped and saved successfully", "record": record}

@app.get("/api/inventions")
async def get_inventions():
    return {"records": get_invention_records(), "total": len(get_invention_records())}

# Mount static frontend build if present
dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
