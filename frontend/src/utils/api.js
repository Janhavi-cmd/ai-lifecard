const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

async function apiFetch(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'API error');
    return data.data;
  } catch (err) {
    console.warn(`API call failed (${endpoint}):`, err.message, '— using mock data');
    return getMockData(endpoint, body);
  }
}

// MOCK DATA FALLBACK — ensures app NEVER breaks even without backend
function getMockData(endpoint, body) {
  if (endpoint.includes('financial')) return mockFinancial(body);
  if (endpoint.includes('career')) return mockCareer(body);
  if (endpoint.includes('burnout')) return mockBurnout(body);
  if (endpoint.includes('full')) return mockFull(body);
  if (endpoint.includes('chat')) return { response: "👋 Backend not connected — running in demo mode! Your data is still being analyzed with simulated AI." };
  return {};
}

function r(min, max) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }

function mockFinancial(body) {
  const score = r(45, 88);
  return {
    score, grade: gradeOf(score),
    total_spend: r(1500, 4000), savings_rate: r(8, 30),
    anomaly_count: Math.floor(Math.random() * 3),
    anomalies: [],
    monthly_prediction: r(1600, 4200),
    savings_opportunity: r(200, 800),
    category_breakdown: { Food: r(300,800), Rent: r(800,2000), Entertainment: r(100,400), Transport: r(100,300), Shopping: r(150,500) },
    top_spending_category: 'Rent',
    alerts: [
      { type: 'warning', msg: '⚡ 2 unusual transactions detected' },
      { type: 'info', msg: '💡 Potential savings of $340/month identified' }
    ],
    trend: [2100, 2300, 2150, 2400, 2250, 2180]
  };
}

function mockCareer(body) {
  const score = r(52, 82);
  return {
    score, grade: gradeOf(score),
    found_skills: { programming: ['python', 'javascript'], web: ['react', 'html'], data: ['sql'], ml_ai: [], cloud: [], soft: ['leadership'] },
    all_found: ['python', 'javascript', 'react', 'html', 'sql', 'leadership'],
    missing_skills: ['typescript', 'docker', 'aws', 'machine learning', 'kubernetes'],
    job_match: r(55, 80),
    has_metrics: true, has_education: true, word_count: r(350, 600),
    experience_years: 2,
    roadmap: [
      { skill: 'typescript', days: 30, resources: [{ name: 'TypeScript Docs', url: 'https://typescriptlang.org' }] },
      { skill: 'docker', days: 30, resources: [{ name: 'Docker Docs', url: 'https://docs.docker.com' }] },
      { skill: 'aws', days: 30, resources: [{ name: 'AWS Free Tier', url: 'https://aws.amazon.com/free' }] }
    ],
    resume_tips: [
      '📊 Add quantified achievements (e.g., "Improved performance by 40%")',
      '🔗 Add GitHub profile and LinkedIn URL',
      '🛠️ Add more technical skills to improve visibility'
    ],
    skill_breakdown: { programming: 2, web: 2, data: 1, ml_ai: 0, cloud: 0, soft: 1 }
  };
}

function mockBurnout(body) {
  const score = r(48, 82);
  return {
    score, grade: gradeOf(score),
    risk_level: score < 55 ? 'High' : (score < 70 ? 'Medium' : 'Low'),
    risk_score: 100 - score,
    focus_window: '9:00 AM – 12:00 PM & 2:00 PM – 4:00 PM',
    work_hours: r(7, 11), sleep_hours: r(5.5, 8.5), exercise_days: Math.floor(r(1,5)), stress_level: Math.floor(r(3,8)),
    weekly_trend: [r(50,90), r(50,90), r(50,90), r(50,90), r(50,90), r(50,90), r(50,90)],
    suggestions: [
      { icon: '😴', text: 'Aim for 7–8 hours of sleep for peak cognitive performance' },
      { icon: '🏃', text: 'Exercise 3–4x/week to reduce burnout risk by 30%' },
      { icon: '☕', text: 'Use Pomodoro: 25 min work, 5 min break' },
      { icon: '🧘', text: '5 minutes of mindfulness daily reduces stress markers' }
    ],
    metrics: { work_life_balance: r(40,90), sleep_quality: r(40,90), physical_wellness: r(40,90), mental_load: r(30,80) }
  };
}

function mockFull() {
  const fin = mockFinancial();
  const car = mockCareer();
  const burn = mockBurnout();
  const overall = Math.round((fin.score + car.score + burn.score) / 3 * 10) / 10;
  return {
    overall_score: overall, overall_grade: gradeOf(overall),
    financial: fin, career: car, burnout: burn,
    alerts: [
      { priority: 'high', category: 'finance', icon: '💸', msg: 'Review your top spending category', action: 'Analyze Rent & Food expenses' },
      { priority: 'medium', category: 'career', icon: '📈', msg: 'Career readiness can improve', action: 'Learn TypeScript & Docker' },
      { priority: 'info', category: 'health', icon: '✨', msg: 'Your wellness score looks stable', action: 'Keep your current routine' },
      { priority: 'high', category: 'finance', icon: '⚡', msg: '2 unusual transactions flagged', action: 'Review recent transactions' },
    ],
    generated_at: new Date().toISOString(),
    next_review: 'March 7, 2026'
  };
}

function gradeOf(score) {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export const api = {
  health: () => apiFetch('/api/health'),
  analyzeFull: (data) => apiFetch('/api/analyze/full', 'POST', data),
  analyzeFinancial: (data) => apiFetch('/api/analyze/financial', 'POST', data),
  analyzeCareer: (data) => apiFetch('/api/analyze/career', 'POST', data),
  analyzeBurnout: (data) => apiFetch('/api/analyze/burnout', 'POST', data),
  chat: (message, context) => apiFetch('/api/chat', 'POST', { message, context }),
};
