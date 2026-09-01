"""
ChromaDB Vector Database Service for AYUTH RAG Pipeline
Provides persistent vector storage, embedding indexing, and similarity search for statutory documents.
"""

import os
import sys
import site

# Ensure user site packages are accessible
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from data.knowledge_source import KNOWLEDGE_BASE

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_data")
_collection = None

def get_chroma_collection():
    global _collection
    if _collection is not None:
        return _collection

    try:
        import chromadb
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        _collection = client.get_or_create_collection(
            name="ayuth_statutory_knowledge",
            metadata={"hnsw:space": "cosine"}
        )

        # Upsert all canonical knowledge base documents
        ids = []
        documents = []
        metadatas = []

        for doc in KNOWLEDGE_BASE:
            ids.append(doc["id"])
            content = f"{doc.get('question', '')}\n\n{doc.get('answer', '')}"
            documents.append(content)
            metadatas.append({
                "category": doc.get("category", ""),
                "question": doc.get("question", ""),
                "answer": doc.get("answer", ""),
                "citation": doc.get("citation", ""),
                "jurisdiction": ",".join(doc.get("jurisdiction", ["india", "international"])),
            })

        if ids:
            _collection.upsert(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            print(f"[ChromaDB] Synchronized {len(ids)} statutory records into ChromaDB collection.")

        return _collection
    except Exception as e:
        print(f"[ChromaDB] Warning: ChromaDB initialization error ({e}). Using embedded fallback.")
        return None

def search_chroma_documents(query: str, limit: int = 4) -> list:
    """
    Executes semantic nearest-neighbor search in ChromaDB.
    """
    collection = get_chroma_collection()
    if not collection:
        return []

    try:
        results = collection.query(
            query_texts=[query],
            n_results=min(limit, collection.count() or limit)
        )

        matches = []
        if results and "ids" in results and len(results["ids"]) > 0:
            ids = results["ids"][0]
            metadatas = results["metadatas"][0] if "metadatas" in results else []
            distances = results["distances"][0] if "distances" in results else []

            for i in range(len(ids)):
                meta = metadatas[i] if i < len(metadatas) else {}
                dist = distances[i] if i < len(distances) else 1.0
                # Filter out completely irrelevant vectors (cosine distance < 0.85)
                if dist < 0.85:
                    matches.append({
                        "id": ids[i],
                        "question": meta.get("question", ""),
                        "answer": meta.get("answer", ""),
                        "category": meta.get("category", ""),
                        "citation": meta.get("citation", ""),
                        "jurisdiction": [j for j in meta.get("jurisdiction", "").split(",") if j],
                        "similarity": round(1.0 - dist, 3),
                    })

        return matches
    except Exception as e:
        print(f"[ChromaDB Query Error]: {e}")
        return []

def search_chroma_multi(queries: list, limit: int = 6) -> list:
    """
    Searches multiple query facets and deduplicates retrieved documents.
    """
    collection = get_chroma_collection()
    if not collection or not queries:
        return []

    seen_ids = set()
    combined_matches = []

    for q in queries:
        q_str = q.strip()
        if not q_str:
            continue
        matches = search_chroma_documents(q_str, limit=limit)
        for m in matches:
            if m["id"] not in seen_ids:
                seen_ids.add(m["id"])
                combined_matches.append(m)

    # Sort by similarity descending and cap at limit
    combined_matches.sort(key=lambda x: x.get("similarity", 0), reverse=True)
    return combined_matches[:limit]

def add_document_to_chroma(doc: dict):
    collection = get_chroma_collection()
    if not collection:
        return

    doc_id = doc.get("id") or f"doc-{collection.count() + 1}"
    content = f"{doc.get('title') or doc.get('question', '')}\n\n{doc.get('content') or doc.get('answer', '')}"
    collection.upsert(
        ids=[doc_id],
        documents=[content],
        metadatas=[{
            "category": doc.get("category", "Uploaded Legal Document"),
            "question": doc.get("title") or doc.get("question", "Custom Section"),
            "answer": doc.get("content") or doc.get("answer", ""),
            "citation": doc.get("citation", "Custom Section"),
            "jurisdiction": ",".join(doc.get("jurisdiction", ["india", "international"])),
        }]
    )

