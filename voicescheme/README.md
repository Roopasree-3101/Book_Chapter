# VoiceScheme 🎙️
### AI-Powered Multilingual Voice Chatbot for Discovering Government Welfare Schemes for Rural BPL Families

[![Deploy](https://github.com/voicescheme/voicescheme/actions/workflows/deploy.yml/badge.svg)](https://github.com/voicescheme/voicescheme/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Data: Open Government](https://img.shields.io/badge/Data-Open%20Government-green.svg)](https://myscheme.gov.in)

> Built for book chapter submission. All data from free open government portals. No API keys. No personal data collected.

---

## ⚡ Quickest Demo — No Installation

**Open `demo.html` directly in Chrome or Edge:**
```
voicescheme/demo.html  →  double-click → opens in browser
```
✅ Voice input · ✅ 15 schemes · ✅ 4 languages · ✅ Map · ✅ TTS · ✅ Feedback · ✅ Share

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  React PWA  │  Web Speech API  │  i18next (4 langs)  │
│  Tailwind   │  Leaflet Map     │  Category Filter     │
└─────────────────────┬────────────────────────────────┘
                      │ REST API
┌─────────────────────▼────────────────────────────────┐
│         Flask API  (8 endpoints)                     │
│  /query  /tts  /schemes  /stats  /feedback           │
└──────┬──────────────┬──────────────┬─────────────────┘
       ▼              ▼              ▼
  NLP Engine    Eligibility     gTTS Engine
  (NLTK)        Engine          (4 languages)
       └──────────────┴──────────────┘
                      │
              schemes.json (15)
              SQLite cache.db
```

**Stack:** React 18 · Flask · NLTK · gTTS · Leaflet · SQLite · GitHub Pages · Render.com

---

## Full Stack Setup

### Backend
```bash
cd voicescheme/backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python init_db.py
python app.py
# → http://localhost:5000
```

### Frontend
```bash
cd voicescheme/frontend
npm install
npm start
# → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/query` | Voice/text → eligible schemes |
| POST | `/api/tts` | Text-to-speech (MP3 base64) |
| GET | `/api/schemes` | Filter schemes |
| GET | `/api/schemes/<id>` | Scheme detail |
| GET | `/api/categories` | All 13 categories |
| GET | `/api/stats` | Query analytics |
| POST | `/api/feedback` | Scheme helpfulness rating |

---

## Supported Languages

| Code | Language | Voice Recognition | TTS |
|------|----------|-------------------|-----|
| en | English | ✅ en-IN | ✅ |
| hi | Hindi (हिंदी) | ✅ hi-IN | ✅ |
| ta | Tamil (தமிழ்) | ✅ ta-IN | ✅ |
| te | Telugu (తెలుగు) | ✅ te-IN | ✅ |

---

## Scheme Database (15 Schemes — Open Data)

| Scheme | Category | BPL |
|--------|----------|-----|
| PM-KISAN | Agriculture | No |
| PMAY Gramin | Housing | Yes |
| NFSA Ration Card | Food | Yes |
| Jan Dhan Yojana | Banking | No |
| Jeevan Jyoti Bima | Insurance | No |
| Suraksha Bima | Insurance | No |
| MGNREGA | Employment | No |
| Ujjwala Yojana | Energy | Yes (Women) |
| Shram Yogi Maan-dhan | Pension | No |
| Pre-Matric SC/ST Scholarship | Education | Yes |
| Ayushman Bharat PMJAY | Health | Yes |
| Kaushal Vikas Yojana | Skill | No |
| Sukanya Samriddhi | Women & Child | No |
| PMEGP | Entrepreneurship | No |
| IGNOAPS Old Age Pension | Pension | Yes |

---

## Deployment

### Frontend → GitHub Pages
```bash
cd frontend
npm run deploy
# Live at: https://<username>.github.io/voicescheme
```

### Backend → Render.com (Free)
1. Push repo to GitHub
2. Render.com → New Web Service → connect repo → `backend/` folder
3. Build: `pip install -r requirements.txt && python init_db.py`
4. Start: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Add secret `REACT_APP_API_URL=https://<your-app>.onrender.com` in GitHub Secrets

### CI/CD — Auto-deploy on push to `main`
See `.github/workflows/deploy.yml`

---

## Project Structure

```
voicescheme/
├── demo.html                    # ★ Standalone demo — open in browser
├── BOOK_CHAPTER.md              # Full book chapter with evaluation
├── .github/workflows/deploy.yml # CI/CD auto-deploy
├── .gitignore
├── backend/
│   ├── app.py                   # Flask API (8 endpoints)
│   ├── eligibility.py           # Rule-based eligibility engine
│   ├── nlp_engine.py            # NLTK intent + language detection
│   ├── tts.py                   # gTTS wrapper (4 languages)
│   ├── init_db.py               # SQLite initializer
│   ├── requirements.txt         # Python deps (incl. gunicorn)
│   ├── Procfile                 # Render/Heroku process file
│   ├── render.yaml              # Render.com config
│   └── data/
│       ├── schemes.json         # 15 government schemes
│       └── cache.db             # SQLite (query log + feedback)
└── frontend/
    ├── .env.development         # Local API URL
    ├── .env.production          # Production API URL
    ├── package.json             # Includes gh-pages deploy script
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   ├── index.html           # PWA meta tags
    │   └── manifest.json        # PWA manifest
    └── src/
        ├── App.jsx              # Main app + offline fallback
        ├── index.js
        ├── index.css
        ├── components/
        │   ├── VoiceInput.jsx   # Web Speech API
        │   ├── SchemeCard.jsx   # Card + audio + share + feedback
        │   ├── LanguageSelector.jsx
        │   ├── CategoryFilter.jsx
        │   ├── MapView.jsx      # Leaflet CSC map
        │   └── ProfileForm.jsx
        └── i18n/
            ├── index.js
            ├── en.json
            ├── hi.json
            ├── ta.json
            └── te.json
```

---

## Security

- No API keys anywhere
- No PII stored — only anonymous query text + language
- Profile data stays in browser memory only
- All scheme data is public government information
- SQLite is local-only

---

## Data Sources

- [myscheme.gov.in](https://myscheme.gov.in) — Official GoI scheme portal
- [data.gov.in](https://data.gov.in) — Open Government Data Platform India

---

*VoiceScheme — Bridging the digital divide for rural BPL families through voice-first AI.*
