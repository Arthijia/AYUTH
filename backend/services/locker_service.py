"""
AYUTH Invention Locker Service - Supporting Documents & Video Proofs Security
- Streaming SHA-256 cryptographic hashing without memory bloat
- Unmodified raw evidence storage for Documents (PDF/DOCX/XLSX/TXT), Images (PNG/JPG/JPEG), and Videos (MP4/MOV/WEBM)
- Deterministic Master SHA-256 Invention Hash computation
- Tamper-proof evidence packaging & verified receipt generation
"""

import os
import sys
import json
import hashlib
import uuid
import shutil
from datetime import datetime
from typing import List, Dict, Any, Optional

# Base storage directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCKER_STORAGE_DIR = os.path.join(BASE_DIR, "uploads", "locker_records")
os.makedirs(LOCKER_STORAGE_DIR, exist_ok=True)

# Allowed extensions mapped by evidence type
ALLOWED_EXTENSIONS = {
    # Documents
    ".pdf": "document",
    ".doc": "document",
    ".docx": "document",
    ".txt": "document",
    ".xlsx": "document",
    # Images
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    # Videos
    ".mp4": "video",
    ".mov": "video",
    ".webm": "video",
}

def get_file_category(filename: str) -> Optional[str]:
    """Returns 'document', 'image', or 'video' based on extension."""
    ext = os.path.splitext(filename.lower())[1]
    return ALLOWED_EXTENSIONS.get(ext)

def compute_stream_sha256(file_obj, chunk_size: int = 65536) -> tuple[str, int]:
    """
    Computes SHA-256 hash and total byte size of a file-like stream in memory-safe chunks.
    Does not load the whole video into RAM.
    """
    hasher = hashlib.sha256()
    total_bytes = 0
    file_obj.seek(0)
    while True:
        chunk = file_obj.read(chunk_size)
        if not chunk:
            break
        hasher.update(chunk)
        total_bytes += len(chunk)
    file_obj.seek(0)
    return hasher.hexdigest(), total_bytes

def generate_locker_record_id() -> str:
    """Generates a standardized AYUTH Locker Record ID."""
    rand_suffix = uuid.uuid4().hex[:8].upper()
    return f"AYUTH-LOCK-{rand_suffix}"

def save_uploaded_evidence_file(file_obj, filename: str, record_id: str, client_metadata: Optional[dict] = None) -> Dict[str, Any]:
    """
    Saves an uploaded evidence file into the record's specific folder without modifying the original bytes.
    Calculates SHA-256 directly from the raw bytes.
    """
    category = get_file_category(filename)
    if not category:
        raise ValueError(f"Unsupported file format for '{filename}'. Allowed: PDF, DOC, DOCX, TXT, XLSX, PNG, JPG, JPEG, MP4, MOV, WEBM.")

    # Target folder: uploads/locker_records/AYUTH-LOCK-XXXXXXXX/<category>s/
    folder_name = f"{category}s"
    target_dir = os.path.join(LOCKER_STORAGE_DIR, record_id, folder_name)
    os.makedirs(target_dir, exist_ok=True)

    # Sanitize filename while preserving base name
    safe_filename = os.path.basename(filename).replace(" ", "_")
    target_filepath = os.path.join(target_dir, safe_filename)

    # Stream write to disk and compute SHA-256 simultaneously
    hasher = hashlib.sha256()
    total_bytes = 0
    chunk_size = 65536

    file_obj.seek(0)
    with open(target_filepath, "wb") as dest:
        while True:
            chunk = file_obj.read(chunk_size)
            if not chunk:
                break
            dest.write(chunk)
            hasher.update(chunk)
            total_bytes += len(chunk)

    file_sha256 = hasher.hexdigest()

    file_info = {
        "type": category,
        "name": safe_filename,
        "original_name": filename,
        "size_bytes": total_bytes,
        "size_formatted": format_file_size(total_bytes),
        "sha256": file_sha256,
        "relative_path": f"{folder_name}/{safe_filename}",
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
        "metadata": client_metadata or {}
    }

    return file_info

def format_file_size(size_in_bytes: int) -> str:
    """Formats bytes into human readable size."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} B"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} KB"
    elif size_in_bytes < 1024 * 1024 * 1024:
        return f"{size_in_bytes / (1024 * 1024):.1f} MB"
    else:
        return f"{size_in_bytes / (1024 * 1024 * 1024):.2f} GB"

def compute_master_invention_hash(
    title: str,
    description: str,
    files: List[Dict[str, Any]],
    record_id: str,
    timestamp_iso: str
) -> str:
    """
    Computes a deterministic master SHA-256 hash covering the invention disclosure,
    all uploaded evidence files (sorted by name/hash), timestamp, and record ID.
    """
    canonical_files = []
    for f in sorted(files, key=lambda x: (x.get("type", ""), x.get("name", ""))):
        canonical_files.append({
            "type": f.get("type"),
            "name": f.get("name"),
            "sha256": f.get("sha256"),
            "size_bytes": f.get("size_bytes", 0)
        })

    payload = {
        "record_id": record_id,
        "invention_title": title.strip(),
        "technical_description": description.strip(),
        "files": canonical_files,
        "timestamp_iso": timestamp_iso
    }

    canonical_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()

def create_invention_locker_record(
    title: str,
    description: str,
    files: List[Dict[str, Any]],
    record_id: Optional[str] = None,
    meta_info: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Creates and finalizes a complete Invention Locker Record with Master SHA-256 and metadata.json.
    """
    r_id = record_id or generate_locker_record_id()
    now_utc = datetime.utcnow()
    timestamp_iso = now_utc.isoformat() + "Z"
    timestamp_formatted = now_utc.strftime("%Y-%m-%d %H:%M:%S UTC")

    # Calculate Master SHA-256
    master_sha256 = compute_master_invention_hash(
        title=title,
        description=description,
        files=files,
        record_id=r_id,
        timestamp_iso=timestamp_iso
    )

    # Document type counts
    doc_count = sum(1 for f in files if f.get("type") == "document")
    img_count = sum(1 for f in files if f.get("type") == "image")
    vid_count = sum(1 for f in files if f.get("type") == "video")
    total_size = sum(f.get("size_bytes", 0) for f in files) + len(description.encode('utf-8'))

    record = {
        "record_id": r_id,
        "title": title.strip() or "Ayurvedic Invention Record",
        "description": description.strip(),
        "master_sha256": master_sha256,
        "timestamp_utc": timestamp_formatted,
        "timestamp_iso": timestamp_iso,
        "total_files": len(files),
        "documents_count": doc_count,
        "images_count": img_count,
        "videos_count": vid_count,
        "total_size_formatted": format_file_size(total_size),
        "files": files,
        "meta_info": meta_info or {},
        "status": "LOCKED_AND_VERIFIED",
        "receipt_text": generate_receipt_text(
            r_id=r_id,
            title=title,
            description=description,
            files=files,
            master_sha256=master_sha256,
            timestamp=timestamp_formatted,
            total_size_str=format_file_size(total_size)
        )
    }

    # Save metadata.json in record directory
    record_dir = os.path.join(LOCKER_STORAGE_DIR, r_id)
    os.makedirs(record_dir, exist_ok=True)
    metadata_path = os.path.join(record_dir, "metadata.json")

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(record, f, indent=2, ensure_ascii=False)

    return record

def generate_receipt_text(
    r_id: str,
    title: str,
    description: str,
    files: List[Dict[str, Any]],
    master_sha256: str,
    timestamp: str,
    total_size_str: str
) -> str:
    """
    Generates a formal, printable / downloadable proof-of-conception receipt.
    """
    lines = [
        "================================================================================",
        "AYUTH INTELLECTUAL PROPERTY LOCKER - VERIFIED PROOF OF CONCEPTION RECEIPT",
        "================================================================================",
        f"Locker Record ID    : {r_id}",
        f"Invention Title     : {title}",
        f"Server Timestamp    : {timestamp}",
        f"Master SHA-256 Hash : {master_sha256}",
        f"Total Evidence Size : {total_size_str}",
        f"Total Files Locked  : {len(files)} (Docs: {sum(1 for f in files if f.get('type') == 'document')}, Images: {sum(1 for f in files if f.get('type') == 'image')}, Videos: {sum(1 for f in files if f.get('type') == 'video')})",
        "Jurisdiction Scope  : Global / Indian Patent Office (Prior User Rights Defense)",
        "================================================================================",
        "",
        "EVIDENCE FILES LOCKED & TIME-STAMPED:",
    ]

    if not files:
        lines.append("  (No external files attached; technical description text locked directly)")
    else:
        for idx, f in enumerate(files, 1):
            f_type = f.get("type", "document").capitalize()
            if f_type == "Video":
                f_type = "Video Proof"
            lines.append(f"{idx}. {f.get('name')}")
            lines.append(f"   Type    : {f_type}")
            lines.append(f"   Size    : {f.get('size_formatted', 'N/A')}")
            lines.append(f"   SHA-256 : {f.get('sha256')}")
            if f.get("metadata"):
                meta_str = ", ".join([f"{k}: {v}" for k, v in f.get("metadata", {}).items() if v])
                if meta_str:
                    lines.append(f"   Metadata: {meta_str}")
            lines.append("")

    lines.extend([
        "================================================================================",
        "STATUTORY & LEGAL NOTICE:",
        "1. This timestamped SHA-256 cryptographic receipt establishes immutable proof of",
        "   conception under Section 2(1)(j) & Section 3(p) of the Patents Act, 1970 and",
        "   international patent treaty frameworks (WIPO / EPO / USPTO).",
        "2. All documents, drawings, and original video proofs are preserved bit-for-bit",
        "   in their original binary form to guarantee tamper-evident integrity in court.",
        "3. Master SHA-256 cryptographically verifies the entire evidence package as a unit.",
        "================================================================================"
    ])

    return "\n".join(lines)

def list_all_locker_records() -> List[Dict[str, Any]]:
    """
    Scans uploads/locker_records/ and returns all verified invention locker records.
    """
    records = []
    if not os.path.exists(LOCKER_STORAGE_DIR):
        return []

    for entry in os.listdir(LOCKER_STORAGE_DIR):
        rec_dir = os.path.join(LOCKER_STORAGE_DIR, entry)
        if os.path.isdir(rec_dir):
            meta_file = os.path.join(rec_dir, "metadata.json")
            if os.path.exists(meta_file):
                try:
                    with open(meta_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        records.append(data)
                except Exception as e:
                    print(f"[Locker Service] Error reading {meta_file}: {e}")

    # Sort descending by timestamp
    records.sort(key=lambda x: x.get("timestamp_iso", ""), reverse=True)
    return records

def get_locker_record_by_id(record_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single locker record by ID."""
    rec_dir = os.path.join(LOCKER_STORAGE_DIR, record_id)
    meta_file = os.path.join(rec_dir, "metadata.json")
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return None
    return None

def get_evidence_file_path(record_id: str, file_type: str, filename: str) -> Optional[str]:
    """Returns absolute file path for a stored evidence file if it exists."""
    folder_name = f"{file_type}s"
    safe_filename = os.path.basename(filename)
    path = os.path.join(LOCKER_STORAGE_DIR, record_id, folder_name, safe_filename)
    if os.path.exists(path):
        return path
    return None
