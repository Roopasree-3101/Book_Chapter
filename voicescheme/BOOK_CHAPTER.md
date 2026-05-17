# VoiceScheme: An AI-Powered Multilingual Voice Chatbot for Discovering Government Welfare Schemes for Rural BPL Families

> **Book Chapter Supplementary Material**
> All source code, data, and deployment instructions are included in this repository.

---

## Abstract

Rural Below Poverty Line (BPL) families in India face significant barriers in accessing government welfare schemes due to low digital literacy, language diversity, and lack of awareness. This chapter presents **VoiceScheme**, a voice-first, multilingual AI chatbot that enables rural users to discover relevant government schemes by speaking in their native language. The system supports English, Hindi, Tamil, and Telugu, covers 15 major central government schemes sourced from open government data portals, and operates with zero proprietary API dependencies. A standalone offline-capable demo is provided for immediate evaluation without any installation.

---

## 1. Introduction

India operates over 300 central government welfare schemes targeting BPL families, farmers, women, elderly citizens, and youth. Despite this, scheme awareness and uptake remain critically low in rural areas. Key barriers include:

- **Language barrier** — Government portals are primarily in English
- **Digital literacy gap** — Text-based interfaces are inaccessible to low-literacy users
- **Discoverability problem** — No single voice-first interface aggregates scheme information
- **Connectivity constraints** — Rural areas have intermittent internet access

VoiceScheme addresses all four barriers through a voice-first, multilingual, offline-capable architecture.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│  React.js PWA  │  Web Speech API  │  i18next (EN/HI/TA/TE)     │
│  Tailwind CSS  │  Leaflet.js Map  │  Category Filter Bar        │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST (axios)
┌────────────────────────▼────────────────────────────────────────┐
│                      FLASK REST API                             │
│  /api/query  │  /api/tts  │  /api/schemes  │  /api/stats        │
│  /api/health │  /api/categories  │  /api/feedback               │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌─────────────┐ ┌─────────────────┐
│  NLP Engine   │ │  Eligibility│ │   TTS Engine     │
│  (NLTK)       │ │  Engine     │ │   (gTTS)         │
│  Intent detect│ │  Rule-based │ │   4 languages    │
│  Lang detect  │ │  15 filters │ │   MP3 output     │
└───────────────┘ └──────┬──────┘ └─────────────────┘
                         │
              ┌──────────▼──────────┐
              │    DATA LAYER       │
              │  schemes.json (15)  │
              │  SQLite cache.db    │
              │  query_log table    │
              │  feedback table     │
              └─────────────────────┘
```

### 5-Layer Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 1 — UI | React 18 + Tailwind CSS | Responsive, accessible interface |
| 2 — Voice/NLP | Web Speech API + NLTK | Voice capture + intent extraction |
| 3 — Backend | Flask + Flask-CORS + gTTS | REST API + TTS audio generation |
| 4 — Data | schemes.json + SQLite | Scheme database + analytics cache |
| 5 — Deploy | GitHub Pages + Render.com | Free, zero-cost hosting |

---

## 3. Key Features

### 3.1 Multilingual Voice Input
- Web Speech API captures voice in EN/HI/TA/TE
- Unicode-based language auto-detection (Devanagari, Tamil, Telugu scripts)
- Text fallback for non-voice environments

### 3.2 Rule-Based Eligibility Engine
Filters schemes based on 6 profile dimensions:

| Dimension | Example |
|-----------|---------|
| BPL status | `bpl_required: true` |
| Age range | `age_min: 60` (old age pension) |
| Gender | `gender: female` (Ujjwala Yojana) |
| Social category | `category: ["SC", "ST"]` (scholarship) |
| Income ceiling | `income_max: 15000` (PM-SYM) |
| Land holding | `land_holding_max_acres: 5` (PM-KISAN) |

### 3.3 Progressive Query Relaxation
When strict filters return no results, the engine progressively relaxes:
1. Category + keyword match
2. Category only
3. Keyword only
4. Profile only (all eligible schemes)
5. All schemes (no filter)

### 3.4 Offline Fallback
When the backend is unreachable, the frontend switches to client-side NLP with an embedded 8-scheme database — ensuring the app works even without internet.

### 3.5 Text-to-Speech
- Backend: gTTS (Google TTS, free) generates MP3 audio
- Frontend fallback: Browser SpeechSynthesis API (zero network cost)
- Supports all 4 languages

---

## 4. Scheme Database

All 15 schemes are sourced from open government portals (myscheme.gov.in, data.gov.in):

| # | Scheme ID | Name | Category | BPL Required |
|---|-----------|------|----------|-------------|
| 1 | PM-KISAN-001 | PM-KISAN | Agriculture | No |
| 2 | PMAY-G-002 | PMAY Gramin | Housing | Yes |
| 3 | NFSA-003 | Ration Card | Food | Yes |
| 4 | PMJDY-004 | Jan Dhan Yojana | Banking | No |
| 5 | PMJJBY-005 | Jeevan Jyoti Bima | Insurance | No |
| 6 | PMSBY-006 | Suraksha Bima | Insurance | No |
| 7 | MGNREGS-007 | MGNREGA | Employment | No |
| 8 | PMUY-008 | Ujjwala Yojana | Energy | Yes (Women) |
| 9 | PMSYM-009 | Shram Yogi Maan-dhan | Pension | No |
| 10 | SCHOLARSHIP-010 | Pre-Matric SC/ST | Education | Yes (SC/ST) |
| 11 | AYUSHMAN-011 | Ayushman Bharat PMJAY | Health | Yes |
| 12 | PMKVY-012 | Kaushal Vikas Yojana | Skill | No |
| 13 | SUKANYA-013 | Sukanya Samriddhi | Women & Child | No |
| 14 | PMEGP-014 | Employment Generation | Entrepreneurship | No |
| 15 | IGNOAPS-015 | Old Age Pension | Pension | Yes |

---

## 5. API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| POST | `/api/query` | NLP query → eligible schemes |
| POST | `/api/tts` | Text-to-speech (MP3 base64) |
| GET | `/api/schemes` | Filter schemes by category/profile |
| GET | `/api/schemes/<id>` | Single scheme detail |
| GET | `/api/categories` | All 13 scheme categories |
| GET | `/api/stats` | Query analytics (total, by language) |
| POST | `/api/feedback` | Anonymous scheme helpfulness rating |

### Sample Query (cURL)
```bash
curl -X POST https://voicescheme-api.onrender.com/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "text": "मैं बीपीएल किसान हूँ",
    "profile": {"is_bpl": true, "occupation": "farmer"}
  }'
```

### Sample Response
```json
{
  "language": "hi",
  "count": 5,
  "schemes": [
    {
      "id": "PM-KISAN-001",
      "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
      "category": "agriculture",
      "benefits": "Rs 6000/year in 3 installments"
    }
  ]
}
```

---

## 6. Evaluation

### 6.1 Query Accuracy (Manual Testing — 20 test queries)

| Query Type | Language | Expected Category | Correct? |
|------------|----------|-------------------|----------|
| "I am a BPL farmer" | EN | agriculture | ✅ |
| "मैं बीपीएल किसान हूँ" | HI | agriculture | ✅ |
| "health hospital treatment" | EN | health | ✅ |
| "நான் BPL விவசாயி" | TA | agriculture | ✅ |
| "housing pucca house" | EN | housing | ✅ |
| "pension old age 65" | EN | pension | ✅ |
| "skill training youth" | EN | skill | ✅ |
| "gas LPG ujjwala" | EN | energy | ✅ |
| "scholarship SC student" | EN | education | ✅ |
| "job work employment" | EN | employment | ✅ |
| "bank account zero balance" | EN | banking | ✅ |
| "insurance bima accident" | EN | insurance | ✅ |
| "business loan subsidy" | EN | entrepreneurship | ✅ |
| "girl child sukanya" | EN | women_child | ✅ |
| "ration card food" | EN | food | ✅ |
| "నేను BPL రైతు" | TE | agriculture | ✅ |
| "rozgar kaam nrega" | HI | employment | ✅ |
| "ayushman hospital" | EN | health | ✅ |
| "budhapa pension" | HI | pension | ✅ |
| "kaushal training" | HI | skill | ✅ |

**Accuracy: 20/20 (100%) on test set**

### 6.2 Language Detection Accuracy

| Input Script | Detected Language | Correct? |
|-------------|-------------------|----------|
| Devanagari (मैं बीपीएल) | hi | ✅ |
| Tamil (நான் BPL) | ta | ✅ |
| Telugu (నేను BPL) | te | ✅ |
| Latin (I am BPL) | en | ✅ |

### 6.3 Response Time (localhost)

| Operation | Avg Time |
|-----------|----------|
| `/api/query` (NLP + filter) | ~45ms |
| `/api/tts` (gTTS, first call) | ~1.2s |
| `/api/tts` (cached audio) | ~5ms |
| `/api/schemes` (category filter) | ~12ms |

### 6.4 Offline Capability
- `demo.html` — 100% offline, no server required
- React PWA — offline fallback with 8 embedded schemes
- Backend — SQLite local cache, no cloud DB dependency

---

## 7. Deployment

### Frontend — GitHub Pages (Free)
```bash
cd frontend
npm install
npm run deploy
# Deploys to: https://<username>.github.io/voicescheme
```

### Backend — Render.com Free Tier
1. Push repository to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo → select `backend/` folder
4. Build command: `pip install -r requirements.txt && python init_db.py`
5. Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
6. Add environment variable: `PYTHON_VERSION=3.11.0`
7. Set `REACT_APP_API_URL` secret in GitHub → Settings → Secrets

### CI/CD — GitHub Actions
Automatic deployment on every push to `main`:
- Frontend builds and deploys to GitHub Pages
- Backend smoke test runs on every push

---

## 8. Security & Ethics

| Concern | Mitigation |
|---------|-----------|
| No API keys | Zero proprietary services used |
| No user data stored | Only anonymous query text + language logged |
| No PII collected | Profile data stays in browser memory only |
| Open data only | All scheme data from myscheme.gov.in, data.gov.in |
| CORS controlled | Restricted to known origins in production |
| No cloud database | SQLite is local-only |

---

## 9. Limitations & Future Work

| Limitation | Proposed Solution |
|-----------|------------------|
| 15 schemes only | Integrate myscheme.gov.in API when available |
| Rule-based NLP | Replace with fine-tuned IndicBERT model |
| No state-specific schemes | Add state filter + state scheme database |
| gTTS requires internet | Cache audio files locally after first generation |
| No user accounts | Add optional anonymous session for history |
| English-only scheme descriptions | Add full Tamil/Telugu descriptions |

---

## 10. Conclusion

VoiceScheme demonstrates that a voice-first, multilingual welfare scheme discovery system can be built entirely with free, open-source tools and open government data. The system achieves 100% intent detection accuracy on a 20-query test set, supports 4 Indian languages, and operates offline via a standalone HTML demo. The architecture is extensible to additional languages, schemes, and states without any proprietary dependencies.

---

## References

1. MyScheme Portal — Government of India. https://myscheme.gov.in
2. Open Government Data Platform India. https://data.gov.in
3. NLTK — Natural Language Toolkit. https://www.nltk.org
4. gTTS — Google Text-to-Speech Python library. https://gtts.readthedocs.io
5. React — A JavaScript library for building user interfaces. https://react.dev
6. Leaflet.js — Open-source JavaScript maps. https://leafletjs.com
7. Flask — Python web framework. https://flask.palletsprojects.com
8. Web Speech API — MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
9. i18next — Internationalization framework. https://www.i18next.com
10. Render.com — Cloud application hosting. https://render.com

---

*Source code: https://github.com/voicescheme/voicescheme*
*Live demo: https://voicescheme.github.io/voicescheme*
*Standalone demo: open `demo.html` in Chrome/Edge*
