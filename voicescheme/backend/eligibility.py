"""
eligibility.py — Rule-based eligibility engine for VoiceScheme
Filters schemes from schemes.json based on user profile.
"""

import json
import os

SCHEMES_PATH = os.path.join(os.path.dirname(__file__), "data", "schemes.json")


def load_schemes():
    """Load all schemes from the JSON flat-file database."""
    with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def check_eligibility(scheme: dict, profile: dict) -> bool:
    """
    Check if a user profile is eligible for a given scheme.

    profile keys (all optional, defaults are permissive):
        - is_bpl (bool)
        - age (int)
        - gender (str): 'male' | 'female' | 'other'
        - category (str): 'SC' | 'ST' | 'OBC' | 'general'
        - occupation (str): e.g. 'farmer', 'student', 'labourer'
        - income (int): monthly income in Rs
        - land_acres (float)
    """
    e = scheme.get("eligibility", {})

    # BPL check — only block if scheme requires BPL and user is NOT BPL
    if e.get("bpl_required") and not profile.get("is_bpl", False):
        return False

    # Age check — only apply if user provided age
    age = profile.get("age")
    if age is not None:
        if e.get("age_min") is not None and age < e["age_min"]:
            return False
        if e.get("age_max") is not None and age > e["age_max"]:
            return False

    # Gender check — only block if scheme is gender-specific AND user specified gender
    user_gender = profile.get("gender", "all")
    scheme_gender = e.get("gender", "all")
    if scheme_gender not in ("all", None) and user_gender not in ("all", None):
        if scheme_gender != user_gender:
            return False

    # Category check — only block if scheme restricts category AND user specified one
    user_cat = profile.get("category", "all")
    allowed_cats = e.get("category", ["all"])
    if "all" not in allowed_cats and user_cat not in ("all", None):
        if user_cat not in allowed_cats:
            return False

    # Income check — only apply if user provided income
    income = profile.get("income")
    if income is not None and e.get("income_max") is not None:
        if income > e["income_max"]:
            return False

    # Land holding check — only apply if user provided land info
    land = profile.get("land_acres")
    if land is not None and e.get("land_holding_max_acres") is not None:
        if land > e["land_holding_max_acres"]:
            return False

    return True


def filter_schemes(profile: dict, keyword: str = None, category: str = None) -> list:
    """
    Return list of eligible schemes for a user profile.
    Optionally filter by keyword (searches name, description, tags)
    or by category (agriculture, health, housing, etc.)
    """
    schemes = load_schemes()
    results = []

    for scheme in schemes:
        # Eligibility gate
        if not check_eligibility(scheme, profile):
            continue

        # Category filter — only apply if explicitly given
        if category and category != "general":
            if scheme.get("category", "").lower() != category.lower():
                continue

        # Keyword filter — search in name, description, tags (loose match)
        if keyword:
            kw = keyword.lower()
            searchable = (
                scheme.get("name", "").lower()
                + " "
                + scheme.get("description", "").lower()
                + " "
                + " ".join(scheme.get("tags", []))
            )
            # Match any single word from keyword string
            kw_words = kw.split()
            if not any(w in searchable for w in kw_words if len(w) > 2):
                continue

        results.append(scheme)

    return results


def get_scheme_by_id(scheme_id: str) -> dict:
    """Fetch a single scheme by its ID."""
    schemes = load_schemes()
    for s in schemes:
        if s["id"] == scheme_id:
            return s
    return None


def get_all_categories() -> list:
    """Return unique list of scheme categories."""
    schemes = load_schemes()
    return list({s["category"] for s in schemes})
