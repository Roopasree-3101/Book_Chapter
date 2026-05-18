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
# Root route — Visual dashboard (visible in browser)
# ---------------------------------------------------------------------------
@app.route("/", methods=["GET"])
def dashboard():
    """Browser-visible status dashboard for VoiceScheme API."""
    try:
        conn = sqlite3.connect(DB_PATH)
        total_queries = conn.execute("SELECT COUNT(*) FROM query_log").fetchone()[0]
        total_feedback = conn.execute("SELECT COUNT(*) FROM feedback").fetchone()[0]
        recent = conn.execute(
            "SELECT query_text, language, result_count, timestamp FROM query_log ORDER BY timestamp DESC LIMIT 5"
        ).fetchall()
        by_lang = conn.execute(
            "SELECT language, COUNT(*) as c FROM query_log GROUP BY language ORDER BY c DESC"
        ).fetchall()
        conn.close()
    except Exception:
        total_queries = 0
        total_feedback = 0
        recent = []
        by_lang = []

    from eligibility import get_all_categories, load_schemes
    schemes = load_schemes()
    categories = sorted(get_all_categories())

    lang_rows = "".join(
        f"<tr><td>{r[0]}</td><td><b>{r[1]}</b></td></tr>" for r in by_lang
    ) or "<tr><td colspan='2'>No queries yet</td></tr>"

    recent_rows = "".join(
        f"<tr><td>{r[0][:40]}...</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3][:16]}</td></tr>"
        for r in recent
    ) or "<tr><td colspan='4'>No queries yet — try the frontend!</td></tr>"

    cat_pills = "".join(
        f"<span class='pill'>{c}</span>" for c in categories
    )

    endpoints = [
        ("GET",  "/",                  "This dashboard"),
        ("GET",  "/api/health",        "Health check"),
        ("POST", "/api/query",         "NLP query → schemes"),
        ("POST", "/api/tts",           "Text-to-speech audio"),
        ("GET",  "/api/schemes",       "List/filter schemes"),
        ("GET",  "/api/schemes/&lt;id&gt;", "Single scheme detail"),
        ("GET",  "/api/categories",    "All categories"),
        ("GET",  "/api/stats",         "Query analytics"),
        ("POST", "/api/feedback",      "Scheme feedback"),
    ]
    ep_rows = "".join(
        f"<tr><td><span class='method method-{m.lower()}'>{m}</span></td>"
        f"<td><code>{path}</code></td><td>{desc}</td>"
        f"<td><a href='{path if m=='GET' and '<' not in path else '#'}' "
        f"{'target=_blank' if m=='GET' and '<' not in path else ''}>{'Try ↗' if m=='GET' and '<' not in path else '—'}</a></td></tr>"
        for m, path, desc in endpoints
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>VoiceScheme API — Dashboard</title>
<meta http-equiv="refresh" content="30"/>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f0f4ff;color:#1e293b}}
  header{{background:#1d4ed8;color:#fff;padding:20px 32px;display:flex;align-items:center;justify-content:space-between}}
  header h1{{font-size:1.4rem;font-weight:700}}
  header p{{font-size:.8rem;color:#bfdbfe;margin-top:3px}}
  .badge{{background:#22c55e;color:#fff;font-size:.75rem;padding:4px 14px;border-radius:999px;font-weight:700;letter-spacing:.05em}}
  main{{max-width:960px;margin:0 auto;padding:28px 20px;display:grid;grid-template-columns:1fr 1fr;gap:20px}}
  .card{{background:#fff;border-radius:14px;border:1px solid #e2e8f0;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}}
  .card.full{{grid-column:1/-1}}
  .card h2{{font-size:.85rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px}}
  .stat-grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}}
  .stat{{background:#f8fafc;border-radius:10px;padding:14px;text-align:center}}
  .stat .num{{font-size:2rem;font-weight:800;color:#1d4ed8}}
  .stat .lbl{{font-size:.72rem;color:#64748b;margin-top:3px}}
  table{{width:100%;border-collapse:collapse;font-size:.82rem}}
  th{{text-align:left;padding:8px 10px;background:#f8fafc;color:#64748b;font-weight:600;font-size:.75rem;text-transform:uppercase}}
  td{{padding:8px 10px;border-top:1px solid #f1f5f9;vertical-align:middle}}
  tr:hover td{{background:#fafbff}}
  code{{background:#f1f5f9;padding:2px 7px;border-radius:5px;font-size:.8rem;color:#1d4ed8}}
  .method{{display:inline-block;padding:2px 8px;border-radius:5px;font-size:.72rem;font-weight:700}}
  .method-get{{background:#dbeafe;color:#1d4ed8}}
  .method-post{{background:#dcfce7;color:#15803d}}
  .pill{{display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:999px;padding:3px 10px;font-size:.72rem;margin:2px}}
  a{{color:#3b82f6;text-decoration:none}}
  a:hover{{text-decoration:underline}}
  .dot{{width:10px;height:10px;background:#22c55e;border-radius:50%;display:inline-block;margin-right:6px;animation:blink 2s infinite}}
  @keyframes blink{{0%,100%{{opacity:1}}50%{{opacity:.4}}}}
  .refresh{{font-size:.72rem;color:#94a3b8;text-align:right;margin-top:8px}}
  footer{{text-align:center;font-size:.72rem;color:#94a3b8;padding:20px;border-top:1px solid #e2e8f0;margin-top:8px}}
</style>
</head>
<body>
<header>
  <div>
    <h1>🎙️ VoiceScheme API</h1>
    <p>AI-Powered Multilingual Government Welfare Scheme Finder — Backend Dashboard</p>
  </div>
  <span class="badge"><span class="dot"></span>RUNNING</span>
</header>
<main>

  <!-- Stats -->
  <div class="card full">
    <h2>📊 Live Statistics</h2>
    <div class="stat-grid">
      <div class="stat"><div class="num">{len(schemes)}</div><div class="lbl">Schemes Loaded</div></div>
      <div class="stat"><div class="num">{total_queries}</div><div class="lbl">Queries Processed</div></div>
      <div class="stat"><div class="num">{total_feedback}</div><div class="lbl">Feedback Received</div></div>
    </div>
    <p class="refresh">Auto-refreshes every 30 seconds</p>
  </div>

  <!-- API Endpoints -->
  <div class="card full">
    <h2>🔌 API Endpoints</h2>
    <table>
      <tr><th>Method</th><th>Endpoint</th><th>Description</th><th>Test</th></tr>
      {ep_rows}
    </table>
  </div>

  <!-- Language breakdown -->
  <div class="card">
    <h2>🌐 Queries by Language</h2>
    <table>
      <tr><th>Language</th><th>Count</th></tr>
      {lang_rows}
    </table>
  </div>

  <!-- Recent queries -->
  <div class="card">
    <h2>🕐 Recent Queries</h2>
    <table>
      <tr><th>Query</th><th>Lang</th><th>Results</th><th>Time</th></tr>
      {recent_rows}
    </table>
  </div>

  <!-- Categories -->
  <div class="card full">
    <h2>📂 Scheme Categories ({len(categories)} total)</h2>
    <div style="margin-top:4px">{cat_pills}</div>
  </div>

</main>
<footer>
  VoiceScheme Backend v1.0.0 · Port 5001 · 
  Frontend → <a href="http://localhost:3005/Book_Chapter" target="_blank">localhost:3005/Book_Chapter</a> ·
  Data from <a href="https://myscheme.gov.in" target="_blank">myscheme.gov.in</a>
</footer>
</body>
</html>"""
    return html


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
    category = intents[0] if intents and "general" not in intents else None

    # Build keyword from original text for matching
    keyword = text if len(text.split()) <= 6 else " ".join(nlp_result["keywords"][:5])

    # Strategy: progressively relaxed filters
    schemes = filter_schemes(profile=profile, keyword=keyword, category=category)
    if not schemes and category:
        schemes = filter_schemes(profile=profile, category=category)
    if not schemes and keyword:
        schemes = filter_schemes(profile=profile, keyword=keyword)
    if not schemes:
        schemes = filter_schemes(profile=profile)
    if not schemes:
        schemes = filter_schemes(profile={})

    # Boost: if fewer than 3 results, add more eligible ones
    if len(schemes) < 3 and profile:
        extra = filter_schemes(profile=profile)
        seen_ids = {s["id"] for s in schemes}
        for s in extra:
            if s["id"] not in seen_ids:
                schemes.append(s)
                seen_ids.add(s["id"])

    # Rank by relevance score
    from nlp_engine import score_scheme
    schemes.sort(key=lambda s: score_scheme(s, text, intents), reverse=True)

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
    app.run(debug=True, host="0.0.0.0", port=5001)
