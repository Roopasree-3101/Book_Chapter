"""
app.py — VoiceScheme Flask REST API
Connects frontend voice input to NLP engine, eligibility filter, and TTS output.
All data is from free public government sources (myscheme.gov.in / data.gov.in).
"""

import base64
import sqlite3
import json
import os
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import io

from nlp_engine import process_query
from eligibility import filter_schemes, get_scheme_by_id, get_all_categories
from tts import text_to_speech, build_scheme_summary

app = Flask(__name__)

# Allow all origins for development (restrict to specific domains in production)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "cache.db")


# ---------------------------------------------------------------------------
# Helper: log query to SQLite for analytics
# ---------------------------------------------------------------------------
def log_query(query_text: str, language: str, intents: list, result_count: int):
    """Persist query metadata to SQLite for analytics / book chapter demo."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            """INSERT INTO query_log (query_text, language, intents, result_count, timestamp)
               VALUES (?, ?, ?, ?, ?)""",
            (query_text, language, json.dumps(intents), result_count,
             datetime.utcnow().isoformat()),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass  # Never let logging break the main flow


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "VoiceScheme API", "version": "1.0.0"})


# ---------------------------------------------------------------------------
# Main query endpoint — accepts text or voice transcript
# ---------------------------------------------------------------------------
@app.route("/api/query", methods=["POST"])
def query():
    """
    POST /api/query
    Body: {
        "text": "I am a BPL farmer looking for government schemes",
        "lang": "en",          // optional, auto-detected if omitted
        "profile": {           // optional, merged with NLP-extracted hints
            "is_bpl": true,
            "age": 45,
            "gender": "male",
            "category": "general",
            "occupation": "farmer",
            "income": 8000,
            "land_acres": 2.5
        }
    }

    Returns: {
        "query": {...},
        "schemes": [...],
        "count": int,
        "language": str
    }
    """
    data = request.get_json(force=True)
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # NLP processing
    nlp_result = process_query(text)
    language = data.get("lang") or nlp_result["language"]

    # Merge explicit profile with NLP-extracted hints
    profile = {**nlp_result["profile_hints"], **data.get("profile", {})}

    # Determine category filter from intents
    intents = nlp_result["intents"]
    # Only use category filter if a specific non-general intent was detected
    # AND the query is short/focused (not a general "I am a BPL farmer" description)
    category = intents[0] if intents and "general" not in intents else None

    # Build keyword from original text for matching
    keyword = text if len(text.split()) <= 6 else " ".join(nlp_result["keywords"][:5])

    # Strategy: try progressively relaxed filters until we get results
    # 1. Try with both category and keyword
    schemes = filter_schemes(profile=profile, keyword=keyword, category=category)

    # 2. If no results, drop keyword (keep category)
    if not schemes and category:
        schemes = filter_schemes(profile=profile, category=category)

    # 3. If still no results, drop category (keep keyword)
    if not schemes and keyword:
        schemes = filter_schemes(profile=profile, keyword=keyword)

    # 4. If still no results, return all eligible schemes (profile only)
    if not schemes:
        schemes = filter_schemes(profile=profile)

    # 5. If profile is too restrictive and still nothing, return top schemes
    if not schemes:
        schemes = filter_schemes(profile={})

    # Boost: if we got very few results (1-2) and there's a profile, add more eligible ones
    if len(schemes) < 3 and profile:
        extra = filter_schemes(profile=profile)
        # Merge without duplicates, keeping original first
        seen_ids = {s["id"] for s in schemes}
        for s in extra:
            if s["id"] not in seen_ids:
                schemes.append(s)
                seen_ids.add(s["id"])

    # Limit to top 5 results
    schemes = schemes[:5]

    # Log query for analytics
    log_query(text, language, intents, len(schemes))

    return jsonify({
        "query": {
            "text": text,
            "language": language,
            "intents": intents,
            "profile_used": profile,
        },
        "schemes": schemes,
        "count": len(schemes),
        "language": language,
    })


# ---------------------------------------------------------------------------
# TTS endpoint — converts scheme summary to audio
# ---------------------------------------------------------------------------
@app.route("/api/tts", methods=["POST"])
def tts():
    """
    POST /api/tts
    Body: {
        "scheme_id": "PMAY-G-002",   // use scheme_id OR text
        "text": "Custom text...",
        "lang": "hi"
    }

    Returns: { "audio_base64": "...", "lang": "hi" }
    """
    data = request.get_json(force=True)
    lang = data.get("lang", "en")

    if data.get("scheme_id"):
        scheme = get_scheme_by_id(data["scheme_id"])
        if not scheme:
            return jsonify({"error": "Scheme not found"}), 404
        text = build_scheme_summary(scheme, lang)
    elif data.get("text"):
        text = data["text"]
    else:
        return jsonify({"error": "Provide scheme_id or text"}), 400

    try:
        audio_bytes = text_to_speech(text, lang)
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        return jsonify({"audio_base64": audio_b64, "lang": lang, "text": text})
    except Exception as e:
        return jsonify({"error": f"TTS failed: {str(e)}"}), 500


# ---------------------------------------------------------------------------
# Schemes listing endpoint
# ---------------------------------------------------------------------------
@app.route("/api/schemes", methods=["GET"])
def list_schemes():
    """
    GET /api/schemes?category=health&is_bpl=true&gender=female
    Returns filtered scheme list without eligibility profile needed.
    """
    category = request.args.get("category")
    is_bpl = request.args.get("is_bpl", "false").lower() == "true"
    gender = request.args.get("gender", "all")
    keyword = request.args.get("q")

    profile = {"is_bpl": is_bpl, "gender": gender}
    schemes = filter_schemes(profile=profile, keyword=keyword, category=category)

    return jsonify({"schemes": schemes, "count": len(schemes)})


# ---------------------------------------------------------------------------
# Single scheme detail
# ---------------------------------------------------------------------------
@app.route("/api/schemes/<scheme_id>", methods=["GET"])
def scheme_detail(scheme_id):
    scheme = get_scheme_by_id(scheme_id)
    if not scheme:
        return jsonify({"error": "Scheme not found"}), 404
    return jsonify(scheme)


# ---------------------------------------------------------------------------
# Categories list
# ---------------------------------------------------------------------------
@app.route("/api/categories", methods=["GET"])
def categories():
    return jsonify({"categories": sorted(get_all_categories())})


# ---------------------------------------------------------------------------
# Analytics / stats endpoint (for book chapter demo)
# ---------------------------------------------------------------------------
@app.route("/api/stats", methods=["GET"])
def stats():
    """
    GET /api/stats
    Returns query analytics from the SQLite log.
    Useful for book chapter: shows real usage patterns.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row

        total = conn.execute("SELECT COUNT(*) as c FROM query_log").fetchone()["c"]
        by_lang = conn.execute(
            "SELECT language, COUNT(*) as c FROM query_log GROUP BY language ORDER BY c DESC"
        ).fetchall()
        recent = conn.execute(
            "SELECT query_text, language, result_count, timestamp FROM query_log ORDER BY timestamp DESC LIMIT 10"
        ).fetchall()
        avg_results = conn.execute(
            "SELECT AVG(result_count) as avg FROM query_log"
        ).fetchone()["avg"]

        conn.close()

        return jsonify({
            "total_queries": total,
            "avg_results_per_query": round(avg_results or 0, 2),
            "queries_by_language": [dict(r) for r in by_lang],
            "recent_queries": [dict(r) for r in recent],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# Feedback endpoint — thumbs up/down on scheme results
# ---------------------------------------------------------------------------
@app.route("/api/feedback", methods=["POST"])
def feedback():
    """
    POST /api/feedback
    Body: { "scheme_id": "PMAY-G-002", "helpful": true, "lang": "en" }
    Stores anonymous feedback in SQLite.
    """
    data = request.get_json(force=True)
    scheme_id = data.get("scheme_id", "")
    helpful = bool(data.get("helpful", True))
    lang = data.get("lang", "en")

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute(
            """CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                scheme_id TEXT,
                helpful INTEGER,
                lang TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )"""
        )
        conn.execute(
            "INSERT INTO feedback (scheme_id, helpful, lang, timestamp) VALUES (?, ?, ?, ?)",
            (scheme_id, 1 if helpful else 0, lang, datetime.utcnow().isoformat()),
        )
        conn.commit()
        conn.close()
        return jsonify({"status": "ok", "message": "Feedback recorded"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
