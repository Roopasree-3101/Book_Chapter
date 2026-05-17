"""
tts.py — Text-to-Speech wrapper using gTTS (Google Text-to-Speech, free)
Converts scheme response text to audio bytes.
"""

import io
from gtts import gTTS

# Language code mapping for gTTS
LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
}


def text_to_speech(text: str, lang: str = "en") -> bytes:
    """
    Convert text to speech audio (MP3 bytes).

    Args:
        text: Text to convert
        lang: Language code ('en', 'hi', 'ta', 'te')

    Returns:
        MP3 audio as bytes
    """
    gtts_lang = LANG_MAP.get(lang, "en")

    tts = gTTS(text=text, lang=gtts_lang, slow=False)
    audio_buffer = io.BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_buffer.seek(0)
    return audio_buffer.read()


def build_scheme_summary(scheme: dict, lang: str = "en") -> str:
    """
    Build a short spoken summary of a scheme for TTS output.
    Uses Hindi description if lang is 'hi', else English.
    """
    if lang == "hi" and scheme.get("name_hi"):
        name = scheme["name_hi"]
        desc = scheme.get("description_hi", scheme.get("description", ""))
    else:
        name = scheme["name"]
        desc = scheme.get("description", "")

    benefits = scheme.get("benefits", "")
    how = scheme.get("how_to_apply", "")

    summary = f"{name}. {desc}. Benefits: {benefits}. How to apply: {how}."
    return summary
