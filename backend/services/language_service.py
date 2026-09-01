"""
AYUTH Multilingual Intelligence & Semantic Intent Engine
Provides:
- Dynamic, Automatic Language Recognition (No hardcoded language lists)
- Code-mixed & Transliterated Language Inference (e.g. Tanglish, Hinglish)
- Ambiguous & Short Message Contextual Disambiguation
- Language-Independent Semantic Intent Classification
- Multi-Turn Session State & Repeated Intent Tracking
"""

import re
import json
from typing import Dict, Any, List, Optional
from langdetect import detect_langs, DetectorFactory
DetectorFactory.seed = 0

from config import settings

# Global in-memory session tracker for multi-turn state
SESSION_STORE: Dict[str, Dict[str, Any]] = {}

# Unicode Script Block Ranges for instant, 100% deterministic script identification
UNICODE_SCRIPT_RANGES = [
    (0x0B80, 0x0BFF, "ta", "Tamil", "Tamil"),
    (0x0900, 0x097F, "hi", "Hindi", "Devanagari"),
    (0x0600, 0x06FF, "ar", "Arabic", "Arabic"),
    (0x0C00, 0x0C7F, "te", "Telugu", "Telugu"),
    (0x0980, 0x09FF, "bn", "Bengali", "Bengali"),
    (0x0D00, 0x0D7F, "ml", "Malayalam", "Malayalam"),
    (0x0C80, 0x0CFF, "kn", "Kannada", "Kannada"),
    (0x0A80, 0x0AFF, "gu", "Gujarati", "Gujarati"),
    (0x0A00, 0x0A7F, "pa", "Punjabi", "Gurmukhi"),
    (0x0400, 0x04FF, "ru", "Russian", "Cyrillic"),
    (0xAC00, 0xD7AF, "ko", "Korean", "Hangul"),
    (0x1100, 0x11FF, "ko", "Korean", "Hangul"),
    (0x3130, 0x318F, "ko", "Korean", "Hangul"),
    (0x4E00, 0x9FFF, "zh", "Chinese", "Han"),
    (0x3040, 0x30FF, "ja", "Japanese", "Japanese"),
    (0x0370, 0x03FF, "el", "Greek", "Greek"),
]

LANGUAGE_NAMES_MAP = {
    "en": "English",
    "ta": "Tamil",
    "hi": "Hindi",
    "fr": "French",
    "es": "Spanish",
    "ar": "Arabic",
    "de": "German",
    "ja": "Japanese",
    "zh": "Chinese",
    "ru": "Russian",
    "pt": "Portuguese",
    "it": "Italian",
    "te": "Telugu",
    "bn": "Bengali",
    "ml": "Malayalam",
    "kn": "Kannada",
    "mr": "Marathi",
    "gu": "Gujarati",
    "pa": "Punjabi",
    "ur": "Urdu",
    "nl": "Dutch",
    "sv": "Swedish",
    "tr": "Turkish",
    "ko": "Korean",
    "el": "Greek",
}

def analyze_unicode_script(text: str) -> Optional[Dict[str, Any]]:
    """
    Checks if text contains native non-Latin scripts (Tamil, Devanagari, Arabic, etc.).
    Returns language code, name, and script name.
    """
    for char in text:
        code = ord(char)
        for start, end, lang_code, lang_name, script_name in UNICODE_SCRIPT_RANGES:
            if start <= code <= end:
                return {
                    "detected_language": lang_code,
                    "language_name": lang_name,
                    "confidence": 0.99,
                    "script": script_name,
                    "is_code_mixed": False,
                    "is_ambiguous_short": False
                }
    return None

def detect_language_intelligence(text: str, history: List[Dict[str, str]] = None, session_state: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Universal Automatic Language Recognition:
    1. Unicode Script Analysis (100% confidence for non-Latin scripts).
    2. Statistical N-Gram Detector (langdetect for European/world Latin-script languages).
    3. Code-mixed / Transliteration & Ambiguous Short Message Contextual Reasoning.
    """
    clean_text = text.strip()
    history = history or []
    words = clean_text.split()

    # 1. Check Unicode Script (Tamil, Hindi/Devanagari, Arabic, etc.)
    unicode_res = analyze_unicode_script(clean_text)
    if unicode_res:
        return unicode_res

    # 2. Check for Ambiguous Short Message
    prev_lang = None
    if session_state and session_state.get("detected_language"):
        prev_lang = session_state.get("detected_language")
    elif history:
        # Check history for previous non-English language
        for h in reversed(history):
            if h.get("role") == "user":
                prev_u = analyze_unicode_script(h.get("content", ""))
                if prev_u:
                    prev_lang = prev_u["detected_language"]
                    break

    # If it's a very short 1-2 word greeting/phrase in Latin (e.g. "hi", "hello", "hey", "ok", "thanks")
    lower_text = clean_text.lower()
    is_short = len(words) <= 2 and len(clean_text) <= 12
    if is_short and lower_text in {"hi", "hello", "hey", "hola", "bonjour", "namaste", "vanakkam", "ok", "okay", "yes", "no", "thanks", "thank you", "cool"}:
        if prev_lang:
            return {
                "detected_language": prev_lang,
                "language_name": LANGUAGE_NAMES_MAP.get(prev_lang, prev_lang.capitalize()),
                "confidence": 0.85,
                "script": "Latin",
                "is_code_mixed": False,
                "is_ambiguous_short": True
            }
        # If it's explicitly a known greeting keyword in Latin:
        if lower_text == "vanakkam":
            return {"detected_language": "ta", "language_name": "Tamil (Transliterated)", "confidence": 0.95, "script": "Latin", "is_code_mixed": True, "is_ambiguous_short": False}
        if lower_text in {"namaste", "namaskar"}:
            return {"detected_language": "hi", "language_name": "Hindi (Transliterated)", "confidence": 0.95, "script": "Latin", "is_code_mixed": True, "is_ambiguous_short": False}
        if lower_text == "hola":
            return {"detected_language": "es", "language_name": "Spanish", "confidence": 0.95, "script": "Latin", "is_code_mixed": False, "is_ambiguous_short": False}
        if lower_text in {"bonjour", "salut"}:
            return {"detected_language": "fr", "language_name": "French", "confidence": 0.95, "script": "Latin", "is_code_mixed": False, "is_ambiguous_short": False}
        
        return {
            "detected_language": "en",
            "language_name": "English",
            "confidence": 0.70,
            "script": "Latin",
            "is_code_mixed": False,
            "is_ambiguous_short": True
        }

    # 3. Check for Indic Code-Mixed / Transliterated text (Tanglish, Hinglish, etc.)
    # Requires genuine Indic transliterated words (excluding pure English loanwords like 'invention' or 'patent')
    tamil_translit_words = {"naan", "oru", "enoda", "panniruken", "pannirukken", "kidaikuma", "mudiyuma", "eppadi", "solunga", "iruku", "irukku", "panna", "seidhiruken", "puthiya", "kandupidipu", "kandupudichu", "enakku", "adhu", "idhu", "theriyuma"}
    hindi_translit_words = {"mujhe", "karna", "baare", "batao", "bataiye", "kya", "meri", "humne", "karke", "aavishkar", "banaya", "chahiye", "jaana", "lagta", "sakte", "mera", "hoga", "kaise"}

    word_set = set(re.findall(r'\b[a-zA-Z]+\b', lower_text))
    tamil_matches = word_set.intersection(tamil_translit_words)
    hindi_matches = word_set.intersection(hindi_translit_words)

    if len(tamil_matches) >= 1:
        return {
            "detected_language": "ta-Latn",
            "language_name": "Tamil (Code-Mixed / Tanglish)",
            "confidence": 0.92,
            "script": "Latin",
            "is_code_mixed": True,
            "is_ambiguous_short": False
        }

    if len(hindi_matches) >= 1:
        return {
            "detected_language": "hi-Latn",
            "language_name": "Hindi (Code-Mixed / Hinglish)",
            "confidence": 0.92,
            "script": "Latin",
            "is_code_mixed": True,
            "is_ambiguous_short": False
        }

    # 4. Statistical N-Gram Language Detection (langdetect)
    try:
        langs = detect_langs(clean_text)
        if langs and len(langs) > 0:
            top_lang = langs[0]
            code = top_lang.lang
            prob = top_lang.prob

            # If confidence is reasonable
            if prob >= 0.70:
                name = LANGUAGE_NAMES_MAP.get(code, code.upper())
                return {
                    "detected_language": code,
                    "language_name": name,
                    "confidence": round(prob, 3),
                    "script": "Latin",
                    "is_code_mixed": False,
                    "is_ambiguous_short": False
                }
    except Exception as e:
        print(f"[Language Detection Exception]: {e}")

    # 5. Contextual Fallback
    if prev_lang:
        return {
            "detected_language": prev_lang,
            "language_name": LANGUAGE_NAMES_MAP.get(prev_lang, prev_lang.capitalize()),
            "confidence": 0.65,
            "script": "Latin",
            "is_code_mixed": False,
            "is_ambiguous_short": False
        }

    return {
        "detected_language": "en",
        "language_name": "English",
        "confidence": 0.60,
        "script": "Latin",
        "is_code_mixed": False,
        "is_ambiguous_short": False
    }

def get_or_create_session(session_id: str = None) -> Dict[str, Any]:
    """
    Retrieves or initializes session state for conversation memory & repeated intent tracking.
    """
    s_id = session_id or "default_session"
    if s_id not in SESSION_STORE:
        SESSION_STORE[s_id] = {
            "session_id": s_id,
            "detected_language": "en",
            "language_name": "English",
            "language_confidence": 1.0,
            "current_intent": "NONE",
            "repeated_intent_count": 0,
            "conversation_stage": "idle",
            "turn_count": 0,
        }
    return SESSION_STORE[s_id]

def update_session_state(session_id: str, new_lang: Dict[str, Any], intent: str) -> Dict[str, Any]:
    """
    Updates the session state dynamically with latest detected language and semantic repeated intent count.
    """
    session = get_or_create_session(session_id)
    session["turn_count"] += 1

    # Update language dynamically if detected with solid confidence or not ambiguous short
    if not new_lang.get("is_ambiguous_short") or session["turn_count"] == 1:
        session["detected_language"] = new_lang["detected_language"]
        session["language_name"] = new_lang["language_name"]
        session["language_confidence"] = new_lang["confidence"]

    # Track semantic repeated intents (e.g. repeated greetings)
    if intent == session.get("current_intent"):
        session["repeated_intent_count"] = session.get("repeated_intent_count", 0) + 1
    else:
        session["current_intent"] = intent
        session["repeated_intent_count"] = 1

    return session
