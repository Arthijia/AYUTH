"""
AYUTH Autonomous Cognitive AI Assistant & Semantic RAG Comparison Engine
Evaluates User Inventions (Formulas, Devices, Processes, Software/Technologies)
against Existing Knowledge and Evidence.
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
from services.chroma_service import (
    search_chroma_documents,
    search_chroma_multi,
    add_document_to_chroma,
    get_chroma_collection
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

def call_groq_llm(messages: list, api_key: str = None, temperature: float = 0.2, max_tokens: int = 1800) -> str:
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

def classify_intent(query: str, history: list = None) -> str:
    """
    Classifies user message into:
    - GREETING
    - INVENTION_START_NEEDS_INFO (User wants invention checked/examined but gave no details yet)
    - INVENTION_EVALUATION (User provided invention details or continuing an analysis)
    - KNOWLEDGE_QUERY (Statutory / legal / TKDL questions)
    """
    q_clean = query.strip()
    q_lower = q_clean.lower()
    history = history or []

    # 1. Greeting Check
    if re.match(r'^(hi|hello|hey|namaste|vanakkam|pranam|greetings|who are you|good morning|good afternoon|good evening)(\s|[!?,.]|$)', q_lower):
        if len(q_clean.split()) <= 4:
            return "GREETING"

    # 2. Check if user is starting an invention inquiry without sufficient details
    # Matches patterns like:
    # "i have a/an/new invention", "could/can/would you examine (it/my invention)", "i need/want to get patent for my (new) ...", "is my ... patentable"
    is_invention_intent = bool(re.search(
        r'\b(i have|i got|i made|we have|we developed|developed a|created a|invented a)\s+(a\s+|an\s+|new\s+)?(invention|formulation|medicine|drug|product|device|system|process|method|idea)\b|'
        r'\b(can|could|would|will)\s+you\s+(examine|check|evaluate|review|inspect|verify|analyze|assess)\s+(it|this|my|our)\b|'
        r'\b(examine|check|evaluate|review|analyze|assess|verify)\s+(my|this|our|the)\s+(invention|idea|formulation|formula|device|system|product|patentability)\b|'
        r'\b(is|can)\s+(my|our|this)\s+.*\bpatentable\b|'
        r'\b(i want|i need|how to|help me|want to|need to)\s+(to\s+)?(get\s+a\s+|file\s+a\s+|apply\s+for\s+a\s+)?patent\b|'
        r'\bpatent\s+(for\s+my|my\s+new|my\s+idea|my\s+invention|my\s+medicine|my\s+formulation)\b',
        q_lower
    ))

    detail_indicators = [
        "curcumin", "turmeric", "neem", "ashwagandha", "tulsi", "piperine", "herbal", "ayurvedic formulation",
        "wound healing", "extract", "formulation", "synerg", "combination of", "combines", "ratio",
        "nanoparticle", "nano-", "emulsion", "hydrogel", "capsule", "tablet", "dosage", "isolated",
        "compound", "process of preparing", "method of preparing", "mechanism", "in-vitro", "in-vivo",
        "composition comprising", "active ingredient", "botanical", "device", "sensor", "hardware",
        "pulse", "nadi", "algorithm", "software", "system comprising", "apparatus", "step 1", "step 2",
        "manufacturing", "temperature", "pressure", "circuit", "electrode", "supercritical", "co2", "distillation"
    ]

    has_details = any(detail in q_lower for detail in detail_indicators) or len(q_clean.split()) > 20

    if is_invention_intent and not has_details:
        return "INVENTION_START_NEEDS_INFO"

    # 3. Check if prior history was asking for invention details or if user is providing invention info
    is_continuing_invention = False
    if history:
        for h in reversed(history[-4:]):
            prev_content = h.get("content", "").lower()
            if h.get("role") == "assistant":
                if any(k in prev_content for k in [
                    "describe your invention", "what the invention is", "invention details",
                    "what problem it solves", "key ingredients", "components", "structure", "technical mechanism"
                ]):
                    is_continuing_invention = True
                    break

    if has_details or (is_continuing_invention and len(q_clean.split()) > 3):
        # Check if it's purely a conceptual/knowledge question like "What is Section 3(p)?"
        if q_lower.startswith(("what is", "explain", "define", "what are the rules", "how does tkdl", "what does section")) and not any(k in q_lower for k in ["my invention", "our formulation", "we developed", "i have developed", "our device", "our system"]):
            return "KNOWLEDGE_QUERY"
        return "INVENTION_EVALUATION"

    if is_invention_intent:
        return "INVENTION_START_NEEDS_INFO"

    # 4. Default to Knowledge Query
    return "KNOWLEDGE_QUERY"

def extract_structured_invention_features(invention_text: str, history: list = None, api_key: str = None) -> dict:
    """
    Dynamically extracts technical features and generates multi-facet retrieval queries
    for ANY invention type (medicine, device, process, software, material, product).
    """
    system_prompt = (
        "You are an expert Patent Analyst & Technical Classifier for AYUTH.\n"
        "Analyze the user's invention description (which could be a Medicine formula, Medical device, Manufacturing process, Software/AI system, or other technical invention).\n"
        "Extract its structured technical features and formulate targeted retrieval queries for ChromaDB prior art / traditional knowledge comparison.\n\n"
        "Return ONLY a valid JSON object matching this schema without markdown code blocks:\n"
        "{\n"
        '  "invention_type": "Medicine/Formulation | Medical Device/Hardware | Manufacturing/Extraction Process | Software/AI Technology | General Invention",\n'
        '  "title": "Short descriptive title",\n'
        '  "intended_use_or_problem": "Problem solved or target application",\n'
        '  "core_components": ["component/ingredient/module 1", "component 2", ...],\n'
        '  "core_mechanism_or_steps": "How it works, delivery vehicle, or process steps",\n'
        '  "claimed_novelty": "Specific technical novelty claim or differentiator",\n'
        '  "has_sufficient_details": true,\n'
        '  "retrieval_queries": [\n'
        '    "query for individual component 1 in traditional knowledge or prior art",\n'
        '    "query for individual component 2 in traditional knowledge or prior art",\n'
        '    "query for combination of components",\n'
        '    "query for formulation/mechanism/delivery system or hardware structure",\n'
        '    "query for applicable statutory rules (Section 3p, Section 3e synergism, Section 3d efficacy, Section 3k CRI, Section 3i diagnostic, Section 6 NBA)"\n'
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
    
    # Try parsing JSON
    if llm_json_str:
        try:
            # Clean possible markdown wrapping or extra thoughts
            json_match = re.search(r'\{[\s\S]*\}', llm_json_str.strip())
            if json_match:
                parsed = json.loads(json_match.group(0))
                if isinstance(parsed, dict) and "retrieval_queries" in parsed:
                    return parsed
        except Exception as e:
            print(f"[Feature Extraction JSON Parse Warning]: {e}")

    # Heuristic Fallback Extractor
    q_lower = invention_text.lower()
    inv_type = "General Invention"
    if any(k in q_lower for k in ["herb", "formulation", "extract", "turmeric", "neem", "curcumin", "ayurved", "medicine", "dosage", "synerg"]):
        inv_type = "Medicine/Formulation"
    elif any(k in q_lower for k in ["device", "sensor", "hardware", "pulse", "nadi", "electrode", "apparatus", "instrument"]):
        inv_type = "Medical Device/Hardware"
    elif any(k in q_lower for k in ["process", "method of preparing", "extraction", "supercritical", "shodhana", "distillation", "temperature", "fermentation"]):
        inv_type = "Manufacturing/Extraction Process"
    elif any(k in q_lower for k in ["ai", "algorithm", "software", "neural network", "image detection", "computer vision", "model"]):
        inv_type = "Software/AI Technology"

    # Generate heuristic queries
    words = [w for w in re.findall(r'\b[a-zA-Z]{3,}\b', q_lower) if w not in {"the", "and", "for", "with", "that", "this", "have", "new", "our", "are", "from"}]
    queries = [invention_text[:150]]
    if inv_type == "Medicine/Formulation":
        queries.extend([
            "Section 3(p) Traditional Knowledge Digital Library TKDL",
            "Section 3(e) synergistic polyherbal admixture combination index",
            "Section 6 Biological Diversity Act NBA Form III approval",
            "Section 3(d) therapeutic efficacy enhanced botanical extract"
        ])
    elif inv_type == "Medical Device/Hardware":
        queries.extend([
            "Ayurvedic medical devices diagnostic apparatus Section 3(i)",
            "Nadi Pariksha pulse sensor hardware transducer",
            "novel diagnostic apparatus vs medical treatment exclusion"
        ])
    elif inv_type == "Manufacturing/Extraction Process":
        queries.extend([
            "novel manufacturing extraction process Section 2(1)(j) Section 5",
            "botanical supercritical fluid extraction Shodhana process patent",
            "process parameters active phyto-fraction yield"
        ])
    elif inv_type == "Software/AI Technology":
        queries.extend([
            "Section 3(k) computer related inventions CRI technical effect",
            "AI algorithm hardware sensor integration diagnostics",
            "computer program per se vs patentable technical contribution"
        ])

    return {
        "invention_type": inv_type,
        "title": "User Invention Submission",
        "intended_use_or_problem": "Specified application in invention description",
        "core_components": words[:6],
        "core_mechanism_or_steps": "Described mechanism and technical parameters",
        "claimed_novelty": "Specific formulation / structural advancement",
        "has_sufficient_details": len(words) >= 4,
        "retrieval_queries": queries
    }

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
        "section 39", "biopiracy", "schedule t", "gmp", "trademark", "trade secret", "synergism", "prior art",
        "medical device", "nadi", "extraction", "ndds", "nanoparticle"
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

def search_comparison_evidence(extracted_features: dict, user_text: str, limit: int = 6) -> list:
    """
    Executes targeted multi-facet queries against ChromaDB for feature-by-feature comparison.
    """
    queries = extracted_features.get("retrieval_queries", [])
    if not queries:
        queries = [user_text]

    # Ensure the exact user text is included in retrieval facets
    if user_text not in queries:
        queries.insert(0, user_text)

    print(f"[Comparison Engine] Executing {len(queries)} targeted search facets across ChromaDB...")
    for idx, q in enumerate(queries):
        print(f"  Facet {idx+1}: {q}")

    matches = search_chroma_multi(queries, limit=limit)
    print(f"[Comparison Engine] Retrieved {len(matches)} relevant comparison evidence documents from ChromaDB.")
    return matches

def generate_agent_response(
    query: str,
    history: list = None,
    invention_profile: dict = None,
    language: str = "en",
    api_key: str = None,
    document_text: str = None
) -> dict:
    """
    AYUTH Invention Comparison & Autonomous RAG Engine:
    - Evaluates user's invention against existing knowledge evidence
    - Extracts structured invention features for ANY invention category
    - Decomposes invention into targeted multi-facet queries
    - Compares user features vs. retrieved evidence
    - Identifies known features, partial similarities, and potential novel aspects
    - Generates 10-Part Preliminary Patentability Assessment with Comparison Table
    """
    raw_query = query.strip()
    history = history or []

    # Merge document text if supplied
    if document_text and document_text.strip():
        full_invention_input = f"{raw_query}\n\n[ATTACHED INVENTION DOCUMENT TEXT]:\n{document_text.strip()}"
    else:
        full_invention_input = raw_query

    intent = classify_intent(raw_query, history=history)
    print(f"\n[AYUTH Engine] User Query: \"{raw_query[:80]}...\" | Detected Intent: {intent}")

    # =========================================================================
    # FLOW 1: GREETING
    # =========================================================================
    if intent == "GREETING":
        llm_messages = [
            {
                "role": "system",
                "content": (
                    "You are AYUTH, an AI-powered Intellectual Property and Regulatory Assistant specializing in "
                    "Ayurveda, Traditional Knowledge (TKDL), and Patent Regulations (Patents Act 1970, Biological Diversity Act 2002).\n"
                    "Provide a warm, concise, professional greeting. Explain that you can evaluate any invention (medicine formulas, medical devices, "
                    "manufacturing processes, AI/software technologies) by comparing its features against existing knowledge base evidence, or answer statutory patent questions."
                )
            },
            {"role": "user", "content": raw_query}
        ]
        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=300)
        if not llm_reply:
            llm_reply = (
                "Hello! I am **AYUTH**, your AI-powered Intellectual Property and Regulatory Assistant specializing in "
                "Ayurveda, Traditional Knowledge (TKDL), and Patent Regulations.\n\n"
                "I can evaluate your invention (medicine formula, medical device, manufacturing process, or software technology) "
                "by comparing its features against existing statutory and traditional knowledge evidence, or answer your patent questions.\n\n"
                "How can I assist you with your invention today?"
            )
        return {
            "status": "success",
            "intent": "greeting",
            "answer": llm_reply,
            "proof_documents": [],
            "citations": [],
            "found": True,
        }

    # =========================================================================
    # FLOW 2: INVENTION ANALYSIS REQUEST (DETAILS MISSING)
    # Dynamically identifies missing information without premature Chroma search.
    # =========================================================================
    if intent == "INVENTION_START_NEEDS_INFO":
        system_prompt = (
            "You are AYUTH, an AI Intellectual Property and Regulatory Assistant for Ayurveda and Traditional Knowledge.\n"
            "The user wants you to evaluate their invention for patentability, but has not yet provided the specific technical details.\n"
            "Respond warmly and professionally. Acknowledge that AYUTH evaluates medicine formulas, medical devices, extraction/manufacturing processes, "
            "and software technologies by comparing them feature-by-feature against existing knowledge and statutory standards.\n\n"
            "Dynamically ask the user to describe their invention, specifically asking for:\n"
            "1. What the invention is and the specific problem it solves\n"
            "2. Type of invention (Medicine formula, Device/hardware, Manufacturing process, Software/AI, or Product)\n"
            "3. Key components, active ingredients, structural elements, process steps, or algorithmic approach\n"
            "4. How it works or technical mechanism / delivery method\n"
            "5. What makes it different or novel from existing traditional knowledge or commercial solutions\n"
            "6. Supporting experimental data (e.g. synergistic index, in-vitro data, test results) or documents if available\n\n"
            "Do not use a rigid robotic template. Generate encouraging, natural clarification questions tailored to the user's prompt."
        )

        llm_messages = [{"role": "system", "content": system_prompt}]
        for h in history[-4:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            content = h.get("content", "").strip()
            if content:
                llm_messages.append({"role": role, "content": content})
        llm_messages.append({"role": "user", "content": raw_query})

        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=600)
        if not llm_reply:
            llm_reply = (
                "I would be glad to evaluate your invention and perform a preliminary patentability comparison against existing knowledge base records!\n\n"
                "To evaluate your invention (whether it is an Ayurvedic medicine formula, medical device, manufacturing process, or software technology), please share:\n"
                "• **What the invention is & the problem it solves**\n"
                "• **Key ingredients, components, steps, or technologies**\n"
                "• **How it works / technical mechanism**\n"
                "• **What makes it novel or different** from existing classical texts or products\n"
                "• **Experimental or synergy data / test results** (if available)\n\n"
                "Once you provide these details, I will extract its key features and compare them against TKDL records and statutory patent rules."
            )

        return {
            "status": "success",
            "intent": "invention_clarification_request",
            "answer": llm_reply,
            "proof_documents": [],
            "citations": [],
            "found": True,
        }

    # =========================================================================
    # FLOW 3: INVENTION FEATURE EXTRACTION & COMPARISON ENGINE
    # The user's invention is the PRIMARY INPUT; the knowledge base is COMPARISON EVIDENCE.
    # =========================================================================
    if intent == "INVENTION_EVALUATION":
        # 1. Dynamically extract structured features
        extracted = extract_structured_invention_features(full_invention_input, history=history, api_key=api_key)
        print(f"[AYUTH Engine] Extracted Invention Type: {extracted.get('invention_type')} | Title: {extracted.get('title')}")

        # 2. Retrieve multi-facet comparison evidence from ChromaDB
        retrieved_docs = search_comparison_evidence(extracted, full_invention_input, limit=settings.TOP_K or 6)

        evidence_str = ""
        if retrieved_docs:
            evidence_str = "\n\n".join([
                f"[Evidence Document {i+1}]: {d.get('question')}\nContent: {d.get('answer')}\nCitation: {d.get('citation')}\nCategory: {d.get('category')}"
                for i, d in enumerate(retrieved_docs)
            ])
        else:
            evidence_str = "No directly matching comparison documents found in the current searched knowledge base."

        # Format extracted features summary for prompt
        features_summary = (
            f"- **Invention Type**: {extracted.get('invention_type', 'General')}\n"
            f"- **Title/Concept**: {extracted.get('title', 'User Submission')}\n"
            f"- **Intended Use / Problem**: {extracted.get('intended_use_or_problem', 'N/A')}\n"
            f"- **Core Components / Ingredients / Steps**: {', '.join(extracted.get('core_components', []))}\n"
            f"- **Mechanism / Delivery / Operation**: {extracted.get('core_mechanism_or_steps', 'N/A')}\n"
            f"- **Claimed Novelty**: {extracted.get('claimed_novelty', 'N/A')}"
        )

        system_prompt = f"""You are AYUTH, an AI Intellectual Property and Regulatory Comparison Engine specializing in Ayurvedic IP, Traditional Knowledge (TKDL), and Patent Regulations (Patents Act 1970, Biological Diversity Act 2002, WIPO PCT).

YOUR ROLE:
You evaluate a USER'S INVENTION (the PRIMARY INPUT) by comparing it against EXISTING KNOWLEDGE AND STATUTORY EVIDENCE (the COMPARISON EVIDENCE).

=== USER INVENTION STRUCTURED FEATURES ===
{features_summary}

=== RETRIEVED KNOWLEDGE BASE COMPARISON EVIDENCE ===
{evidence_str}

=== CRITICAL EVALUATION RULES ===
1. The user's invention is the primary input. Do NOT treat it as a question to the knowledge base.
2. Compare the USER'S INVENTION FEATURES vs. FEATURES FOUND IN RETRIEVED EVIDENCE.
3. Identify:
   - Features already known in the retrieved evidence / classical references.
   - Features partially similar.
   - Features not found in the currently searched knowledge base.
   - Possible novel combinations or technical contributions.
   - Traditional knowledge conflicts (Section 3(p)) or prior art conflicts.
   - Missing experimental or comparative data.
4. IMPORTANT: Absence of a document in ChromaDB does NOT prove absolute universal novelty. Always state:
   "Not found in the currently searched knowledge base" rather than "This is definitely novel."
5. Tailor the legal and statutory analysis to the specific invention type:
   - For Medicine Formulas: Analyze Section 3(p) traditional knowledge, Section 3(e) synergistic admixture (CI < 0.8), Section 3(d) therapeutic efficacy, Section 6 NBA Form III approval, Schedule T GMP.
   - For Medical Devices/Hardware: Analyze Section 3(i) diagnostic treatment method exclusion vs patentable physical apparatus/sensor hardware.
   - For Manufacturing/Extraction Processes: Analyze Section 2(1)(j) process claims, non-obvious parameter limits, solvent yields, Shodhana standardization.
   - For Software/AI Technology: Analyze Section 3(k) CRI guidelines, technical contribution/effect, sensor-hardware integration.

=== MANDATORY 10-SECTION RESPONSE STRUCTURE ===
You MUST structure your response using the following 10 numbered Markdown sections:

## 1. Invention Summary
Summarize the user's invention, categorized invention type, and claimed objective.

## 2. Extracted Key Features
Bulleted list of technical components, ingredients, steps, mechanisms, or parameters.

## 3. Similar Existing Knowledge
Summary of relevant prior art, traditional formulations, or statutory precedents found in the retrieved evidence.

## 4. Feature-by-Feature Comparison
Provide a Markdown comparison table comparing each user feature against the retrieved evidence:
| User Invention Feature | Existing Evidence in Knowledge Base | Comparison Status | Novelty & Risk Impact |

## 5. Potential Novel Features
Identify specific aspects that appear technically differentiated (with the explicit note: *"Not found in the currently searched knowledge base"*).

## 6. Prior Art Risks
Analyze technical overlap, novelty destruction risks, or obviousness concerns based on existing knowledge.

## 7. Traditional Knowledge / Statutory Exclusions
Examine relevant statutory bars (Section 3(p), Section 3(e), Section 3(d), Section 3(i), Section 3(k), Section 6 NBA Form III) applicable to this invention type.

## 8. Patentability Considerations
Evaluate Novelty (Section 2(1)(j)), Inventive Step (Section 2(1)(ja)), and Industrial Applicability (Section 2(1)(ac)).

## 9. Evidence and Sources
List the specific citations and retrieved ChromaDB documents referenced in this comparison.

## 10. Recommended Next Steps
Provide concrete actionable advice (e.g. quantitative synergy assays, global prior art search, NBA Form III filing, provisional patent application, trade secret strategy).

---
> **Disclaimer**: This is a preliminary AI-assisted patentability assessment for research and informational purposes only and does not constitute a formal legal opinion or replace advice from a registered Patent Agent or Attorney. AYUTH does not grant or approve patents."""

        llm_messages = [{"role": "system", "content": system_prompt}]
        for h in history[-6:]:
            role = "assistant" if h.get("role") == "assistant" else "user"
            content = h.get("content", "").strip()
            if content:
                llm_messages.append({"role": role, "content": content})
        llm_messages.append({"role": "user", "content": f"Please evaluate and compare this invention against existing knowledge evidence:\n{full_invention_input}"})

        llm_reply = call_groq_llm(llm_messages, api_key=api_key, max_tokens=2200)

        # Fallback comparison generator if LLM call is unavailable
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
            llm_reply += "\n\n---\n> **Disclaimer**: This is a preliminary AI-assisted patentability assessment for research and informational purposes only and does not constitute a formal legal opinion or replace advice from a registered Patent Agent or Attorney. AYUTH does not grant or approve patents."

        citations = [d.get("citation") for d in retrieved_docs if d.get("citation")]
        return {
            "status": "success",
            "intent": "invention_patentability_assessment",
            "answer": llm_reply,
            "proof_documents": retrieved_docs,
            "citations": citations,
            "found": True,
        }

    # =========================================================================
    # FLOW 4: KNOWLEDGE QUESTION (GROUNDED RAG SEARCH)
    # =========================================================================
    knowledge_matches = search_knowledge_documents(raw_query, limit=settings.TOP_K or 4)
    has_matches = knowledge_matches and len(knowledge_matches) > 0

    if not has_matches:
        return {
            "status": "not_found",
            "intent": "insufficient_info",
            "answer": "I don't have enough relevant information in the current knowledge base to answer this accurately.",
            "proof_documents": [],
            "citations": [],
            "found": False,
        }

    context_str = "\n\n".join([
        f"[Source {i+1}]: {d.get('question')}\nContent: {d.get('answer')}\nCitation: {d.get('citation')}"
        for i, d in enumerate(knowledge_matches)
    ])

    system_prompt = f"""You are AYUTH, an AI Intellectual Property and Regulatory Assistant specializing in Ayurvedic IP, Traditional Knowledge (TKDL), and Patent Regulations (Patents Act 1970, Biological Diversity Act 2002).

Answer the user's question directly, clearly, and concisely based on the RETRIEVED CHROMADB STATUTORY CONTEXT below:
=== RETRIEVED STATUTORY CONTEXT ===
{context_str}

INSTRUCTIONS:
1. Ground your answer strictly in the provided statutory context and cite relevant Sections, acts, and guidelines.
2. If the context does not contain enough relevant information to answer the question, state:
   "I don't have enough relevant information in the current knowledge base to answer this accurately."
3. Keep the tone authoritative, concise, and professional."""

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

    is_insufficient = "don't have enough relevant information" in llm_reply.lower() or "not enough information" in llm_reply.lower()

    return {
        "status": "success" if not is_insufficient else "not_found",
        "intent": "statutory_answer",
        "answer": llm_reply,
        "proof_documents": [] if is_insufficient else knowledge_matches,
        "citations": [] if is_insufficient else [d.get("citation") for d in knowledge_matches if d.get("citation")],
        "found": not is_insufficient,
    }
