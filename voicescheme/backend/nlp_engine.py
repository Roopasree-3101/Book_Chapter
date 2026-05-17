"""
nlp_engine.py — NLP intent and entity extraction for VoiceScheme
Uses NLTK for tokenization and keyword matching.
spaCy is optional — system works fully without it.
"""

import re
import nltk

# Download required NLTK data (runs once)
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", quiet=True)

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords", quiet=True)

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# ---------------------------------------------------------------------------
# Intent keywords map
# ---------------------------------------------------------------------------
INTENT_MAP = {
    "housing": ["house", "ghar", "makaan", "awaas", "home", "shelter", "pucca", "makan"],
    "food": ["food", "ration", "khana", "anaj", "rice", "wheat", "PDS", "antyodaya"],
    "health": ["health", "hospital", "doctor", "medical", "treatment", "bimari", "dawai", "ayushman"],
    "employment": ["job", "work", "employment", "rozgar", "nrega", "mgnrega", "labour", "kaam"],
    "agriculture": ["farmer", "kisan", "farming", "kheti", "agriculture", "crop", "fasal"],
    "education": ["school", "scholarship", "padhai", "study", "student", "education", "vidya"],
    "pension": ["pension", "old age", "budhapa", "retirement", "elderly", "senior"],
    "insurance": ["insurance", "bima", "accident", "death", "life insurance"],
    "banking": ["bank", "account", "jan dhan", "zero balance", "rupay"],
    "skill": ["skill", "training", "kaushal", "certificate", "course"],
    "women_child": ["girl", "daughter", "beti", "sukanya", "women", "mahila"],
    "entrepreneurship": ["business", "loan", "subsidy", "enterprise", "startup", "MSME"],
    "energy": ["gas", "LPG", "ujjwala", "cylinder", "chulha", "cooking"],
}

# Profile extraction keywords
PROFILE_KEYWORDS = {
    "is_bpl": ["bpl", "below poverty", "garib", "poor"],
    "farmer": ["farmer", "kisan", "kheti", "agriculture"],
    "student": ["student", "school", "college", "padhai"],
    "elderly": ["old", "elderly", "senior", "budhapa", "60", "65", "70"],
    "female": ["woman", "women", "female", "mahila", "girl", "beti"],
    "sc_st": ["sc", "st", "scheduled caste", "scheduled tribe", "dalit", "adivasi"],
}


def detect_language(text: str) -> str:
    """
    Simple language detection based on Unicode ranges.
    Returns: 'hi' (Hindi/Devanagari), 'ta' (Tamil), 'te' (Telugu), 'en' (default)
    """
    devanagari = len(re.findall(r"[\u0900-\u097F]", text))
    tamil = len(re.findall(r"[\u0B80-\u0BFF]", text))
    telugu = len(re.findall(r"[\u0C00-\u0C7F]", text))

    counts = {"hi": devanagari, "ta": tamil, "te": telugu}
    dominant = max(counts, key=counts.get)

    if counts[dominant] > 2:
        return dominant
    return "en"


def extract_intent(text: str) -> list:
    """
    Extract scheme category intents from user text.
    Returns list of matched categories (e.g. ['housing', 'health'])
    """
    text_lower = text.lower()
    matched = []

    for category, keywords in INTENT_MAP.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                matched.append(category)
                break

    return matched if matched else ["general"]


def extract_profile_hints(text: str) -> dict:
    """
    Extract user profile hints from natural language text.
    Returns partial profile dict.
    """
    text_lower = text.lower()
    profile = {}

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["is_bpl"]):
        profile["is_bpl"] = True

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["farmer"]):
        profile["occupation"] = "farmer"

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["student"]):
        profile["occupation"] = "student"

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["elderly"]):
        profile["age"] = 65  # assume elderly

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["female"]):
        profile["gender"] = "female"

    if any(kw in text_lower for kw in PROFILE_KEYWORDS["sc_st"]):
        profile["category"] = "SC"

    # Extract age numbers if present
    age_match = re.search(r"\b(\d{1,2})\s*(years?|saal|varsh|age)\b", text_lower)
    if age_match:
        profile["age"] = int(age_match.group(1))

    return profile


def process_query(text: str) -> dict:
    """
    Main NLP pipeline. Takes raw user text, returns structured query dict.

    Returns:
    {
        "original_text": str,
        "language": str,
        "intents": list,
        "profile_hints": dict,
        "keywords": list
    }
    """
    language = detect_language(text)
    intents = extract_intent(text)
    profile_hints = extract_profile_hints(text)

    # Tokenize and extract meaningful keywords (English fallback)
    try:
        stop_words = set(stopwords.words("english"))
        tokens = word_tokenize(text.lower())
        keywords = [t for t in tokens if t.isalpha() and t not in stop_words and len(t) > 2]
    except Exception:
        keywords = text.lower().split()

    return {
        "original_text": text,
        "language": language,
        "intents": intents,
        "profile_hints": profile_hints,
        "keywords": keywords[:10],  # top 10 keywords
    }
