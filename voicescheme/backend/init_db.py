"""
init_db.py — Initialize SQLite offline cache for VoiceScheme
Run once: python init_db.py
Caches all schemes into SQLite for fast offline lookup.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "cache.db")
SCHEMES_PATH = os.path.join(os.path.dirname(__file__), "data", "schemes.json")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create schemes cache table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS schemes (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            ministry TEXT,
            description TEXT,
            benefits TEXT,
            how_to_apply TEXT,
            bpl_required INTEGER,
            gender TEXT,
            age_min INTEGER,
            age_max INTEGER,
            tags TEXT,
            full_json TEXT
        )
    """)

    # Create query log table (for analytics / book chapter demo)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS query_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_text TEXT,
            language TEXT,
            intents TEXT,
            result_count INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Load and insert schemes
    with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
        schemes = json.load(f)

    for s in schemes:
        e = s.get("eligibility", {})
        cursor.execute("""
            INSERT OR REPLACE INTO schemes VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["id"],
            s["name"],
            s.get("category"),
            s.get("ministry"),
            s.get("description"),
            s.get("benefits"),
            s.get("how_to_apply"),
            1 if e.get("bpl_required") else 0,
            e.get("gender", "all"),
            e.get("age_min"),
            e.get("age_max"),
            ",".join(s.get("tags", [])),
            json.dumps(s, ensure_ascii=False),
        ))

    conn.commit()
    conn.close()
    print(f"[VoiceScheme] SQLite cache initialized at {DB_PATH}")
    print(f"[VoiceScheme] {len(schemes)} schemes loaded.")


if __name__ == "__main__":
    init_db()
