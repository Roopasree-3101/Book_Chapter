# VoiceScheme — Deployment Guide

## Option A: Standalone Demo (Instant — No Setup)

Open `demo.html` in Chrome or Edge. Done.

---

## Option B: Full Stack (Local)

```bash
# Terminal 1 — Backend
cd voicescheme/backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python init_db.py
python app.py
# → http://localhost:5000

# Terminal 2 — Frontend
cd voicescheme/frontend
npm install
npm start
# → http://localhost:3000
```

---

## Option C: Deploy to Internet (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial VoiceScheme commit"
git remote add origin https://github.com/<YOUR_USERNAME>/voicescheme.git
git push -u origin main
```

### Step 2 — Deploy Backend to Render.com

1. Go to [render.com](https://render.com) → Sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && python init_db.py`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Region:** Singapore (closest to India)
   - **Plan:** Free
5. Click **Create Web Service**
6. Wait ~3 minutes → copy your URL: `https://voicescheme-api.onrender.com`

### Step 3 — Set GitHub Secret

1. GitHub repo → **Settings → Secrets → Actions**
2. Add secret: `REACT_APP_API_URL` = `https://voicescheme-api.onrender.com`

### Step 4 — Deploy Frontend to GitHub Pages

```bash
cd frontend

# Update homepage in package.json to your GitHub username:
# "homepage": "https://<YOUR_USERNAME>.github.io/voicescheme"

npm install
npm run deploy
# → https://<YOUR_USERNAME>.github.io/voicescheme
```

Or push to `main` — GitHub Actions auto-deploys via `.github/workflows/deploy.yml`.

---

## Verify Deployment

```bash
# Backend health check
curl https://voicescheme-api.onrender.com/api/health

# Test query
curl -X POST https://voicescheme-api.onrender.com/api/query \
  -H "Content-Type: application/json" \
  -d '{"text":"BPL farmer","profile":{"is_bpl":true}}'
```

---

## Environment Variables

| Variable | Dev Value | Prod Value |
|----------|-----------|------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | `https://voicescheme-api.onrender.com` |

Set in:
- Dev: `frontend/.env.development` (already configured)
- Prod: `frontend/.env.production` + GitHub Secret `REACT_APP_API_URL`

---

## Notes

- Render free tier **spins down after 15 min inactivity** — first request after sleep takes ~30s
- The frontend has an **offline fallback** — it works even when backend is sleeping
- `demo.html` always works offline — no backend needed
