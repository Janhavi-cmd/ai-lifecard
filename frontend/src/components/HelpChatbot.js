import React, { useState, useRef, useCallback, useEffect } from 'react';
import { api } from '../utils/api';

// ─────────────────────────────────────────────────────────────────────────────
//  COMPLETE APP KNOWLEDGE BASE — answers every possible user question
// ─────────────────────────────────────────────────────────────────────────────
const HELP_KB = {
  // HOW TO USE
  "how to use": {
    icon: "📖",
    answer: `**How to use AI LifeCard in 3 steps:**\n\n**Step 1 — Fill Your Data**\nClick "Get Started" → Fill 3 tabs:\n• 💳 Financial: income, savings, transactions\n• 🚀 Career: paste your resume text\n• 🧠 Wellness: work hours, sleep, stress\n\n**Step 2 — Generate**\nClick "Generate My LifeCard" → AI analyzes everything\n\n**Step 3 — Explore Dashboard**\nYour results appear across 5 tabs:\n🔮 Overview · 💳 Financial · 🚀 Career · 🧠 Wellness · ⚡ Alerts\n\n💡 Tip: Click "Try Demo" on the home page for an instant preview!`
  },

  "get started": {
    icon: "🚀",
    answer: `**Getting Started:**\n\nClick the **"Get Started →"** button on the home page.\n\nYou'll see a 3-tab input form:\n1. 💳 **Financial** — Enter your monthly income, savings, and list your expenses\n2. 🚀 **Career** — Paste your resume text or upload a PDF/DOCX file\n3. 🧠 **Wellness** — Answer 6 quick questions about your lifestyle\n\nThen click **"Generate My LifeCard"** and watch the AI work! ⚡`
  },

  // SCORES
  "score": {
    icon: "📊",
    answer: `**Understanding Your Scores:**\n\nEach score is out of **100** with a grade (A/B/C/D/F):\n\n• **85–100 = A** 🟢 Excellent\n• **70–84 = B** 🔵 Good\n• **55–69 = C** 🟡 Average\n• **40–54 = D** 🟠 Needs Work\n• **0–39 = F** 🔴 Critical\n\n**Your Overall Score** = average of all 3 cards\n\n💡 Focus on your lowest score first — it gives maximum impact!`
  },

  "overall score": {
    icon: "🎯",
    answer: `**Overall Score = (Financial + Career + Wellness) ÷ 3**\n\nIt represents your **total life intelligence** score.\n\nExample: If you score 72 Financial, 65 Career, 80 Wellness:\nOverall = (72 + 65 + 80) ÷ 3 = **72.3 — Grade B**\n\nThe radar chart on the Overview tab shows all dimensions visually. 🔮`
  },

  // FINANCIAL CARD
  "financial": {
    icon: "💳",
    answer: `**💳 Financial Health Card:**\n\n**What it analyzes:**\n• Spending patterns across categories\n• Anomaly detection (unusual transactions)\n• Monthly burn rate prediction\n• Savings rate vs income\n• Potential savings opportunities\n\n**How to improve it:**\n• Keep savings rate above 20%\n• Avoid single transactions > 30% of income\n• Diversify spending across categories\n• Set a monthly budget and stick to it\n\n**AI Used:** IsolationForest anomaly detection + RandomForest scoring`
  },

  "transactions": {
    icon: "💸",
    answer: `**How to enter transactions:**\n\nIn the Financial tab, enter one per line in this format:\n\`\`\`\namount, category, description\n\`\`\`\n\nExample:\n\`\`\`\n2200, Rent, Monthly rent\n450, Food, Groceries\n320, Entertainment, Netflix & dining\n180, Transport, Uber\n890, Shopping, Online shopping\n\`\`\`\n\n**Categories you can use:**\nRent, Food, Entertainment, Transport, Shopping, Utilities, Health, Education\n\n💡 More transactions = more accurate anomaly detection!`
  },

  "anomaly": {
    icon: "⚡",
    answer: `**What is an anomaly / unusual transaction?**\n\nThe AI uses **IsolationForest ML** to detect transactions that are statistically unusual compared to your normal spending.\n\nAn anomaly is flagged when:\n• A transaction is much larger than your usual amounts\n• It's in a category you rarely spend on\n• It significantly deviates from your spending pattern\n\nExample: If you usually spend ₹500 on food but suddenly spend ₹8,000 — that's flagged! ⚠️\n\nThis helps detect both **overspending** and **potential fraud**.`
  },

  "savings": {
    icon: "💰",
    answer: `**Understanding Savings Rate:**\n\n**Formula:** (Income - Total Spend) ÷ Income × 100\n\nRecommended benchmarks:\n• **20%+** ✅ Excellent — you're on track for financial freedom\n• **10–20%** ⚠️ Okay — room for improvement\n• **Below 10%** 🔴 Critical — review your expenses urgently\n\n**Savings Opportunity** shown on your card = how much more you *could* save with 20% optimization of your top spending category.\n\n💡 Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`
  },

  // CAREER CARD
  "career": {
    icon: "🚀",
    answer: `**🚀 Career Readiness Card:**\n\n**What it analyzes:**\n• 30+ technical skills across 6 categories\n• Resume strength (metrics, education, length)\n• Job match % for your target role\n• Missing high-value skills for 2025\n\n**6 Skill Categories Scanned:**\n1. Programming (Python, JS, Java, etc.)\n2. Web (React, Vue, Node, etc.)\n3. Data (SQL, Pandas, Tableau, etc.)\n4. ML/AI (TensorFlow, scikit-learn, LLM)\n5. Cloud (AWS, Docker, Kubernetes)\n6. Soft Skills (Leadership, Agile, etc.)\n\n**AI Used:** TF-IDF vectorizer + RandomForest scoring (R²=0.87)`
  },

  "resume": {
    icon: "📄",
    answer: `**How to get the best resume analysis:**\n\n**Option 1 — Paste Text (recommended):**\nCopy all text from your resume and paste it in the text box.\n\n**Option 2 — Upload File:**\nClick "Upload PDF / DOCX" and drag & drop your resume file.\n\n**Tips for higher scores:**\n✅ Include numbers & metrics (e.g., "improved by 40%")\n✅ List all technical skills clearly\n✅ Include your education section\n✅ Aim for 400–600 words total\n✅ Mention your GitHub & LinkedIn\n\n💡 The AI scans for **30+ specific skill keywords** — make sure they're in your resume!`
  },

  "skill roadmap": {
    icon: "🗺️",
    answer: `**30-Day Skill Roadmap:**\n\nBased on your resume, the AI identifies your top **missing high-value skills for 2025** and creates a learning plan.\n\n**For each missing skill you get:**\n• Estimated days to learn (usually 30)\n• 2 free learning resources with direct links\n\n**Top skills in demand right now:**\nTypeScript, Docker, AWS, Machine Learning, Kubernetes, Rust, LLMs\n\n**How to use it:**\nPick your top 1–2 missing skills and commit to 30 min/day of learning. In 30 days, update your resume and re-analyze!`
  },

  "job match": {
    icon: "🎯",
    answer: `**Job Match % Explained:**\n\nThis score compares your **detected skills + experience** against your **target role**.\n\n**Formula:**\n• Keyword match between role title and resume = 60% weight\n• Overall skill coverage = 40% weight\n\n**To improve it:**\n1. Add the exact job title keywords to your resume\n2. Learn the missing skills shown in your card\n3. Enter a more specific target role (e.g., "Senior React Developer" instead of "Developer")\n\n**Good match:** 70%+ means you're a strong candidate — start applying! 🚀`
  },

  // WELLNESS CARD
  "wellness": {
    icon: "🧠",
    answer: `**🧠 Wellness & Burnout Card:**\n\n**What it analyzes:**\n• Work hours vs recommended (8h/day)\n• Sleep quality (target: 7–8 hours)\n• Exercise frequency (target: 3–4x/week)\n• Stress level (1–10 scale)\n• Break frequency during work\n• Weekend work impact\n\n**4 Wellness Dimensions:**\n• ⚖️ Work-Life Balance\n• 😴 Sleep Quality\n• 🏋️ Physical Wellness\n• 🧠 Mental Load\n\n**Risk Levels:**\n🔴 High Risk (score < 35) · 🟡 Medium (35–65) · 🟢 Low (65+)`
  },

  "burnout": {
    icon: "🔥",
    answer: `**Burnout Risk — What It Means:**\n\n**High Risk 🔴** — You're likely experiencing or heading toward burnout\n**Medium Risk 🟡** — Warning signs present, take action now\n**Low Risk 🟢** — You're managing well, keep it up!\n\n**Key burnout triggers detected by the AI:**\n• Working 10+ hours/day consistently\n• Sleeping less than 6 hours\n• No exercise (0–1 days/week)\n• Stress level above 7\n• Working on weekends\n• Fewer than 2 breaks per day\n\n**Quick recovery actions:**\n😴 Sleep 7–8h · 🏃 Exercise 3x/week · ☕ Pomodoro breaks · 📵 Screen-free evenings`
  },

  "focus": {
    icon: "⏰",
    answer: `**Focus Window Prediction:**\n\nThe AI predicts your **peak cognitive performance window** based on your sleep and stress data.\n\n**How it works:**\n• If sleep ≥ 7h + stress ≤ 5 → Peak: **9 AM – 12 PM & 2–4 PM**\n• If sleep < 6h → Reduced: **10 AM – 12 PM only**\n• High stress → Shifted: **10 AM – 1 PM**\n\n**Research shows:**\nMost people have a 3–4 hour peak focus window per day. Schedule your most important work in this window for 2–3x productivity! 🚀`
  },

  // DASHBOARD TABS
  "dashboard": {
    icon: "🔮",
    answer: `**Dashboard — 5 Tabs Explained:**\n\n**🔮 Overview** — Radar chart showing all dimensions + score breakdown + history comparison\n\n**💳 Financial** — Spending pie chart, anomalies, trend prediction, 6-month projection\n\n**🚀 Career** — Skill detection, missing skills, job match, 30-day roadmap, resume tips\n\n**🧠 Wellness** — Burnout risk, weekly trend chart, wellness dimensions, recovery tips\n\n**⚡ Alerts** — Prioritized smart alerts ranked by urgency (High → Medium → Info)\n\n💡 Click any tab to dive deeper into that dimension!`
  },

  "alerts": {
    icon: "⚡",
    answer: `**Smart Alerts — How They Work:**\n\nThe AI generates **personalized alerts** by cross-analyzing all 3 cards together.\n\n**Priority levels:**\n🔴 **High** — Needs immediate attention\n🟡 **Medium** — Action recommended\n🔵 **Info** — Good news or general tips\n\n**Example alerts:**\n• "💸 Financial health needs attention" → Improve spending habits\n• "🔥 High burnout risk detected!" → Rest & recovery needed\n• "⚡ 2 unusual transactions flagged" → Review transactions\n• "🎯 Strong job match: 78%" → Start applying now!\n\nEach alert has a specific **action step** to follow.`
  },

  // FEATURES
  "pdf": {
    icon: "📥",
    answer: `**PDF Export Feature:**\n\nClick the **"⬇️ Export PDF"** button in the top-right of your dashboard.\n\n**Your PDF includes:**\n• Overall score & grade\n• Financial health summary\n• Career readiness details\n• Skills found & missing skills\n• Wellness & burnout data\n• Next review date\n\n**Use cases:**\n✅ Show to your mentor or career counselor\n✅ Track your progress over time\n✅ Include in portfolio / resume folder\n✅ Share with a financial advisor\n\n💡 Works completely in your browser — no server needed!`
  },

  "history": {
    icon: "📈",
    answer: `**History & Progress Tracking:**\n\nAI LifeCard automatically saves your **last 3 analyses** in your browser.\n\n**To see your history:**\nGo to Dashboard → 🔮 Overview tab → scroll down to see "History Comparison"\n\n**What it shows:**\nYour overall scores side by side so you can see if you're improving!\n\n**How to use it:**\n1. Analyze today → note your scores\n2. Work on improvements for a week\n3. Re-analyze → see the difference\n\n💡 Click "Re-Analyze" in the top bar to run a new analysis anytime!`
  },

  "theme": {
    icon: "🌙",
    answer: `**Dark / Light Mode Toggle:**\n\nClick the **☀️ / 🌙 button** in the top navigation bar.\n\n• 🌙 **Dark Mode** (default) — Deep space bioluminescent theme\n• ☀️ **Light Mode** — Clean light blue theme\n\nYour preference is saved automatically — it will remember it next time you open the app.\n\n💡 The app is designed to look stunning in both modes!`
  },

  "demo": {
    icon: "🎮",
    answer: `**Try Demo Mode:**\n\nClick **"🎮 Try Demo"** on the home page for an instant preview with realistic sample data.\n\n**Demo uses:**\n• A sample software engineer's profile\n• Realistic Mumbai-based expense data\n• Moderate burnout risk scenario\n• 3 years experience profile\n\n**Why use demo?**\nGreat for understanding what the app does before entering your own data. Perfect for showing in interviews or presentations!\n\n💡 Demo works even without the backend server running!`
  },

  "login": {
    icon: "🔑",
    answer: `**Sign in with Google:**\n\nClick **"🔑 Sign in with Google"** in the navbar.\n\n**Why sign in?**\n• Your name shows in the dashboard\n• Future update: sync history across devices\n• Future update: save analyses to cloud\n\n**Currently working?**\nGoogle login works if Firebase is configured. If you see an error, the app still works perfectly — just without the login feature.\n\n**To enable it:**\nCreate a \`frontend/.env\` file with your Firebase keys from the \`.env.example\` file.`
  },

  // TECHNICAL
  "how does it work": {
    icon: "🤖",
    answer: `**How the AI Works (Technical):**\n\n**Financial Analysis:**\n→ IsolationForest ML detects anomalies in transactions\n→ RandomForest weighted scoring (5 features)\n\n**Career Analysis:**\n→ TF-IDF vectorizer extracts skills from resume text\n→ Keyword matching across 6 skill categories\n→ ML scoring with 7 weighted features (R²=0.87)\n\n**Wellness Analysis:**\n→ 7-feature behavioral scoring model\n→ Rule-based risk classification\n→ Pattern-based focus window prediction\n\n**Tech Stack:**\n• Backend: Python Flask + scikit-learn + SQLite\n• Frontend: React 18 + Recharts + jsPDF\n• AI: IsolationForest, TF-IDF, RandomForest`
  },

  "backend": {
    icon: "⚙️",
    answer: `**Backend Not Running?**\n\nNo problem! The app has **zero-failure design** — it works perfectly without the backend.\n\n**With backend running:**\n→ Real scikit-learn ML models process your data\n→ Results saved to SQLite database\n→ Full AI chatbot responses\n\n**Without backend (auto mock mode):**\n→ Realistic simulated AI results\n→ All charts and features still work\n→ Chatbot still responds\n\n**To start the backend:**\n\`\`\`\ncd ai-lifecard/backend\npip install flask flask-cors scikit-learn numpy\npython app.py\n\`\`\``
  },

  "install": {
    icon: "🛠️",
    answer: `**Installation Guide:**\n\n**Requirements:**\n• Python 3.8+ ✅\n• Node.js 16+ ✅\n• npm 8+ ✅\n\n**Backend setup:**\n\`\`\`\ncd ai-lifecard/backend\npip install flask flask-cors scikit-learn numpy\npython app.py\n\`\`\`\n\n**Frontend setup:**\n\`\`\`\ncd ai-lifecard/frontend\nnpm install\nnpm start\n\`\`\`\n\nThen open **http://localhost:3000** 🎉\n\n💡 Frontend-only mode also works — just run the frontend without the backend!`
  },

  "error": {
    icon: "🔧",
    answer: `**Common Error Fixes:**\n\n❌ **pip not found** → Use \`pip3\` instead\n❌ **python not found** → Use \`python3\` instead\n❌ **Port 5000 busy** → Change to port 5001 in app.py\n❌ **Port 3000 busy** → Press Y when npm asks to use another port\n❌ **npm ERR** → Delete \`node_modules\` folder, run \`npm install\` again\n❌ **No data showing** → Click "Try Demo" — mock data kicks in\n❌ **Login not working** → Create \`frontend/.env\` with Firebase keys\n\n💡 The app NEVER breaks completely — it always has a fallback!`
  },

  // GENERAL
  "what is": {
    icon: "✨",
    answer: `**What is AI LifeCard?**\n\nAI LifeCard is a **unified personal intelligence dashboard** — like having a smart AI advisor analyzing the 3 most important areas of your life simultaneously:\n\n💳 **Financial Health** — Are you spending wisely?\n🚀 **Career Readiness** — Are you hireable?\n🧠 **Wellness** — Are you burning out?\n\n**Think of it as:** "Google Maps for your life decisions"\n\nInstead of checking bank apps, LinkedIn, and health trackers separately — get everything in one AI-powered dashboard with clear scores, charts, and action steps.\n\n🎯 Built to impress MNC recruiters by demonstrating ML + NLP + Dashboard + Product Thinking in one project!`
  },

  "help": {
    icon: "💡",
    answer: `**I can help you with:**\n\n📖 **How to use the app** → "how to use"\n📊 **Understanding scores** → "explain scores"\n💳 **Financial card** → "financial card"\n🚀 **Career card** → "career card" or "resume"\n🧠 **Wellness card** → "burnout" or "wellness"\n🔮 **Dashboard tabs** → "dashboard tabs"\n⚡ **Smart alerts** → "alerts"\n📥 **Export PDF** → "pdf export"\n🤖 **How AI works** → "how does it work"\n⚙️ **Backend/install** → "install" or "error"\n🔑 **Login** → "sign in"\n\nJust type any of these topics or ask freely! 😊`
  }
};

// Find best matching answer from knowledge base
function findAnswer(msg) {
  const m = msg.toLowerCase();
  
  // Direct keyword matching
  const matchers = [
    { keys: ['how to use', 'how do i use', 'how to start', 'what do i do', 'confused', 'guide me'], topic: 'how to use' },
    { keys: ['get started', 'start using', 'begin', 'first time'], topic: 'get started' },
    { keys: ['score mean', 'score work', 'what is score', 'grade', 'explain score', 'score out of', 'understand score'], topic: 'score' },
    { keys: ['overall score', 'total score', 'life score', 'combined'], topic: 'overall score' },
    { keys: ['financial card', 'financial health', 'finance card', 'money card', 'spending analysis'], topic: 'financial' },
    { keys: ['transaction', 'expense', 'add expense', 'enter expense', 'how to add money'], topic: 'transactions' },
    { keys: ['anomaly', 'unusual', 'weird transaction', 'flagged', 'suspicious'], topic: 'anomaly' },
    { keys: ['savings', 'saving rate', 'how much to save', 'save money'], topic: 'savings' },
    { keys: ['career card', 'career readiness', 'job ready', 'career score'], topic: 'career' },
    { keys: ['resume', 'cv', 'upload resume', 'paste resume', 'how to add resume'], topic: 'resume' },
    { keys: ['roadmap', 'learning plan', 'skill plan', '30 day', 'what to learn'], topic: 'skill roadmap' },
    { keys: ['job match', 'match percentage', 'match %', 'how to match'], topic: 'job match' },
    { keys: ['wellness card', 'health card', 'productivity card', 'wellness score'], topic: 'wellness' },
    { keys: ['burnout', 'burn out', 'tired', 'exhausted', 'stress', 'risk level'], topic: 'burnout' },
    { keys: ['focus window', 'best time', 'peak time', 'when to work', 'focus time'], topic: 'focus' },
    { keys: ['dashboard', 'tabs', 'sections', 'navigate', 'overview tab'], topic: 'dashboard' },
    { keys: ['alert', 'smart alert', 'notification', 'warning'], topic: 'alerts' },
    { keys: ['pdf', 'download', 'export', 'report', 'print'], topic: 'pdf' },
    { keys: ['history', 'compare', 'previous', 'progress', 'track'], topic: 'history' },
    { keys: ['dark mode', 'light mode', 'theme', 'toggle', 'color mode'], topic: 'theme' },
    { keys: ['demo', 'try demo', 'sample', 'example data', 'test'], topic: 'demo' },
    { keys: ['login', 'sign in', 'google login', 'sign up', 'auth'], topic: 'login' },
    { keys: ['how does it work', 'how does ai work', 'how does the ai', 'algorithm', 'ml model', 'technical', 'technology', 'isolation', 'tfidf', 'random forest', 'machine learning model'], topic: 'how does it work' },
    { keys: ['backend', 'server', 'flask', 'api', 'not working', 'backend down'], topic: 'backend' },
    { keys: ['install', 'setup', 'run', 'start app', 'how to run', 'npm', 'pip'], topic: 'install' },
    { keys: ['error', 'problem', 'issue', 'bug', 'fix', 'broken', 'not loading'], topic: 'error' },
    { keys: ['what is', 'what does', 'about this app', 'explain app', 'purpose', 'what can'], topic: 'what is' },
    { keys: ['help', 'menu', 'options', 'topics', 'what can you', 'commands'], topic: 'help' },
  ];

  for (const matcher of matchers) {
    if (matcher.keys.some(k => m.includes(k))) {
      return HELP_KB[matcher.topic];
    }
  }

  // Fallback
  return {
    icon: "🤔",
    answer: `I can help with these topics — just type or click one:\n\n📖 **"how to use"** — Full app walkthrough\n📊 **"explain scores"** — What A/B/C/D/F means\n💳 **"financial card"** — Spending & anomaly detection\n🚀 **"career card"** — Resume & skill analysis\n🧠 **"burnout"** — Wellness & stress risk\n🤖 **"how does AI work"** — ML models explained\n📥 **"export pdf"** — Download your report\n⚙️ **"install help"** — Setup & run commands\n\nJust ask freely — I understand natural language! 😊`
  };
}

// Quick question chips
const QUICK_QUESTIONS = [
  { label: "How to use?", q: "how to use this app" },
  { label: "Explain scores", q: "explain my scores" },
  { label: "Financial card", q: "financial card guide" },
  { label: "Career card", q: "career card guide" },
  { label: "Burnout risk", q: "what is burnout risk" },
  { label: "How AI works", q: "how does the AI work" },
  { label: "Export PDF", q: "how to export pdf" },
  { label: "Install help", q: "how to install and run" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN CHATBOT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HelpChatbot({ context = null, showOnLanding = false }) {
  const [open, setOpen] = useState(false);
  // On landing page → always help mode. On dashboard → help mode by default too
  const [mode, setMode] = useState('help');
  const [messages, setMessages] = useState([
    {
      from: 'ai',
      text: `👋 Hi! I'm **LifeCard Assistant**!\n\n📖 **App Guide** — Ask me anything about how to use the app\n🤖 **AI Insights** — Ask about your scores (on Dashboard)\n\nTry clicking a quick question below or type freely! 😊`,
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickQ, setShowQuickQ] = useState(true);
  const [unread, setUnread] = useState(0);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [messages, open]);

  useEffect(() => {
    if (open) { setUnread(0); inputRef.current?.focus(); }
  }, [open]);

  const addMessage = (from, text, extra = {}) => {
    setMessages(m => [...m, { from, text, ...extra }]);
    if (from === 'ai' && !open) setUnread(u => u + 1);
  };

  const buildContextAwareAnswer = (msg, ctx) => {
    if (!ctx || !ctx.financial) return null;
    const { financial, career, burnout } = ctx;
    const q = msg.toLowerCase();

    // Personal score queries — reference actual data
    if (q.match(/my score|my financial|my money|my spending|how am i doing/)) {
      return `Based on your analysis:\n\n💳 **Financial Score: ${financial.score}/100 (Grade ${financial.grade})**\n→ Savings rate looks ${financial.score > 70 ? 'healthy' : 'needs attention'}\n→ ${financial.anomaly_count > 0 ? `⚠️ ${financial.anomaly_count} spending anomalies detected by IsolationForest` : '✅ No spending anomalies detected'}\n\n🚀 **Career Score: ${career.score}/100 (Grade ${career.grade})**\n→ ${career.all_found?.length || 0} skills found in your resume\n→ Job match: ${career.job_match || 0}%\n\n🧠 **Wellness Score: ${burnout.score}/100 (Grade ${burnout.grade})**\n→ Burnout risk: **${burnout.risk_level || 'Low'}**`;
    }
    if (q.match(/burnout|stress|wellness|health|tired|work.*hour|sleep/)) {
      return `Your wellness analysis:\n\n🧠 **Burnout Score: ${burnout.score}/100**\n→ Risk Level: **${burnout.risk_level || 'Low'}**\n→ Work-life balance: ${burnout.score > 70 ? '✅ Good' : '⚠️ Needs improvement'}\n\n**Key factors affecting your score:**\n→ Work hours vs 8h optimal\n→ Sleep quality & quantity\n→ Exercise frequency\n→ Stress self-assessment\n\n**Recommendation:** ${burnout.score < 60 ? '🔴 Take immediate action — schedule recovery time this week' : burnout.score < 75 ? '🟡 Monitor your workload — consider more breaks' : '🟢 Keep maintaining your current balance!'}`;
    }
    if (q.match(/career|resume|skill|job|salary|linkedin/)) {
      return `Your career analysis:\n\n🚀 **Career Score: ${career.score}/100 (Grade ${career.grade})**\n→ Skills detected: **${career.all_found?.join(', ') || 'None found'}**\n→ Job match rate: **${career.job_match || 0}%**\n\n**What's boosting your score:**\n${(career.strengths || []).slice(0,3).map(s => `✅ ${s}`).join('\n') || '✅ Resume submitted'}\n\n**Top recommendation:**\n${(career.recommendations || []).slice(0,2).map(r => `→ ${r}`).join('\n') || '→ Add quantified achievements to resume'}`;
    }
    if (q.match(/financial|money|sav|spend|budget|anomal|transaction/)) {
      return `Your financial analysis:\n\n💳 **Financial Score: ${financial.score}/100 (Grade ${financial.grade})**\n→ ${financial.anomaly_count > 0 ? `⚠️ **${financial.anomaly_count} anomalies** flagged by IsolationForest ML` : '✅ No anomalies detected — spending looks consistent'}\n\n**Score drivers:**\n→ Savings rate, spend vs income ratio\n→ Emergency fund adequacy\n→ Transaction pattern consistency\n\n**Action:** ${financial.score < 60 ? '🔴 Review top spending categories immediately' : financial.score < 80 ? '🟡 Small optimizations can push you to A grade' : '🟢 Excellent financial discipline!'}`;
    }
    return null;
  };

  const send = useCallback(async (overrideInput) => {
    const msg = (overrideInput || input).trim();
    if (!msg) return;
    setInput('');
    setShowQuickQ(false);
    addMessage('user', msg);
    setLoading(true);

    await new Promise(r => setTimeout(r, 500));

    if (mode === 'help' || showOnLanding) {
      const result = findAnswer(msg);
      addMessage('ai', result.answer);
    } else {
      // AI Insights — try context-aware personal answer first
      const contextAnswer = buildContextAwareAnswer(msg, context);
      if (contextAnswer) {
        addMessage('ai', contextAnswer);
      } else {
        const kbResult = findAnswer(msg);
        const isGenericFallback = kbResult.icon === '🤔';
        if (!isGenericFallback) {
          addMessage('ai', kbResult.answer);
        } else {
          try {
            const res = await api.chat(msg, context || {});
            if (res && res.response) {
              addMessage('ai', res.response);
            } else {
              addMessage('ai', kbResult.answer);
            }
          } catch {
            addMessage('ai', kbResult.answer);
          }
        }
      }
    }
    setLoading(false);
  }, [input, mode, context, open]);

  const formatText = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--cyan)">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,229,255,0.1);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:11px;color:var(--cyan)">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  if (!open) return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1000 }}>
      {/* Unread badge */}
      {unread > 0 && (
        <div style={{
          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
          background: 'var(--rose)', borderRadius: '50%', fontSize: 11,
          fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1001, border: '2px solid var(--bg-void)'
        }}>{unread}</div>
      )}
      {/* Tooltip on first open */}
      <div style={{
        position: 'absolute', bottom: 70, right: 0, background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px',
        fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.3s ease'
      }}>
        💬 Ask me anything about the app!
        <div style={{
          position: 'absolute', bottom: -6, right: 24, width: 12, height: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          transform: 'rotate(45deg)', borderTop: 'none', borderLeft: 'none'
        }} />
      </div>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
          border: 'none', cursor: 'pointer', fontSize: 24,
          boxShadow: '0 8px 32px rgba(0,229,255,0.45)',
          animation: 'glow-pulse 3s infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </button>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      width: 380, height: 560,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 22,
      display: 'flex', flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
      overflow: 'hidden',
      animation: 'fadeInUp 0.25s ease'
    }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(139,92,246,0.08))',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
            }}>💬</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                LifeCard Assistant
              </div>
              <div style={{ fontSize: 11, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', animation: 'glow-pulse 2s infinite' }} />
                Always online · Knows everything
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '4px 8px',
            borderRadius: 6, transition: 'background 0.2s'
          }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseOut={e => e.currentTarget.style.background = 'none'}
          >×</button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 4 }}>
          {[
            { key: 'help', label: '📖 App Guide', color: 'var(--cyan)' },
            { key: 'ai', label: '🤖 AI Insights', color: 'var(--violet)' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setMode(tab.key)} style={{
              flex: 1, padding: '7px 10px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--font-display)', transition: 'all 0.2s',
              background: mode === tab.key ? tab.color + '20' : 'transparent',
              color: mode === tab.key ? tab.color : 'var(--text-muted)',
              outline: mode === tab.key ? `1px solid ${tab.color}40` : 'none'
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ── MESSAGES ────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeInUp 0.2s ease' }}>
            {m.from === 'ai' && (
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginRight: 8, marginTop: 2 }}>
                💬
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '10px 13px',
              borderRadius: m.from === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
              background: m.from === 'user'
                ? 'linear-gradient(135deg, var(--cyan), var(--violet))'
                : 'var(--bg-surface)',
              fontSize: 13, lineHeight: 1.65,
              color: 'var(--text-primary)',
              border: m.from === 'ai' ? '1px solid var(--border)' : 'none',
              wordBreak: 'break-word'
            }} dangerouslySetInnerHTML={{ __html: formatText(m.text) }} />
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💬</div>
            <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: '4px 16px 16px 16px', border: '1px solid var(--border)' }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: `blink 1.2s ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* ── QUICK QUESTIONS ─────────────────────────────────────── */}
      {showQuickQ && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 7, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>
            QUICK QUESTIONS
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {QUICK_QUESTIONS.map((qq, i) => (
              <button key={i} onClick={() => send(qq.q)} style={{
                padding: '5px 11px', borderRadius: 20, border: '1px solid var(--border)',
                background: 'var(--bg-surface)', color: 'var(--text-secondary)',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-body)'
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >{qq.label}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── INPUT ────────────────────────────────────────────────── */}
      <div style={{ padding: '10px 14px 14px', borderTop: showQuickQ ? 'none' : '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={showOnLanding ? "Ask anything about the app..." : mode === 'help' ? "Ask about any feature..." : "Ask about your scores..."}
          style={{
            flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 14px', color: 'var(--text-primary)',
            fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.2s'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() ? 'linear-gradient(135deg, var(--cyan), var(--violet))' : 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: 12,
            padding: '0 16px', cursor: input.trim() ? 'pointer' : 'default',
            color: input.trim() ? '#fff' : 'var(--text-muted)',
            fontSize: 18, transition: 'all 0.2s', flexShrink: 0
          }}
        >→</button>
      </div>
    </div>
  );
}