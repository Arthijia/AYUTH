"""
AYUTH Multilingual Intelligence & Strict Language Hierarchy Engine
Provides:
- Strict Language Decision Hierarchy (Selected UI Lang -> Script -> Long N-Gram -> Prev Lang -> English)
- Anti-Hallucination Short Message Guard (Never predict Dutch for "helo" or Turkish for "hola")
- Code-mixed & Transliterated Language Support (Tanglish, Hinglish)
- Language-Independent Semantic Intent Classification
- Multi-Turn Session State & Repeated Intent Tracking
"""

import re
from typing import Dict, Any, List, Optional
from langdetect import detect_langs, DetectorFactory
DetectorFactory.seed = 0

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
    "zh": "Chinese",
    "fr": "French",
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean",
    "hi": "Hindi",
    "kn": "Kannada",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "sa": "Sanskrit",
    "es": "Spanish",
    "ar": "Arabic",
    "ru": "Russian",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "sv": "Swedish",
    "tr": "Turkish",
}

# Common English / Latin greeting and casual variations (including typos)
COMMON_SHORT_GREETINGS_CASUAL = {
    "hi", "hii", "hiii", "hello", "helo", "helloo", "hey", "heyy", "hlo", "hlw", "howdy",
    "greetings", "good morning", "good afternoon", "good evening", "good day", "sup", "yo",
    "thanks", "thank you", "thx", "thanx", "ok", "okay", "yes", "yeah", "yep", "no", "nope",
    "bye", "goodbye", "cya", "cool", "great", "sure", "fine", "help", "who are you"
}

def analyze_unicode_script(text: str) -> Optional[Dict[str, Any]]:
    """
    Checks if text contains native non-Latin scripts (Tamil, Devanagari, Hangul, Arabic, etc.).
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

def determine_language_hierarchy(
    raw_text: str,
    selected_language: Optional[str] = "en",
    previous_language: Optional[str] = None,
    history: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Strict Language Decision Hierarchy:
    
    PRIORITY 1: Native non-Latin script in the text (e.g. Tamil 'வணக்கம்', Hindi 'नमस्ते', Korean '안녕하세요', Arabic 'مرحبا')
                -> Instantly recognized as that language.
                
    PRIORITY 2: Indic Code-mixed text with genuine transliteration markers (e.g. 'Naan oru...', 'Mujhe...')
                -> Recognized as code-mixed Tanglish/Hinglish.
                
    PRIORITY 3: Short / Ambiguous Latin messages (< 25 chars or <= 4 words, e.g. 'helo', 'hello', 'hi', 'ok', 'thanks')
                -> STRICTLY USE selected_language from UI dropdown (e.g. 'en')! Never trust statistical n-grams on 4-letter words.
                
    PRIORITY 4: Long Latin message (>= 25 chars and >= 4 words) with High-Confidence Statistical Detection (>= 0.90)
                -> Use detected European/world language (e.g. French, Spanish, German).
                
    PRIORITY 5: Fallback to previous conversation language or selected_language (defaulting to English).
    """
    clean_text = raw_text.strip()
    lower_text = clean_text.lower()
    selected_lang = (selected_language or "en").lower().strip()
    if selected_lang == "auto":
        selected_lang = "en"

    # Step 1: Check Native Non-Latin Script (100% confidence deterministic)
    script_match = analyze_unicode_script(clean_text)
    if script_match:
        return script_match

    # Step 2: Check for known short greeting/casual typo variations in Latin
    words = re.findall(r'\b[a-zA-Z]+\b', lower_text)
    is_short = len(clean_text) < 25 or len(words) <= 4

    # Check if the entire message is a known common greeting/casual word
    if lower_text in COMMON_SHORT_GREETINGS_CASUAL or (len(words) <= 3 and any(w in COMMON_SHORT_GREETINGS_CASUAL for w in words)):
        # Specific native Latin greetings:
        if lower_text == "vanakkam":
            return {"detected_language": "ta", "language_name": "Tamil (Transliterated)", "confidence": 0.95, "script": "Latin", "is_code_mixed": True, "is_ambiguous_short": False}
        if lower_text in {"namaste", "namaskar"}:
            return {"detected_language": "hi", "language_name": "Hindi (Transliterated)", "confidence": 0.95, "script": "Latin", "is_code_mixed": True, "is_ambiguous_short": False}
        if lower_text == "hola":
            return {"detected_language": "es", "language_name": "Spanish", "confidence": 0.95, "script": "Latin", "is_code_mixed": False, "is_ambiguous_short": False}
        if lower_text in {"bonjour", "salut"}:
            return {"detected_language": "fr", "language_name": "French", "confidence": 0.95, "script": "Latin", "is_code_mixed": False, "is_ambiguous_short": False}
        if lower_text in {"annyeong", "annyeonghaseyo"}:
            return {"detected_language": "ko", "language_name": "Korean (Transliterated)", "confidence": 0.95, "script": "Latin", "is_code_mixed": False, "is_ambiguous_short": False}

        # For explicit English greeting variations (hello, helo, hi, hey, ok, thanks, etc.)
        if lower_text in {"hello", "helo", "helloo", "hi", "hii", "hiii", "hey", "heyy", "hlo", "howdy", "good morning", "good afternoon", "good evening", "thanks", "thank you", "thx", "thanx", "ok", "okay"}:
            effective_lang = selected_lang if selected_lang != "auto" else "en"
            return {
                "detected_language": effective_lang,
                "language_name": LANGUAGE_NAMES_MAP.get(effective_lang, effective_lang.capitalize()),
                "confidence": 0.99,
                "script": "Latin",
                "is_code_mixed": False,
                "is_ambiguous_short": True
            }

        effective_lang = selected_lang or previous_language or "en"
        return {
            "detected_language": effective_lang,
            "language_name": LANGUAGE_NAMES_MAP.get(effective_lang, effective_lang.capitalize()),
            "confidence": 0.99,
            "script": "Latin",
            "is_code_mixed": False,
            "is_ambiguous_short": True
        }

    # Step 3: Check for genuine Indic transliteration markers (Tanglish / Hinglish)
    tamil_translit_words = {"naan", "oru", "enoda", "panniruken", "pannirukken", "kidaikuma", "mudiyuma", "eppadi", "solunga", "iruku", "irukku", "panna", "seidhiruken", "puthiya", "kandupidipu", "kandupudichu", "enakku", "adhu", "idhu", "theriyuma"}
    hindi_translit_words = {"mujhe", "karna", "baare", "batao", "bataiye", "kya", "meri", "humne", "karke", "aavishkar", "banaya", "chahiye", "jaana", "lagta", "sakte", "mera", "hoga", "kaise"}

    word_set = set(words)
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

    # Step 4: Short Latin text that is not transliteration -> MUST respect selected_language
    if is_short:
        effective_lang = selected_lang or previous_language or "en"
        return {
            "detected_language": effective_lang,
            "language_name": LANGUAGE_NAMES_MAP.get(effective_lang, effective_lang.capitalize()),
            "confidence": 0.90,
            "script": "Latin",
            "is_code_mixed": False,
            "is_ambiguous_short": True
        }

    # Step 5: Long Latin text (>= 25 chars and >= 4 words) -> Statistical N-Gram detection
    try:
        langs = detect_langs(clean_text)
        if langs and len(langs) > 0:
            top_lang = langs[0]
            code = top_lang.lang
            prob = top_lang.prob

            # High confidence threshold for long text
            if prob >= 0.88 and code not in {"nl", "fy", "af", "so"} or (code in {"fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ko"} and prob >= 0.85):
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
        print(f"[Language Hierarchy Exception]: {e}")

    # Fallback to selected_language
    effective_lang = selected_lang or previous_language or "en"
    return {
        "detected_language": effective_lang,
        "language_name": LANGUAGE_NAMES_MAP.get(effective_lang, effective_lang.capitalize()),
        "confidence": 0.80,
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
            "selected_language": "en",
            "detected_language": "en",
            "response_language": "en",
            "language_name": "English",
            "language_confidence": 1.0,
            "current_intent": "NONE",
            "repeated_intent_count": 0,
            "turn_count": 0,
        }
    return SESSION_STORE[s_id]

def update_session_state(session_id: str, new_lang: Dict[str, Any], intent: str, selected_lang: str = "en") -> Dict[str, Any]:
    """
    Updates the session state dynamically with separated UI selected language, detected language, and response language.
    """
    session = get_or_create_session(session_id)
    session["turn_count"] += 1
    session["selected_language"] = selected_lang

    session["detected_language"] = new_lang["detected_language"]
    session["response_language"] = new_lang["detected_language"]
    session["language_name"] = new_lang["language_name"]
    session["language_confidence"] = new_lang["confidence"]

    # Track semantic repeated intents (e.g. repeated greetings)
    if intent == session.get("current_intent"):
        session["repeated_intent_count"] = session.get("repeated_intent_count", 0) + 1
    else:
        session["current_intent"] = intent
        session["repeated_intent_count"] = 1

    return session
