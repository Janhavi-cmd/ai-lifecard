# ⚡ AI LifeCard — Unified Personal Intelligence Dashboard

> **"Google Maps for your life decisions"** — One dashboard that tells you everything important about your financial health, career readiness, and burnout risk.

![AI LifeCard Banner](https://placehold.co/1200x400/04040a/00e5ff?text=AI+LifeCard+—+Personal+Intelligence)

---

## 🚀 Live Demo

> Try the built-in demo mode — no data needed!

---

## 🧠 What It Does

AI LifeCard is a **full-stack AI-powered personal intelligence platform** that analyzes your:

| Card | What It Does | AI Used |
|------|-------------|---------|
| 💳 **Financial Health** | Spending analysis, anomaly detection, burn rate prediction | Anomaly detection + forecasting |
| 🚀 **Career Readiness** | NLP resume parsing, skill gap analysis, job match scoring | TF-IDF + keyword NLP |
| 🧠 **Wellness / Burnout** | Behavioral pattern analysis, fatigue risk scoring | Rule-based + weighted scoring |
| ⚡ **Smart Alerts** | Real-time actionable insights across all dimensions | ML Hybrid |

---

## ✨ Features

- 🎴 **4 Intelligent Life Cards** — Financial, Career, Wellness, Alerts
- 🤖 **Built-in AI Chatbot** — Ask your LifeCard anything
- 📊 **Interactive Charts** — Radar, Area, Pie, Bar charts via Recharts
- 📄 **PDF Export** — Download a beautiful LifeCard report
- 🕐 **Session History** — Compare with your last 3 analyses
- 🎮 **One-Click Demo Mode** — Instant demo with realistic data
- 🛡️ **Zero-Failure Design** — Mock fallback if backend is offline
- 🔮 **Particle Animation** — Stunning canvas-based hero effect
- 🗺️ **30-Day Skill Roadmap** — With free resource links

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Recharts** — Interactive data visualization
- **jsPDF** — Client-side PDF generation
- **CSS Variables + Canvas** — Custom animations, no libraries needed

### Backend
- **Python Flask** — REST API server
- **Flask-CORS** — Cross-origin support
- **Pure Python ML** — Anomaly detection, NLP, scoring (no heavy dependencies)

---

## ⚡ Quick Start

### Option 1: Run Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs at http://localhost:3000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

### Option 2: Frontend Only (Demo Mode)
```bash
cd frontend
npm install
npm start
```
> The app automatically uses rich mock data if the backend isn't running. **No errors, ever.**

---

## 📁 Project Structure

```
ai-lifecard/
├── backend/
│   ├── app.py              # Flask API with all AI engines
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js           # Main app + routing + input page
│       ├── index.css        # Global styles (dark bioluminescent theme)
│       ├── index.js         # React entry point
│       ├── pages/
│       │   ├── LandingPage.js   # Hero + particle canvas + features
│       │   └── Dashboard.js     # Full dashboard with all cards + chatbot
│       └── utils/
│           └── api.js       # API calls + mock fallback
├── start-backend.sh
├── start-frontend.sh
└── README.md
```

---

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze/full` | Full life analysis (all 3 modules) |
| `POST` | `/api/analyze/financial` | Financial analysis only |
| `POST` | `/api/analyze/career` | Career/NLP analysis only |
| `POST` | `/api/analyze/burnout` | Burnout/wellness analysis only |
| `POST` | `/api/chat` | AI chatbot response |

### Sample Request — Full Analysis
```json
POST /api/analyze/full
{
  "financial": {
    "income": 75000,
    "savings": 8000,
    "transactions": [
      {"amount": 2200, "category": "Rent", "desc": "Monthly rent"},
      {"amount": 450, "category": "Food", "desc": "Groceries"}
    ]
  },
  "career": {
    "resume_text": "Software Engineer with 3 years experience in React, Python, SQL...",
    "target_role": "Senior Software Engineer",
    "experience_years": 3
  },
  "burnout": {
    "work_hours_per_day": 9.5,
    "sleep_hours": 6.5,
    "exercise_days_per_week": 2,
    "stress_level": 7,
    "breaks_per_day": 2,
    "weekend_work": true
  }
}
```

---

## 💼 Resume Bullets (Use These!)

```
✅ Built AI-powered personal intelligence dashboard combining NLP, anomaly detection, 
   and behavioral analysis across 3 life dimensions

✅ Implemented client-side PDF report generation using jsPDF for downloadable AI reports

✅ Designed zero-failure API architecture with automatic mock fallback ensuring 100% uptime

✅ Integrated NLP-powered resume parser detecting 30+ technical skills across 6 categories

✅ Built AI chatbot assistant providing contextual life insights using rule-ML hybrid approach

✅ Created interactive data visualizations (radar, area, pie, bar charts) using Recharts
```

---

## 🚀 Future Upgrades (Roadmap)

- [ ] Firebase Google Auth
- [ ] Real ML models (scikit-learn RandomForest)
- [ ] PDF/DOCX resume upload (pdfjs-dist)
- [ ] LinkedIn + Adzuna job listing API
- [ ] Deploy: Railway (backend) + Vercel (frontend)
- [ ] Gemini API chatbot integration

---

## 🏆 Why This Project Stands Out

| Feature | Other Projects | AI LifeCard |
|---------|---------------|-------------|
| AI Modules | 1 | 4+ |
| Visual Impact | Low | ⭐⭐⭐⭐⭐ |
| Production UX | Basic | Enterprise |
| Error Handling | Minimal | Zero-failure |
| Interview Story | Simple | Multi-layered |

---

*Built with 🔥 by a developer who wanted more than just another ML notebook.*
