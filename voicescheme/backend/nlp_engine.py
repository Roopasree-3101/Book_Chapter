"""
nlp_engine.py — NLP intent and entity extraction for VoiceScheme
Uses NLTK for tokenization and keyword matching.
"""

import re
import nltk

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
# Intent keywords — broader coverage including Hindi/Tamil/Telugu words
# ---------------------------------------------------------------------------
INTENT_MAP = {
    "housing":        ["house","ghar","makaan","awaas","home","shelter","pucca","makan","housing","gramin","rural house","घर","मकान","आवास","வீடு","ఇల్లు"],
    "food":           ["food","ration","khana","anaj","rice","wheat","PDS","antyodaya","grain","खाना","राशन","अनाज","உணவு","రేషన్"],
    "health":         ["health","hospital","doctor","medical","treatment","bimari","dawai","ayushman","illness","medicine","स्वास्थ्य","अस्पताल","दवाई","சுகாதாரம்","ఆరోగ్యం"],
    "employment":     ["job","work","employment","rozgar","nrega","mgnrega","labour","kaam","wage","mazdoor","रोजगार","काम","मजदूर","வேலை","ఉపాధి"],
    "agriculture":    ["farmer","kisan","farming","kheti","agriculture","crop","fasal","land","khet","किसान","खेती","फसल","விவசாயி","రైతు"],
    "education":      ["school","scholarship","padhai","study","student","education","vidya","college","class","छात्रवृत्ति","पढ़ाई","विद्यार्थी","கல்வி","విద్య"],
    "pension":        ["pension","old age","budhapa","retirement","elderly","senior","60 years","वृद्ध","पेंशन","बुढ़ापा","ஓய்வூதியம்","పెన్షన్"],
    "insurance":      ["insurance","bima","accident","death","life insurance","disability","बीमा","दुर्घटना","காப்பீடு","బీమా"],
    "banking":        ["bank","account","jan dhan","zero balance","rupay","saving","बैंक","खाता","வங்கி","బ్యాంక్"],
    "skill":          ["skill","training","kaushal","certificate","course","vocational","कौशल","प्रशिक्षण","திறன்","నైపుణ్యం"],
    "women_child":    ["girl","daughter","beti","sukanya","women","mahila","child","बेटी","महिला","बालिका","பெண்","మహిళ"],
    "entrepreneurship":["business","loan","subsidy","enterprise","startup","MSME","व्यवसाय","ऋण","தொழில்","వ్యాపారం"],
    "energy":         ["gas","LPG","ujjwala","cylinder","chulha","cooking","fuel","गैस","चूल्हा","எரிவாயு","గ్యాస్"],
}

# Profile extraction keywords
PROFILE_KEYWORDS = {
    "is_bpl":  ["bpl","below poverty","garib","poor","गरीब","बीपीएल","ஏழை","పేద"],
    "farmer":  ["farmer","kisan","kheti","agriculture","किसान","खेती","விவசாயி","రైతు"],
    "student": ["student","school","college","padhai","छात्र","विद्यार्थी","மாணவர்","విద్యార్థి"],
    "elderly": ["old","elderly","senior","budhapa","60","65","70","वृद्ध","बुजुर्ग","முதியோர்","వృద్ధుడు"],
    "female":  ["woman","women","female","mahila","girl","beti","महिला","बेटी","பெண்","మహిళ"],
    "sc_st":   ["sc","st","scheduled caste","scheduled tribe","dalit","adivasi","दलित","आदिवासी"],
}


def detect_language(text: str) -> str:
    devanagari = len(re.findall(r"[\u0900-\u097F]", text))
    tamil      = len(re.findall(r"[\u0B80-\u0BFF]", text))
    telugu     = len(re.findall(r"[\u0C00-\u0C7F]", text))
    counts = {"hi": devanagari, "ta": tamil, "te": telugu}
    dominant = max(counts, key=counts.get)
    return dominant if counts[dominant] > 2 else "en"


def extract_intent(text: str) -> list:
    text_lower = text.lower()
    matched = []
    for category, keywords in INTENT_MAP.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                if category not in matched:
                    matched.append(category)
                break
    return matched if matched else ["general"]


def extract_profile_hints(text: str) -> dict:
    text_lower = text.lower()
    profile = {}
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["is_bpl"]):
        profile["is_bpl"] = True
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["farmer"]):
        profile["occupation"] = "farmer"
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["student"]):
        profile["occupation"] = "student"
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["elderly"]):
        profile["age"] = 65
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["female"]):
        profile["gender"] = "female"
    if any(kw in text_lower for kw in PROFILE_KEYWORDS["sc_st"]):
        profile["category"] = "SC"
    age_match = re.search(r"\b(\d{1,2})\s*(years?|saal|varsh|age)\b", text_lower)
    if age_match:
        profile["age"] = int(age_match.group(1))
    return profile


def score_scheme(scheme: dict, text: str, intents: list) -> int:
    """
    Relevance score for a scheme given query text and detected intents.
    Higher = more relevant. Used to rank results.
    """
    score = 0
    text_lower = text.lower()
    words = [w for w in text_lower.split() if len(w) > 2]

    # Category match with intent
    if scheme.get("category") in intents:
        score += 50

    # Keyword match in name
    name_lower = scheme.get("name", "").lower()
    for w in words:
        if w in name_lower:
            score += 20

    # Keyword match in tags
    tags = " ".join(scheme.get("tags", [])).lower()
    for w in words:
        if w in tags:
            score += 15

    # Keyword match in description
    desc = scheme.get("description", "").lower()
    for w in words:
        if w in desc:
            score += 5

    return score


def process_query(text: str) -> dict:
    language = detect_language(text)
    intents = extract_intent(text)
    profile_hints = extract_profile_hints(text)

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
        "keywords": keywords[:10],
    }
