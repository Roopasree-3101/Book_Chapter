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
    """Build a spoken summary using the correct language fields."""
    def loc(field):
        return scheme.get(f"{field}_{lang}") or scheme.get(field, "")

    name     = loc("name")
    desc     = loc("description")
    benefits = loc("benefits")
    apply    = loc("how_to_apply")
    who      = loc("who_can_apply")

    parts = [name, desc]
    if who:
        parts.append(who)
    parts.append(f"Benefits: {benefits}" if lang == "en" else benefits)
    parts.append(apply)

    return ". ".join(p for p in parts if p)
