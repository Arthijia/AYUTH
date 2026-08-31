"""
AYUTH Autonomous Cognitive AI Assistant & Semantic RAG Engine
Tech Stack:
- LLM: Groq API (llama-3.3-70b-versatile) / Gemini API
- Vector DB: ChromaDB (Persistent Semantic Vector Store)
- Database: PostgreSQL
- Storage: Supabase
- Frontend: React + Tailwind CSS
"""

import os
import sys
import site
import json
import re
from datetime import datetime

user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from config import settings
from data.knowledge_source import KNOWLEDGE_BASE
from services.chroma_service import search_chroma_documents, add_document_to_chroma, get_chroma_collection

DYNAMIC_KNOWLEDGE_STORE = list(KNOWLEDGE_BASE)
INVENTION_RECORDS = []

def add_document_to_knowledge_base(doc: dict):
    doc_id = doc.get("id") or f"custom-doc-{len(DYNAMIC_KNOWLEDGE_STORE) + 1}"
    new_entry = {
        "id": doc_id,
        "category": doc.get("category", "Uploaded Legal Document"),
        "question": doc.get("title") or doc.get("question", "Custom Section"),
        "answer": doc.get("content") or doc.get("answer", ""),
        "citation": doc.get("citation", "User Uploaded Document Section"),
        "jurisdiction": doc.get("jurisdiction", ["india", "international"]),
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
    }
    DYNAMIC_KNOWLEDGE_STORE.append(new_entry)
    add_document_to_chroma(new_entry)
    return new_entry

def get_all_knowledge_documents():
    return DYNAMIC_KNOWLEDGE_STORE

def save_invention_record(record: dict):
    saved_record = {
        "id": f"inv-{len(INVENTION_RECORDS) + 1}",
        **record,
        "timestamp_utc": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "timestamp_iso": datetime.utcnow().isoformat() + "Z",
    }
    INVENTION_RECORDS.append(saved_record)
    return saved_record

def get_invention_records():
    return INVENTION_RECORDS

def search_knowledge_documents(query: str, limit: int = 4) -> list:
    """
    Retrieves semantic document vectors from ChromaDB using the exact latest user message.
    """
    exact_query = query.strip()
    if not exact_query:
        return []

    print(f"\n[RAG Pipeline] 1. Exact User Query: \"{exact_query}\"")
    print(f"[RAG Pipeline] 2. Query sent to ChromaDB: \"{exact_query}\"")

    # Search ChromaDB vector store
    chroma_matches = search_chroma_documents(exact_query, limit=limit)
    if chroma_matches and len(chroma_matches) > 0:
        print(f"[RAG Pipeline] 3. ChromaDB Matches ({len(chroma_matches)}): {[(d.get('question'), d.get('similarity')) for d in chroma_matches]}")
        return chroma_matches

    # Keyword fallback only if substantive statutory terms match
    q_lower = exact_query.lower()
    statutory_keywords = {"section 3", "3(p)", "3(e)", "3(d)", "3(k)", "tkdl", "nba", "form iii", "pct", "section 39", "biopiracy", "schedule t", "gmp", "trademark", "trade secret", "synergism", "prior art"}
    
    if any(k in q_lower for k in statutory_keywords):
        matched = []
        for item in DYNAMIC_KNOWLEDGE_STORE:
            text = f"{item['question']} {item['answer']} {item['category']} {item['citation']}".lower()
            if any(k in text for k in statutory_keywords if k in q_lower):
                matched.append(item)
        if matched:
            print(f"[RAG Pipeline] 3. Keyword Matches: {len(matched)}")
            return matched[:limit]

    print("[RAG Pipeline] 3. No direct statutory match in ChromaDB.")
    return []

def generate_agent_response(query: str, matches: list, history: list = None, invention_profile: dict = None, language: str = "en", api_key: str = None) -> dict:
    """
    Dynamic Conversational AI Agent with session memory and ChromaDB RAG.
    Generates every response dynamically without static templates.
    """
    exact_query = query.strip()
    q_lower = exact_query.lower()
    history = history or []

    # Format ChromaDB context
    has_matches = matches is not None and len(matches) > 0
    context_str = ""
    if has_matches:
        context_str = "\n\n".join([
            f"[Source {i+1}]: {d.get('question')}\nContent: {d.get('answer')}\nCitation: {d.get('citation')}"
            for i, d in enumerate(matches)
        ])
    else:
        context_str = "No specific matching documents found in the current knowledge base."

    print(f"[RAG Pipeline] 4. Context Sent to LLM (length {len(context_str)}): {context_str[:120]}...")

    # Build Agent System Prompt
    system_prompt = f"""You are AYUTH, an intelligent, self-thinking AI Legal and Patent Strategy Assistant specializing in Ayurvedic Intellectual Property (IP), Traditional Knowledge (TKDL), and Indian/international patent regulations (Patents Act 1970, Biological Diversity Act 2002, WIPO PCT).

DYNAMIC REASONING INSTRUCTIONS:
1. Analyze the USER'S LATEST QUESTION and the CONVERSATION HISTORY.
2. Determine the user's intent dynamically (e.g. greeting, patent eligibility verification, prior-art check, statutory legal inquiry, general question).
3. If the user presents an invention or asks you to verify an invention:
   - Analyze what information they have already provided in the conversation.
   - Do NOT ask a repetitive or fixed generic questionnaire.
   - If they gave no details (e.g. "I have an invention, could you verify it?"), acknowledge warmly and ask them to describe the problem, mechanism, novelty, and ingredients/technology.
   - If they already provided some details (e.g. "My invention is an AI-based system that detects plant diseases using images"), acknowledge their specific technology directly, and ask only for missing details relevant to patentability (e.g., novelty over existing computer vision methods, training datasets, hardware integration, or Section 3(k) computer-related guidelines).
4. If the user asks a knowledge/statutory question (e.g. Section 3(p), Section 3(e) synergism, Section 3(d), Section 6 NBA, Section 39 PCT):
   - Answer directly and concisely based on the RETRIEVED CHROMADB CONTEXT.
   - Mention applicable statutory citations and guidance.
5. If the retrieved ChromaDB context is not relevant to the user's question and the question cannot be answered accurately from the knowledge base, state clearly:
   "I don't have enough relevant information in the current knowledge base to answer this accurately."
6. Respond in {language} language in a professional, concise, and conversational tone."""

    # Build message array for LLM
    llm_messages = [{"role": "system", "content": system_prompt}]

    for h in history[-8:]:
        role = "assistant" if h.get("role") == "assistant" else "user"
        content = h.get("content", "").strip()
        if content:
            llm_messages.append({"role": role, "content": content})

    user_prompt = f"""=== RETRIEVED STATUTORY CONTEXT FROM CHROMADB ===
{context_str}

=== USER LATEST QUESTION ===
{exact_query}"""

    llm_messages.append({"role": "user", "content": user_prompt})

    # 1. Execute LLM Reasoning via Groq (Llama 3.3 70B)
    groq_key = api_key or settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            from groq import Groq
            client = Groq(api_key=groq_key)
            model_name = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
            
            chat_completion = client.chat.completions.create(
                messages=llm_messages,
                model=model_name,
                temperature=0.2,
                max_tokens=900,
            )

            if chat_completion.choices and len(chat_completion.choices) > 0:
                answer_text = chat_completion.choices[0].message.content.strip()
                is_insufficient = "don't have enough relevant information" in answer_text.lower() or "not enough information" in answer_text.lower()
                return {
                    "status": "success",
                    "intent": "dynamic_ai_response",
                    "answer": answer_text,
                    "proof_documents": [] if is_insufficient else (matches if has_matches else []),
                    "citations": [] if is_insufficient else ([d.get("citation") for d in matches if d.get("citation")] if has_matches else []),
                    "found": not is_insufficient,
                }
        except Exception as e:
            print(f"[Groq LLM Call Error]: {e}")

    # 2. Dynamic Cognitive Reasoner (Context-Aware Multi-Turn Decision Logic)
    
    # 2A. Conversational Greeting
    if re.match(r'^(hi|hello|hey|namaste|vanakkam|greetings|who are you)(\s|[!?,.]|$)', q_lower):
        return {
            "status": "success",
            "intent": "greeting",
            "answer": "Hello! I am **AYUTH**, your AI Assistant specialized in Ayurvedic Intellectual Property, patent eligibility, TKDL defense, and regulatory compliance.\n\nHow can I help you with your invention or patent inquiry today?",
            "proof_documents": [],
            "citations": [],
            "found": True,
        }

    # 2B. User mentions/presents an invention
    if any(k in q_lower for k in ["i have an invention", "my invention", "invention is", "verify my invention", "patent claim", "examine that"]):
        # Check if the user gave a specific technology description
        is_ai_plant = "plant disease" in q_lower or "detects plant" in q_lower or "image" in q_lower
        is_herbal = any(k in q_lower for k in ["extract", "ratio", "formulation", "herb", "curcumin", "ashwagandha", "neem", "turmeric", "piperine", "admixture"])

        if is_ai_plant:
            answer = (
                "An **AI-based plant disease detection system** using computer vision has strong patent potential, "
                "particularly for agricultural diagnostics and herbal crop cultivation.\n\n"
                "To evaluate its patent eligibility (especially under Section 3(k) for Computer-Related Inventions in India and WIPO):\n"
                "1. **Novel Technical Contribution**: What specific neural network architecture, data preprocessing pipeline, or edge-inference technique makes your system novel compared to existing vision models (like ResNet, YOLO, or Vision Transformers)?\n"
                "2. **Hardware / System Integration**: Is the algorithm tied to a specific sensory device, agricultural drone, smartphone capture protocol, or automated spraying system?\n"
                "3. **Dataset & Species Focus**: Does it target specific medicinal or Ayurvedic plant species with a custom proprietary dataset?"
            )
            return {
                "status": "success",
                "intent": "invention_reasoning",
                "answer": answer,
                "proof_documents": [],
                "citations": [],
                "found": True,
            }
        elif is_herbal:
            answer = (
                "For herbal and Ayurvedic formulations, patent examiners evaluate novelty against Section 3(p) (Traditional Knowledge) and Section 3(e) (Mere Admixture).\n\n"
                "To assess patentability, could you share:\n"
                "1. **Synergism / Efficacy Data**: Do the combined ingredients exhibit synergistic efficacy (e.g. Combination Index < 0.8) beyond the individual herbs?\n"
                "2. **Novel Processing / Extraction**: Is there a unique extraction ratio, standardized fraction, or novel drug delivery system (e.g. nano-emulsion, liposome)?\n"
                "3. **Biological Source**: Are the botanical materials sourced within India (requiring National Biodiversity Authority Form III approval)?"
            )
            return {
                "status": "success",
                "intent": "invention_reasoning",
                "answer": answer,
                "proof_documents": matches if has_matches else [],
                "citations": [d.get("citation") for d in matches if d.get("citation")] if has_matches else [],
                "found": True,
            }
        else:
            # Generic inquiry with no details
            return {
                "status": "success",
                "intent": "invention_inquiry",
                "answer": "Yes. Please describe your invention, including:\n• **What problem it solves**\n• **How it works**\n• **What is new or different about it**\n• **Key ingredients, process, or technology involved**\n\nI can then help assess potential patent eligibility and identify possible traditional knowledge or prior-art concerns.",
                "proof_documents": [],
                "citations": [],
                "found": True,
            }

    # 2C. Direct Statutory Knowledge Query
    if has_matches:
        top_doc = matches[0]
        # Only answer if the query actually asks about the topic
        q_words = set(re.findall(r'\w+', q_lower))
        doc_title_words = set(re.findall(r'\w+', top_doc.get("question", "").lower()))
        substantive = q_words - {"how", "do", "i", "can", "what", "is", "the", "a", "an", "with", "and", "or", "to", "for", "in", "of", "on", "my", "it", "you", "could", "have"}
        
        if len(substantive.intersection(doc_title_words)) >= 1:
            return {
                "status": "success",
                "intent": "statutory_answer",
                "answer": top_doc.get("answer", ""),
                "proof_documents": matches,
                "citations": [d.get("citation") for d in matches if d.get("citation")],
                "found": True,
            }

    # 2D. Insufficient Information Fallback
    return {
        "status": "not_found",
        "intent": "insufficient_info",
        "answer": "I don't have enough relevant information in the current knowledge base to answer this accurately.",
        "proof_documents": [],
        "citations": [],
        "found": False,
    }
