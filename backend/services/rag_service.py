"""
AYUTH Autonomous Cognitive AI Assistant & Semantic RAG Comparison Engine
- Strict Language Decision Hierarchy & Intent Router
- Greetings & Casual Chat bypass RAG completely (rag_used=False, sources=[])
- Invention disclosures trigger dynamic feature comparison
- Canonical Statutory Knowledge retrieval for patent queries
"""

import os
import sys
import site
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

from config import settings
from data.knowledge_source import KNOWLEDGE_BASE
from services.chroma_service import (
    search_chroma_documents,
    search_chroma_multi,
    add_document_to_chroma,
    get_chroma_collection
)
from services.language_service import (
    determine_language_hierarchy,
    get_or_create_session,
    update_session_state,
    COMMON_SHORT_GREETINGS_CASUAL
)

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

def call_groq_llm(messages: list, api_key: str = None, temperature: float = 0.2, max_tokens: int = 1800) -> Optional[str]:
    """
    Executes fast inference via Groq LLM API with fallback models.
    """
    groq_key = api_key or settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
    if not groq_key:
        return None

    try:
        from groq import Groq
        client = Groq(api_key=groq_key)
        
        models_to_try = [
            settings.GROQ_MODEL or "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
            "groq/compound"
        ]

        for model_name in models_to_try:
            try:
                response = client.chat.completions.create(
                    messages=messages,
                    model=model_name,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                if response.choices and len(response.choices) > 0:
                    content = response.choices[0].message.content
                    if content and content.strip():
                        return content.strip()
            except Exception as model_err:
                print(f"[Groq LLM Model {model_name} Error]: {model_err}")
                continue

    except Exception as e:
        print(f"[Groq LLM Client Error]: {e}")

    return None

def classify_intent_semantic(query: str, history: list = None, lang_info: dict = None) -> str:
    """
    Language-independent semantic intent classifier with misspelling tolerance.
    Categorizes any user message across all languages into:
    - GREETING / CASUAL
    - INVENTION_START_NEEDS_INFO
    - INVENTION_EVALUATION
    - KNOWLEDGE_QUERY
    """
    q_clean = query.strip()
    q_lower = q_clean.lower()
    history = history or []

    # 1. Normalize text for greetings/casual chat (matches "helo", "helloo", "hii", "heyy", etc.)
    q_normalized = re.sub(r'[^\w\s]', '', q_lower).strip()
    words = q_normalized.split()

    # Regex matching English / European greeting typos and slang
    greeting_pattern = (
        r'^(hi+|he+l+o+|he+y+|hlo|hlw|greetings|howdy|good\s*(morning|afternoon|evening|day)|'
        r'thanks|thank\s*you|thx|thanx|ok|okay|yes|yeah|yep|no|nope|bye|goodbye|cya|sup|yo|'
        r'who\s+are\s+you|what\s+can\s+you\s+do)(\s|$)'
    )

    is_greeting = False
    if re.match(greeting_pattern, q_normalized):
        if len(words) <= 5:
            is_greeting = True
    elif q_normalized in COMMON_SHORT_GREETINGS_CASUAL and len(words) <= 4:
        is_greeting = True
    elif q_clean in {"வணக்கம்", "नमस्ते", "안녕하세요", "안녕", "مرحبا", "سلام", "Bonjour", "Hola", "Hallo", "Ciao"}:
        is_greeting = True

    if is_greeting:
        return "GREETING"

    # 2. Check for invention intent across languages
    invention_regex = (
        r'\b(i have|i got|i made|we have|we developed|developed a|created a|invented a|naan|oru|mujhe|humne|j\'ai|he desarrollado|طورت|اخترعت|ابتكرت)\s+.*'
        r'(invention|formulation|medicine|drug|product|device|system|process|method|idea|kandupidipu|aavishkar|invención|اختراع|ابتكار)\b|'
        r'\b(can|could|would|will|mudiyuma|kidaikuma|sakta|pouvez-vous|puede|هل يمكن)\s+.*(examine|check|evaluate|review|inspect|verify|analyze|assess|patent|examiner|examinar|فحص|تقييم)\b|'
        r'\b(patent|patente|brevet|பிரிவு|पेटेंट|बراءة)\s+.*(for my|apply|karna|panna|obtenir|solicitar|الحصول)\b'
    )
    invention_keywords = [
        "invention", "kandupidipu", "kandupudipu", "கண்டுபிடி", "aavishkar", "आविष्कार",
        "invención", "brevet", "اختراع", "ابتكار", "kandupudichu", "patent", "patente", "पेटेंट",
        "발명", "특허", "새로운 발명", "신약", "개발"
    ]

    has_invention_intent = bool(re.search(invention_regex, q_lower)) or any(k in q_lower for k in invention_keywords)

    # Specific technical delivery, ratio, or process markers required for full evaluation
    specific_technical_markers = [
        "snedds", "nano-emulsion", "nanoemulsion", "nanoparticle", "liposome", "hydrogel",
        "supercritical", "co2", "fractionation", "shodhana", "distillation", "photoplethysmography",
        "ppg", "sensor", "electrode", "piezoelectric", "algorithm", "neural network", "95%", "90%",
        "ratio", "combination of", "combined with", "combining", "synergistic index", "combination index",
        # Multilingual markers
        "நானோ", "விகிதம்", "இணைத்து", "சாற்றை இணைக்கும்", "अनुपात", "संयोजन", "나노", "배합", "결합하여"
    ]

    word_count = len(q_clean.split())
    has_specific_details = (
        (any(m in q_lower for m in specific_technical_markers) and (word_count >= 12 or any(k in q_lower for k in ["snedds", "nano", "supercritical", "ppg", "95%", "ratio", "நானோ", "나노"])))
        or word_count >= 25
    )

    if has_invention_intent and not has_specific_details:
        return "INVENTION_START_NEEDS_INFO"

    # 3. Check conversation history continuity
    is_continuing_invention = False
    if history:
        for h in reversed(history[-4:]):
            prev_content = h.get("content", "").lower()
            if h.get("role") == "assistant":
                if any(k in prev_content for k in [
                    "describe your invention", "invention details", "what problem it solves",
                    "key ingredients", "components", "technical mechanism", "விவரிக்கவும்",
                    "विवरण", "détails", "detalles", "تفاصيل", "발명"
                ]):
                    is_continuing_invention = True
                    break

    if has_specific_details or (is_continuing_invention and word_count > 3):
        # Conceptual knowledge questions
        if q_lower.startswith(("what is", "explain", "define", "what are the rules", "how does tkdl", "what does section", "என்ன", "क्या है", "qu'est-ce", "qué es", "ما هو", "무엇")):
            if not any(k in q_lower for k in ["my invention", "our formulation", "we developed", "i developed", "naan", "mujhe", "mon invention"]):
                return "KNOWLEDGE_QUERY"
        return "INVENTION_EVALUATION"

    if has_invention_intent:
        return "INVENTION_START_NEEDS_INFO"

    return "KNOWLEDGE_QUERY"

def search_knowledge_documents(query: str, limit: int = 4) -> list:
    """
    Retrieves semantic document vectors from ChromaDB for knowledge queries.
    """
    exact_query = query.strip()
    if not exact_query:
        return []

    print(f"\n[RAG Pipeline] Knowledge Query: \"{exact_query}\"")
    chroma_matches = search_chroma_documents(exact_query, limit=limit)
    if chroma_matches:
        print(f"[RAG Pipeline] ChromaDB Matches ({len(chroma_matches)}): {[d.get('question') for d in chroma_matches]}")
        return chroma_matches

    # Keyword fallback for statutory terms
    q_lower = exact_query.lower()
    statutory_keywords = {
        "section 3", "3(p)", "3(e)", "3(d)", "3(k)", "3(j)", "3(i)", "tkdl", "nba", "form iii", "pct",
        "section 39", "biopiracy", "schedule t", "gmp", "trademark", "trade secret", "synergism", "prior art"
    }

    if any(k in q_lower for k in statutory_keywords):
        matched = []
        for item in DYNAMIC_KNOWLEDGE_STORE:
            text = f"{item['question']} {item['answer']} {item['category']} {item['citation']}".lower()
            if any(k in text for k in statutory_keywords if k in q_lower):
                matched.append(item)
        if matched:
            print(f"[RAG Pipeline] Keyword Fallback Matches: {len(matched)}")
            return matched[:limit]

    return []

def extract_structured_invention_features(invention_text: str, history: list = None, api_key: str = None) -> dict:
    """
    Multilingual Dynamic Feature Extractor:
    Parses user invention in ANY language and maps concepts into canonical/English terms for ChromaDB retrieval facets.
    """
    system_prompt = (
        "You are an expert Multilingual Patent Analyst & Technical Classifier for AYUTH.\n"
        "Analyze the user's invention description, which may be in any language.\n"
        "1. Understand the core invention concept regardless of language.\n"
        "2. Formulate 4 to 6 targeted retrieval queries IN ENGLISH for searching the Indian Patents Act and TKDL statutory knowledge base in ChromaDB.\n\n"
        "Return ONLY a valid JSON object matching this schema without markdown code blocks:\n"
        "{\n"
        '  "invention_type": "Medicine/Formulation | Medical Device/Hardware | Manufacturing/Extraction Process | Software/AI Technology | General Invention",\n'
        '  "title": "Short descriptive title in English",\n'
        '  "intended_use_or_problem": "Problem solved or target application",\n'
        '  "core_components": ["component 1", "component 2", ...],\n'
        '  "core_mechanism_or_steps": "Technical mechanism, delivery vehicle, or process parameters",\n'
        '  "claimed_novelty": "Specific technical novelty claim or differentiator",\n'
        '  "has_sufficient_details": true,\n'
        '  "retrieval_queries": [\n'
        '    "query in English for individual active constituent or component 1",\n'
        '    "query in English for individual constituent 2 or structure",\n'
        '    "query in English for component combination and intended therapeutic/technical effect",\n'
        '    "query in English for delivery matrix or process parameters",\n'
        '    "query in English for applicable statutory sections (Section 3p, Section 3e synergism, Section 3d, Section 3i, Section 3k, Section 6 NBA)"\n'
        '  ]\n'
        "}"
    )

    combined_context = ""
    if history:
        for h in history[-3:]:
            role = h.get("role", "user")
            content = h.get("content", "").strip()
            if content:
                combined_context += f"{role.upper()}: {content}\n"
    combined_context += f"USER INVENTION DISCLOSURE:\n{invention_text}"

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": combined_context}
    ]

    llm_json_str = call_groq_llm(messages, api_key=api_key, temperature=0.1, max_tokens=1200)

    if llm_json_str:
        try:
            json_match = re.search(r'\{[\s\S]*\}', llm_json_str.strip())
            if json_match:
                parsed = json.loads(json_match.group(0))
                if isinstance(parsed, dict) and "retrieval_queries" in parsed:
                    return parsed
        except Exception as e:
            print(f"[Multilingual Feature Extraction JSON Parse Warning]: {e}")

    # Fallback
    return {
        "invention_type": "General Invention",
        "title": "User Invention Submission",
        "intended_use_or_problem": "Specified application in user description",
        "core_components": ["Active components / technology disclosed by user"],
        "core_mechanism_or_steps": "Described mechanism and technical parameters",
        "claimed_novelty": "Novel formulation / structural advancement",
        "has_sufficient_details": True,
        "retrieval_queries": [
            "Section 3(p) Traditional Knowledge Digital Library TKDL",
            "Section 3(e) synergistic polyherbal admixture combination index",
            "Section 6 Biological Diversity Act NBA Form III approval",
            "Section 3(d) therapeutic efficacy enhanced botanical extract",
            "Ayurvedic patent eligibility examination guidelines 2012"
        ]
    }

def search_comparison_evidence(extracted_features: dict, user_text: str, limit: int = 6) -> list:
    """
    Executes targeted multi-facet queries against ChromaDB for feature-by-feature comparison.
    """
    queries = extracted_features.get("retrieval_queries", [])
    if not queries:
        queries = [
            "Section 3(p) Traditional Knowledge TKDL",
            "Section 3(e) synergistic admixture",
            "Section 6 Biological Diversity Act Form III"
        ]

    print(f"[Comparison Engine] Executing {len(queries)} targeted search facets across ChromaDB...")
    matches = search_chroma_multi(queries, limit=limit)
    print(f"[Comparison Engine] Retrieved {len(matches)} relevant comparison evidence documents from ChromaDB.")
    return matches

def generate_agent_response(
    query: str,
    history: list = None,
    invention_profile: dict = None,
    language: str = "en",
    api_key: str = None,
    document_text: str = None,
    session_id: str = None
) -> dict:
    """
    AYUTH Multilingual & Dynamic Comparison Engine:
    Strict Decision Hierarchy:
    1. UI Selected Language & Session State
    2. Fast Intent Router: GREETING & CASUAL CHAT NEVER CALL RAG (rag_used=False, sources=[])
    3. Multi-turn Repeated Greeting tracking
    4. RAG called ONLY on Invention Evaluation and Knowledge Queries
    """
    raw_query = query.strip()
    history = history or []
    s_id = session_id or "default_session"
    session = get_or_create_session(s_id)

    # Normalize incoming selected language from UI dropdown
    selected_ui_lang = (language or "en").strip()
    if selected_ui_lang == "auto":
        selected_ui_lang = "en"

    # Step 1: Determine Language Hierarchy
    prev_lang = session.get("detected_language")
    lang_info = determine_language_hierarchy(
        raw_text=raw_query,
        selected_language=selected_ui_lang,
        previous_language=prev_lang,
        history=history
    )

    detected_lang_name = lang_info.get("language_name", "English")
    detected_lang_code = lang_info.get("detected_language", "en")
    is_code_mixed = lang_info.get("is_code_mixed", False)

    # Step 2: Language-Independent Semantic Intent Classification
    intent = classify_intent_semantic(raw_query, history=history, lang_info=lang_info)

    # Step 3: Update Session State
    session = update_session_state(s_id, lang_info, intent, selected_lang=selected_ui_lang)
    repeated_count = session.get("repeated_intent_count", 1)

    print(f"\n[AYUTH Engine] User Query: \"{raw_query[:70]}\" | UI Selected: {selected_ui_lang}")
    print(f"  -> Detected Language: {detected_lang_name} ({detected_lang_code}) | Confidence: {lang_info.get('confidence')}")
    print(f"  -> Semantic Intent: {intent} | Repeated Count: {repeated_count}")

    # Merge document text if supplied
    if document_text and document_text.strip():
        full_invention_input = f"{raw_query}\n\n[ATTACHED INVENTION DOCUMENT TEXT]:\n{document_text.strip()}"
    else:
        full_invention_input = raw_query

    # Language Instruction snippet for LLM prompts
    lang_instruction = (
        f"=== TARGET RESPONSE LANGUAGE: {detected_lang_name} (Code: {detected_lang_code}) ===\n"
        f"MANDATORY INSTRUCTION: You MUST generate your ENTIRE response fluently, naturally, and professionally in {detected_lang_name}.\n"
        f"- If the user wrote in English (or selected English for short greetings like 'helo'/'hi'), respond fully in English.\n"
        f"- If the user wrote in Tamil (தமிழ்), respond fully in Tamil.\n"
        f"- If the user wrote in Hindi (हिंदी), respond fully in Hindi.\n"
        f"- If the user wrote in French (Français), respond fully in French.\n"
        f"- If the user wrote in Spanish (Español), respond fully in Spanish.\n"
        f"- If the user wrote in Arabic (العربية), respond fully in Arabic.\n"
        f"- If the user wrote in Korean (한국어), respond fully in Korean.\n"
        f"- If the user wrote in Code-Mixed text (e.g. Tanglish / Hinglish), respond in matching conversational style.\n"
        f"- Translate all headings, tables, labels, and disclaimers into {detected_lang_name} naturally."
    )

    # =========================================================================
    # FLOW 1: GREETING & CASUAL CHAT (NO RAG, rag_used=False, sources=[])
    # =========================================================================
    if intent == "GREETING":
        print("[AYUTH Engine] Routing to GREETING flow. ChromaDB search is BYPASSED (rag_used=False).")
        if repeated_count > 1:
            greeting_guidance = (
                f"The user has greeted you multiple consecutive times ({repeated_count} times) or switched greeting language.\n"
                f"Acknowledge their greeting warmly in {detected_lang_name} and politely invite them to share their specific invention, medicine formula, device, or patent question."
            )
        else:
            greeting_guidance = (
                f"Provide a warm, concise, professional greeting in {detected_lang_name}.\n"
                f"Introduce yourself as AYUTH, the AI Intellectual Property and Regulatory Assistant for Ayurveda, Traditional Knowledge, and Patent Regulations.\n"
                f"Invite them to share their invention (medicine, device, process, software) for a preliminary patentability evaluation or ask any statutory patent question."
            )

        llm_messages = [
            {
                "role": "system",
                "content": f"{lang_instruction}\n\n{greeting_guidance}"
            },
            {"role": "user", "content": raw_query}
        ]
        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=400)
        
        if not llm_reply:
            if detected_lang_code == "ta":
                llm_reply = "வணக்கம்! நான் **AYUTH**, ஆயுர்வேத அறிவுசார் சொத்துரிமை மற்றும் காப்புரிமை உதவிக்கான AI உதவியாளர். உங்கள் கண்டுபிடிப்பு அல்லது காப்புரிமை விதிகள் பற்றி எவ்வாறு உதவ முடியும்?"
            elif detected_lang_code == "hi":
                llm_reply = "नमस्ते! मैं **AYUTH** हूँ, आयुर्वेद बौद्धिक संपदा और पेटेंट नियमों के लिए आपका AI सहायक। मैं आपकी क्या सहायता कर सकता हूँ?"
            elif detected_lang_code == "fr":
                llm_reply = "Bonjour ! Je suis **AYUTH**, votre assistant IA spécialisé en propriété intellectuelle ayurvédique et réglementations des brevets. Comment puis-je vous aider aujourd'hui ?"
            elif detected_lang_code == "es":
                llm_reply = "¡Hola! Soy **AYUTH**, su asistente de IA especializado en propiedad intelectual ayurvédica y normativa de patentes. ¿Cómo puedo ayudarle hoy?"
            elif detected_lang_code == "ar":
                llm_reply = "مرحبًا! أنا **AYUTH**، مساعدك الذكي المتخصص في الملكية الفكرية للأيورفيدا وقوانين براءات الاختراع. كيف يمكنني مساعدتك اليوم؟"
            elif detected_lang_code == "ko":
                llm_reply = "안녕하세요! 저는 아유르베다 지식재산권 및 특허 규제 AI 어시스턴트인 **AYUTH**입니다. 귀하의 발명이나 특허 규정에 대해 무엇을 도와드릴까요?"
            else:
                llm_reply = "Hello! I am **AYUTH**, your AI-powered Intellectual Property and Regulatory Assistant for Ayurveda, Traditional Knowledge, and Patent Regulations. How can I help you today?"

        return {
            "status": "success",
            "answer": llm_reply,
            "language": detected_lang_code,
            "intent": "GREETING",
            "rag_used": False,
            "sources": [],
            "proof_documents": [],
            "citations": [],
            "found": True,
            "language_info": {
                "selected_language": selected_ui_lang,
                "detected_language": detected_lang_code,
                "response_language": detected_lang_code,
                "language_name": detected_lang_name,
                "confidence": lang_info.get("confidence", 1.0),
                "is_code_mixed": is_code_mixed,
            },
            "session_state": {
                "session_id": s_id,
                "current_intent": session["current_intent"],
                "repeated_intent_count": session["repeated_intent_count"]
            }
        }

    # =========================================================================
    # FLOW 2: INVENTION ANALYSIS REQUEST (DETAILS MISSING) - NO RAG
    # =========================================================================
    if intent == "INVENTION_START_NEEDS_INFO":
        print("[AYUTH Engine] Routing to INVENTION_START_NEEDS_INFO flow. ChromaDB search is BYPASSED (rag_used=False).")
        system_prompt = f"""{lang_instruction}

You are AYUTH, an AI Intellectual Property and Regulatory Assistant.
The user wants you to evaluate an invention for patentability, but has not yet provided the specific technical details.

Respond warmly in {detected_lang_name}. Acknowledge that you evaluate medicine formulas, medical devices, manufacturing/extraction processes, and software technologies by comparing them against existing knowledge and statutory patent standards.

Dynamically ask the user to provide:
1. What the invention is and the specific problem it solves
2. Invention category (Medicine formula, Medical device, Manufacturing process, Software/AI, or Product)
3. Key ingredients, components, structural elements, process steps, or algorithmic approach
4. How it works or technical mechanism / delivery method
5. What makes it novel or different from classical Ayurvedic texts and commercial products
6. Experimental or synergy data / test results (if available)

Do NOT use a hardcoded generic template. Generate natural, encouraging clarification questions in {detected_lang_name}."""

        llm_messages = [{"role": "system", "content": system_prompt}]
        for h in history[-4:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            content = h.get("content", "").strip()
            if content:
                llm_messages.append({"role": role, "content": content})
        llm_messages.append({"role": "user", "content": raw_query})

        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=700)
        if not llm_reply:
            if detected_lang_code == "ta":
                llm_reply = "உங்கள் கண்டுபிடிப்பை ஆய்வு செய்து காப்புரிமை மதிப்பீட்டை வழங்க தயாராக உள்ளேன்!\n\nதயவுசெய்து பின்வரும் விவரங்களைப் பகிரவும்:\n• கண்டுபிடிப்பின் நோக்கம் மற்றும் தீர்க்கும் பிரச்சனை\n• பயன்படுத்தப்படும் முக்கிய மூலிகைகள், பொருட்கள் அல்லது தொழில்நுட்பம்\n• இது எவ்வாறு செயல்படுகிறது (தொழில்நுட்ப வழிமுறை)\n• பாரம்பரிய நூல்களிலிருந்து இது எவ்வாறு வேறுபடுகிறது"
            elif detected_lang_code == "hi":
                llm_reply = "मैं आपके आविष्कार का मूल्यांकन करने के लिए तैयार हूँ!\n\nकृपया निम्नलिखित विवरण साझा करें:\n• आविष्कार का उद्देश्य और समाधान\n• मुख्य सामग्री, घटक या तकनीक\n• यह कैसे काम करता है (तकनीकी तंत्र)\n• पारंपरिक ज्ञान से यह कैसे अलग और नया है"
            elif detected_lang_code == "ko":
                llm_reply = "귀하의 발명을 검토하여 예비 특허성 평가를 제공할 준비가 되어 있습니다!\n\n다음 세부 정보를 알려주세요:\n• 발명의 명칭 및 해결하려는 구체적인 과제\n• 주요 성분, 부품 또는 공정 단계\n• 기술적 작동 메커니즘 또는 약물 전달 방식\n• 기존 전통 지식 및 시판 제품과의 차별점 및 신규성"
            else:
                llm_reply = "I would be glad to evaluate your invention and perform a preliminary patentability comparison against existing knowledge base records!\n\nPlease share:\n• What the invention is & the problem it solves\n• Key ingredients, components, or steps\n• How it works / technical mechanism\n• What makes it novel or different from classical texts"

        return {
            "status": "success",
            "answer": llm_reply,
            "language": detected_lang_code,
            "intent": "INVENTION_START_NEEDS_INFO",
            "rag_used": False,
            "sources": [],
            "proof_documents": [],
            "citations": [],
            "found": True,
            "language_info": {
                "selected_language": selected_ui_lang,
                "detected_language": detected_lang_code,
                "response_language": detected_lang_code,
                "language_name": detected_lang_name,
                "confidence": lang_info.get("confidence", 1.0),
                "is_code_mixed": is_code_mixed,
            },
            "session_state": {
                "session_id": s_id,
                "current_intent": session["current_intent"],
                "repeated_intent_count": session["repeated_intent_count"]
            }
        }

    # =========================================================================
    # FLOW 3: INVENTION FEATURE EXTRACTION & COMPARISON ENGINE (RAG ACTIVE)
    # =========================================================================
    if intent == "INVENTION_EVALUATION":
        print("[AYUTH Engine] Routing to INVENTION_EVALUATION flow. Triggering ChromaDB multi-facet RAG.")
        extracted = extract_structured_invention_features(full_invention_input, history=history, api_key=api_key)
        retrieved_docs = search_comparison_evidence(extracted, full_invention_input, limit=settings.TOP_K or 6)

        evidence_str = ""
        if retrieved_docs:
            evidence_str = "\n\n".join([
                f"[Evidence Document {i+1}]: {d.get('question')}\nContent: {d.get('answer')}\nCitation: {d.get('citation')}\nCategory: {d.get('category')}"
                for i, d in enumerate(retrieved_docs)
            ])
        else:
            evidence_str = "No directly matching comparison documents found in the current searched knowledge base."

        features_summary = (
            f"- **Invention Type**: {extracted.get('invention_type', 'General')}\n"
            f"- **Title/Concept**: {extracted.get('title', 'User Submission')}\n"
            f"- **Intended Use / Problem**: {extracted.get('intended_use_or_problem', 'N/A')}\n"
            f"- **Core Components / Ingredients / Steps**: {', '.join(extracted.get('core_components', []))}\n"
            f"- **Mechanism / Delivery / Operation**: {extracted.get('core_mechanism_or_steps', 'N/A')}\n"
            f"- **Claimed Novelty**: {extracted.get('claimed_novelty', 'N/A')}"
        )

        system_prompt = f"""{lang_instruction}

You are AYUTH, an AI Intellectual Property and Regulatory Comparison Engine.

YOUR ROLE:
You evaluate a USER'S INVENTION (the PRIMARY INPUT) by comparing it against EXISTING KNOWLEDGE AND STATUTORY EVIDENCE (the COMPARISON EVIDENCE).

=== USER INVENTION STRUCTURED FEATURES ===
{features_summary}

=== RETRIEVED KNOWLEDGE BASE COMPARISON EVIDENCE ===
{evidence_str}

=== CRITICAL EVALUATION RULES ===
1. The user's invention is the primary input. Compare the USER'S INVENTION FEATURES vs. FEATURES FOUND IN RETRIEVED EVIDENCE.
2. Identify:
   - Features already known in the retrieved evidence / classical references.
   - Features partially similar.
   - Features not found in the currently searched knowledge base.
   - Possible novel combinations or technical contributions.
   - Traditional knowledge conflicts (Section 3(p)) or prior art conflicts.
   - Missing experimental or comparative data.
3. IMPORTANT: Absence of a document in ChromaDB does NOT prove absolute universal novelty. Always state:
   "Not found in the currently searched knowledge base" (in {detected_lang_name}) rather than asserting definite novelty.
4. Structure your response using the 10 numbered Markdown sections translated into {detected_lang_name}:
   1. Invention Summary
   2. Extracted Key Features
   3. Similar Existing Knowledge
   4. Feature-by-Feature Comparison (Must include a Markdown Table)
   5. Potential Novel Features
   6. Prior Art Risks
   7. Traditional Knowledge / Statutory Exclusions (Section 3(p), 3(e), 3(d), 3(i), 3(k), NBA Form III)
   8. Patentability Considerations
   9. Evidence and Sources
   10. Recommended Next Steps
5. End with the mandatory legal disclaimer in {detected_lang_name}:
   > **Disclaimer**: This is a preliminary AI-assisted patentability assessment for research and informational purposes only and does not constitute a formal legal opinion or grant/approval of a patent."""

        llm_messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            content = h.get("content", "").strip()
            if content:
                llm_messages.append({"role": role, "content": content})
        llm_messages.append({"role": "user", "content": f"Please evaluate and compare this invention against existing knowledge evidence:\n{full_invention_input}"})

        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=2200)

        if not llm_reply:
            citations_list = [d.get("citation") for d in retrieved_docs if d.get("citation")]
            llm_reply = (
                f"## 1. Invention Summary\n"
                f"The submitted invention relates to a **{extracted.get('invention_type', 'Technical Invention')}**: *{extracted.get('title', 'Invention Submission')}* designed for {extracted.get('intended_use_or_problem', 'targeted technical/therapeutic application')}.\n\n"
                f"## 2. Extracted Key Features\n"
                + "\n".join([f"• {c}" for c in extracted.get("core_components", ["Core technical features"])]) + "\n"
                f"• Technical mechanism/delivery: {extracted.get('core_mechanism_or_steps', 'Standard operational parameters')}\n\n"
                f"## 3. Similar Existing Knowledge\n"
                f"The retrieved knowledge base documents document classical Ayurvedic prior art and statutory patent rules under the Indian Patents Act, 1970.\n\n"
                f"## 4. Feature-by-Feature Comparison\n"
                f"| User Invention Feature | Existing Evidence in Knowledge Base | Comparison Status | Novelty & Risk Impact |\n"
                f"| :--- | :--- | :--- | :--- |\n"
                f"| Active Components / Materials | Classical formulation references in TKDL | Partially Similar | High Section 3(p) risk if known |\n"
                f"| Formulation / Technical Delivery | Advanced carrier / process matrix | Not Found in searched KB | Potential point of novelty |\n"
                f"| Claimed Synergism / Technical Effect | Requires quantitative experimental validation | Evidence Required | Section 3(e) synergism data mandatory |\n\n"
                f"## 5. Potential Novel Features\n"
                f"The specific combination ratio, processing parameters, and delivery matrix are **not found in the currently searched knowledge base**.\n\n"
                f"## 6. Prior Art Risks\n"
                f"Individual active constituents are heavily documented in classical texts (Charaka & Sushruta Samhita) and TKDL records.\n\n"
                f"## 7. Traditional Knowledge / Statutory Exclusions\n"
                f"• **Section 3(p)**: Inventions based on known traditional properties are barred unless substantial technical advancement is proven.\n"
                f"• **Section 3(e)**: Admixtures must demonstrate quantitative synergism (Combination Index < 0.8).\n"
                f"• **Biological Diversity Act (Section 6)**: Mandatory Form III approval from National Biodiversity Authority (NBA) for Indian biological resources.\n\n"
                f"## 8. Patentability Considerations\n"
                f"Patentability hinges on establishing a non-obvious inventive step through verified comparative experimental data.\n\n"
                f"## 9. Evidence and Sources\n"
                + "\n".join([f"• {c}" for c in citations_list[:4]]) + "\n\n"
                f"## 10. Recommended Next Steps\n"
                f"1. Conduct exhaustive global prior art and TKDL search.\n"
                f"2. Perform in-vitro/in-vivo synergism and bio-efficacy assays.\n"
                f"3. Submit Form III application to NBA.\n"
                f"4. File a provisional patent application prior to any public disclosure.\n"
            )

        if "disclaimer" not in llm_reply.lower() and "legal opinion" not in llm_reply.lower():
            llm_reply += f"\n\n---\n> **Disclaimer**: This is a preliminary AI-assisted patentability assessment for research and informational purposes only and does not constitute a formal legal opinion or replace advice from a registered Patent Agent or Attorney. AYUTH does not grant or approve patents."

        citations = [d.get("citation") for d in retrieved_docs if d.get("citation")]
        return {
            "status": "success",
            "answer": llm_reply,
            "language": detected_lang_code,
            "intent": "INVENTION_EVALUATION",
            "rag_used": True if len(retrieved_docs) > 0 else False,
            "sources": retrieved_docs,
            "proof_documents": retrieved_docs,
            "citations": citations,
            "found": True,
            "language_info": {
                "selected_language": selected_ui_lang,
                "detected_language": detected_lang_code,
                "response_language": detected_lang_code,
                "language_name": detected_lang_name,
                "confidence": lang_info.get("confidence", 1.0),
                "is_code_mixed": is_code_mixed,
            },
            "session_state": {
                "session_id": s_id,
                "current_intent": session["current_intent"],
                "repeated_intent_count": session["repeated_intent_count"]
            }
        }

    # =========================================================================
    # FLOW 4: KNOWLEDGE QUESTION (GROUNDED RAG SEARCH IN USER LANGUAGE)
    # =========================================================================
    print("[AYUTH Engine] Routing to KNOWLEDGE_QUERY flow. Triggering ChromaDB statutory RAG.")
    rag_search_query = raw_query
    if detected_lang_code != "en" and not is_code_mixed:
        translate_messages = [
            {"role": "system", "content": "Extract the statutory patent concept or legal question in English (e.g. 'What is Section 3(p)?', 'When is NBA Form III required?'). Output ONLY the English query."},
            {"role": "user", "content": raw_query}
        ]
        translated = call_groq_llm(translate_messages, api_key=api_key, max_tokens=100)
        if translated and len(translated.strip()) > 3:
            rag_search_query = translated.strip()

    knowledge_matches = search_knowledge_documents(rag_search_query, limit=settings.TOP_K or 4)
    has_matches = knowledge_matches and len(knowledge_matches) > 0

    if not has_matches:
        not_found_msg = f"I don't have enough relevant information in the current knowledge base to answer this accurately."
        if detected_lang_code == "ta":
            not_found_msg = "தற்போதைய அறிவுத் தளத்தில் இதற்கு துல்லியமாக பதிலளிக்க போதுமான சரிபார்க்கப்பட்ட தகவல்கள் இல்லை."
        elif detected_lang_code == "hi":
            not_found_msg = "वर्तमान ज्ञानकोष में इसका सटीक उत्तर देने के लिए पर्याप्त सत्यापित जानकारी उपलब्ध नहीं है।"
        elif detected_lang_code == "fr":
            not_found_msg = "Je ne dispose pas de suffisamment d'informations vérifiées dans la base de connaissances actuelle pour répondre précisément."
        elif detected_lang_code == "es":
            not_found_msg = "No dispongo de suficiente información verificada en la base de conocimientos actual para responder con precisión."
        elif detected_lang_code == "ar":
            not_found_msg = "لا تتوفر لدي معلومات موثقة كافية في قاعدة المعرفة الحالية للإجابة على هذا السؤال بدقة."
        elif detected_lang_code == "ko":
            not_found_msg = "현재 지식베이스에 해당 질문에 정확하게 답변할 수 있는 충분한 검증 정보가 없습니다."

        return {
            "status": "not_found",
            "answer": not_found_msg,
            "language": detected_lang_code,
            "intent": "KNOWLEDGE_QUERY",
            "rag_used": False,
            "sources": [],
            "proof_documents": [],
            "citations": [],
            "found": False,
            "language_info": {
                "selected_language": selected_ui_lang,
                "detected_language": detected_lang_code,
                "response_language": detected_lang_code,
                "language_name": detected_lang_name,
                "confidence": lang_info.get("confidence", 1.0),
                "is_code_mixed": is_code_mixed,
            },
            "session_state": {
                "session_id": s_id,
                "current_intent": session["current_intent"],
                "repeated_intent_count": session["repeated_intent_count"]
            }
        }

    context_str = "\n\n".join([
        f"[Source {i+1}]: {d.get('question')}\nContent: {d.get('answer')}\nCitation: {d.get('citation')}"
        for i, d in enumerate(knowledge_matches)
    ])

    system_prompt = f"""{lang_instruction}

You are AYUTH, an AI Intellectual Property and Regulatory Assistant.

Answer the user's question directly, clearly, and concisely in {detected_lang_name} based on the RETRIEVED CHROMADB STATUTORY CONTEXT below:
=== RETRIEVED STATUTORY CONTEXT ===
{context_str}

INSTRUCTIONS:
1. Ground your answer strictly in the provided statutory context and cite relevant Sections, acts, and guidelines.
2. If the context does not contain enough relevant information, state in {detected_lang_name} that the current knowledge base does not contain sufficient verified information.
3. Keep the tone authoritative, concise, and professional in {detected_lang_name}."""

    llm_messages = [{"role": "system", "content": system_prompt}]
    for h in history[-4:]:
        role = "assistant" if h.get("role") == "assistant" else "user"
        content = h.get("content", "").strip()
        if content:
            llm_messages.append({"role": role, "content": content})
    llm_messages.append({"role": "user", "content": raw_query})

    llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=800)

    if not llm_reply:
        top_match = knowledge_matches[0]
        llm_reply = f"{top_match.get('answer')}\n\n**Statutory Citation**: {top_match.get('citation', 'Indian Patents Act, 1970')}"

    return {
        "status": "success",
        "answer": llm_reply,
        "language": detected_lang_code,
        "intent": "KNOWLEDGE_QUERY",
        "rag_used": True,
        "sources": knowledge_matches,
        "proof_documents": knowledge_matches,
        "citations": [d.get("citation") for d in knowledge_matches if d.get("citation")],
        "found": True,
        "language_info": {
            "selected_language": selected_ui_lang,
            "detected_language": detected_lang_code,
            "response_language": detected_lang_code,
            "language_name": detected_lang_name,
            "confidence": lang_info.get("confidence", 1.0),
            "is_code_mixed": is_code_mixed,
        },
        "session_state": {
            "session_id": s_id,
            "current_intent": session["current_intent"],
            "repeated_intent_count": session["repeated_intent_count"]
        }
    }
