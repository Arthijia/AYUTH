import os
import sys

# Ensure Windows console uses UTF-8 without crashing on Tamil, Hindi, Korean, Arabic, etc.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from fastapi import FastAPI, HTTPException, Body, UploadFile, File, Form
from fastapi.responses import FileResponse, PlainTextResponse
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
from services.locker_service import (
    save_uploaded_evidence_file,
    create_invention_locker_record,
    list_all_locker_records,
    get_locker_record_by_id,
    get_evidence_file_path,
    generate_locker_record_id,
    generate_receipt_text,
)
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
    language: Optional[str] = "auto"
    limit: Optional[int] = 4
    apiKey: Optional[str] = None
    documentText: Optional[str] = None
    sessionId: Optional[str] = None

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

import logging
import traceback

logger = logging.getLogger("ayuth")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

@app.post("/api/chat")
async def chat_endpoint(payload: ChatRequest):
    query_text = (payload.message or payload.question or "").strip()
    if not query_text and not payload.documentText:
        raise HTTPException(status_code=400, detail="Missing message or question")

    try:
        response = generate_agent_response(
            query=query_text or "Invention Analysis Request from Document",
            history=payload.history,
            invention_profile=payload.inventionProfile,
            language=payload.language or "auto",
            api_key=payload.apiKey,
            document_text=payload.documentText,
            session_id=payload.sessionId,
        )
        return response
    except Exception as e:
        logger.exception(f"[AYUTH Error] Exception occurred during chat synthesis: {e}")
        traceback.print_exc()
        # Return a structured failure object that does not crash the frontend
        target_lang = payload.language or "en"
        if target_lang == "ta":
            friendly_msg = "தகவலை செயலாக்கும்போது ஒரு சிக்கல் ஏற்பட்டது. தயவுசெய்து உங்கள் கண்டுபிடிப்பு அல்லது கேள்வியை மீண்டும் பகிரவும்."
        elif target_lang == "hi":
            friendly_msg = "सूचना को संसाधित करते समय एक त्रुटि हुई। कृपया अपने आविष्कार या प्रश्न का विवरण पुनः साझा करें।"
        elif target_lang == "ko":
            friendly_msg = "정보를 처리하는 중 오류가 발생했습니다. 발명 내용이나 질문을 다시 입력해 주세요."
        else:
            friendly_msg = "A temporary processing error occurred while generating the advisory. Please rephrase or share more details about your invention."

        return {
            "success": False,
            "status": "error",
            "error_code": "RAG_PROCESSING_ERROR",
            "answer": friendly_msg,
            "user_message": friendly_msg,
            "language": target_lang,
            "intent": "ERROR_FALLBACK",
            "rag_used": False,
            "sources": [],
            "proof_documents": [],
            "citations": []
        }

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

class CreateLockerRecordRequest(BaseModel):
    title: Optional[str] = "Ayurvedic Invention Record"
    description: str
    record_id: Optional[str] = None
    files: Optional[List[Dict[str, Any]]] = []
    meta_info: Optional[Dict[str, Any]] = None
    problem: Optional[str] = ""
    novelty: Optional[str] = ""
    disclosure: Optional[str] = ""
    bioResources: Optional[str] = ""

@app.post("/api/locker/upload")
async def locker_upload_evidence(
    files: List[UploadFile] = File(...),
    record_id: Optional[str] = Form(None),
    metadata_json: Optional[str] = Form(None)
):
    """
    Accepts multiple documents, images, and video proofs.
    Streams directly to disk and computes SHA-256 chunk-by-chunk without modifying the original bytes.
    """
    r_id = record_id.strip() if record_id and record_id.strip() else generate_locker_record_id()
    client_meta = {}
    if metadata_json:
        try:
            client_meta = json.loads(metadata_json)
        except Exception:
            pass

    saved_files = []
    errors = []

    for upload in files:
        filename = upload.filename or "unnamed_evidence"
        try:
            file_info = save_uploaded_evidence_file(
                file_obj=upload.file,
                filename=filename,
                record_id=r_id,
                client_metadata=client_meta.get(filename, {})
            )
            saved_files.append(file_info)
        except Exception as e:
            logger.exception(f"Error uploading evidence file {filename}: {e}")
            errors.append({"file": filename, "error": str(e)})

    return {
        "status": "success" if saved_files else "error",
        "record_id": r_id,
        "uploaded_files": saved_files,
        "total_uploaded": len(saved_files),
        "errors": errors
    }

@app.post("/api/locker/create")
async def locker_create_record(payload: CreateLockerRecordRequest):
    """
    Finalizes the Invention Locker Record, computes the Master SHA-256 Hash across all files and description,
    and returns a verified proof-of-conception receipt.
    """
    if not payload.description.strip() and not payload.files:
        raise HTTPException(status_code=400, detail="Invention technical description or evidence files required")

    r_id = payload.record_id or generate_locker_record_id()
    record = create_invention_locker_record(
        title=payload.title or "Ayurvedic Invention Record",
        description=payload.description,
        files=payload.files or [],
        record_id=r_id,
        meta_info={
            "problem": payload.problem,
            "novelty": payload.novelty,
            "disclosure": payload.disclosure,
            "bioResources": payload.bioResources,
            **(payload.meta_info or {})
        }
    )

    # Maintain backward compatibility with in-memory store
    save_invention_record({
        "id": r_id,
        "title": record["title"],
        "description": record["description"],
        "sha256Hash": record["master_sha256"],
        "master_sha256": record["master_sha256"],
        "files_count": len(record["files"]),
        "timestamp_utc": record["timestamp_utc"],
    })

    return {
        "status": "success",
        "message": "Invention Locker Record cryptographically sealed with Master SHA-256",
        "record": record
    }

@app.get("/api/locker/records")
async def locker_get_records():
    records = list_all_locker_records()
    return {"status": "success", "records": records, "total": len(records)}

@app.get("/api/locker/records/{record_id}")
async def locker_get_record(record_id: str):
    rec = get_locker_record_by_id(record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Locker record not found")
    return {"status": "success", "record": rec}

@app.get("/api/locker/records/{record_id}/files/{file_type}/{filename}")
async def locker_get_file(record_id: str, file_type: str, filename: str):
    path = get_evidence_file_path(record_id, file_type, filename)
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Requested evidence file not found")
    return FileResponse(path, filename=filename)

@app.get("/api/locker/records/{record_id}/receipt")
async def locker_download_receipt(record_id: str):
    rec = get_locker_record_by_id(record_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Locker record not found")
    receipt_text = rec.get("receipt_text", "")
    return PlainTextResponse(
        content=receipt_text,
        headers={"Content-Disposition": f"attachment; filename=AYUTH_Proof_{record_id}.txt"}
    )

@app.post("/api/inventions/save")
async def save_invention(payload: SaveInventionRequest):
    if not payload.description.strip():
        raise HTTPException(status_code=400, detail="Invention description is required")

    record = create_invention_locker_record(
        title=payload.title or "Ayurvedic Invention Record",
        description=payload.description,
        files=[],
        meta_info={
            "problem": payload.problem,
            "novelty": payload.novelty,
            "disclosure": payload.disclosure,
            "bioResources": payload.bioResources,
            "sha256Hash": payload.sha256Hash
        }
    )
    return {"status": "success", "message": "Invention document timestamped and saved successfully", "record": record}

@app.get("/api/inventions")
async def get_inventions():
    records = list_all_locker_records()
    return {"records": records, "total": len(records)}

# Mount static frontend build if present
dist_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
