import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import { api } from './utils/api';
import { ThemeProvider, ThemeToggle } from './contexts/ThemeContext';
import { signInWithGoogle, signOutUser, onAuthChange } from './utils/firebase';
import ResumeUploader from './components/ResumeUploader';

function AppInner() {
  const [page, setPage] = useState('landing');
  const [lifecardData, setLifecardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lc_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const unsub = onAuthChange((u) => setUser(u));
    return unsub;
  }, []);

  const navigate = (p) => setPage(p);

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try { const u = await signInWithGoogle(); setUser(u); }
    catch (e) { console.error(e); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { await signOutUser(); setUser(null); };

  const runAnalysis = useCallback(async (formData) => {
    setLoading(true);
    try {
      const result = await api.analyzeFull(formData);
      setLifecardData(result);
      const entry = { timestamp: new Date().toISOString(), data: result };
      const newHistory = [entry, ...history].slice(0, 3);
      setHistory(newHistory);
      try { localStorage.setItem('lc_history', JSON.stringify(newHistory)); } catch {}
      setPage('dashboard');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [history]);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    const demoData = {
      financial: {
        income: 75000, savings: 8000,
        transactions: [
          { amount: 2200, category: 'Rent', desc: 'Monthly rent' },
          { amount: 450, category: 'Food', desc: 'Groceries' },
          { amount: 320, category: 'Entertainment', desc: 'Subscriptions & dining' },
          { amount: 180, category: 'Transport', desc: 'Uber & metro' },
          { amount: 890, category: 'Shopping', desc: 'Online shopping' },
          { amount: 4800, category: 'Shopping', desc: 'Laptop purchase' },
          { amount: 95, category: 'Utilities', desc: 'Electric bill' },
          { amount: 1200, category: 'Shopping', desc: 'Clothes' },
          { amount: 350, category: 'Food', desc: 'Restaurants' },
          { amount: 220, category: 'Transport', desc: 'Monthly pass' },
        ]
      },
      career: {
        resume_text: `Software Engineer with 3 years experience building scalable web applications using React, Python, and PostgreSQL. Led a team of 4 to deliver a product that increased user engagement by 45%. Proficient in SQL, Node.js, and REST APIs. B.Tech Computer Science from VIT University. Built and deployed Docker containers on AWS EC2. Implemented CI/CD pipelines that reduced deployment time by 60%. Strong communication and agile experience.`,
        target_role: 'Senior Software Engineer',
        experience_years: 3
      },
      burnout: { work_hours_per_day: 9.5, sleep_hours: 6.5, exercise_days_per_week: 2, stress_level: 7, breaks_per_day: 2, weekend_work: true }
    };
    await runAnalysis(demoData);
    setLoading(false);
  }, [runAnalysis]);

  const authProps = { user, authLoading, onLogin: handleGoogleLogin, onLogout: handleLogout };

  return (
    <div>
      {page === 'landing' && <LandingPage onStart={() => navigate('input')} onDemo={loadDemo} loading={loading} auth={authProps} />}
      {page === 'input' && <InputPage onAnalyze={runAnalysis} loading={loading} onBack={() => navigate('landing')} auth={authProps} />}
      {page === 'dashboard' && <Dashboard data={lifecardData} history={history} onBack={() => navigate('landing')} onReAnalyze={() => navigate('input')} auth={authProps} />}
    </div>
  );
}

export default function App() {
  return <ThemeProvider><AppInner /></ThemeProvider>;
}

// ─── INPUT PAGE ───────────────────────────────────────────────────────────────
function InputPage({ onAnalyze, loading, onBack, auth = {} }) {
  const [tab, setTab] = useState(0);
  const [fin, setFin] = useState({ income: '', savings: '', transactions: [] });
  const [txText, setTxText] = useState('');
  const [career, setCareer] = useState({ resume_text: '', target_role: '', experience_years: 2 });
  const [burn, setBurn] = useState({ work_hours_per_day: 8, sleep_hours: 7, exercise_days_per_week: 3, stress_level: 5, breaks_per_day: 3, weekend_work: false });
  const [resumeMode, setResumeMode] = useState('paste');

  const tabs = ['💳 Financial', '🚀 Career', '🧠 Wellness'];

  const handleSubmit = () => {
    let txList = [];
    if (txText.trim()) {
      txList = txText.trim().split('\n').map(line => {
        const parts = line.split(',');
        return { amount: parseFloat(parts[0]) || 0, category: (parts[1] || 'Other').trim(), desc: (parts[2] || '').trim() };
      }).filter(t => t.amount > 0);
    }
    onAnalyze({
      financial: { ...fin, income: parseFloat(fin.income) || 50000, savings: parseFloat(fin.savings) || 0, transactions: txList },
      career,
      burnout: burn
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)', top: '-200px', left: '-100px' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', bottom: '-150px', right: '-100px' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto 24px' }}>← Back</button>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Configure Your <span style={{ color: 'var(--cyan)' }}>LifeCard</span></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Fill in your details for personalized AI insights</p>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--bg-surface)', padding: 6, borderRadius: 12, border: '1px solid var(--border)' }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{
              flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: 600, fontFamily: 'var(--font-display)', transition: 'all 0.2s',
              background: tab === i ? 'linear-gradient(135deg, var(--cyan), var(--violet))' : 'transparent',
              color: tab === i ? '#fff' : 'var(--text-secondary)'
            }}>{t}</button>
          ))}
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32 }}>
          {tab === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--cyan)', marginBottom: 4 }}>Financial Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Monthly Income ($)" value={fin.income} onChange={v => setFin({...fin, income: v})} placeholder="75000" type="number" />
                <FormField label="Current Savings ($)" value={fin.savings} onChange={v => setFin({...fin, savings: v})} placeholder="8000" type="number" />
              </div>
              <div>
                <label style={labelStyle}>Transactions (amount, category, description — one per line)</label>
                <textarea value={txText} onChange={e => setTxText(e.target.value)}
                  placeholder={"2200, Rent, Monthly rent\n450, Food, Groceries\n320, Entertainment, Netflix"}
                  style={textareaStyle} />
              </div>
            </div>
          )}
          {tab === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--violet)', marginBottom: 4 }}>Career Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Target Role" value={career.target_role} onChange={v => setCareer({...career, target_role: v})} placeholder="Senior Software Engineer" />
                <FormField label="Years of Experience" value={career.experience_years} onChange={v => setCareer({...career, experience_years: v})} type="number" placeholder="3" />
              </div>
              <div>
                <label style={labelStyle}>Resume Input Method</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[['paste', '📝 Paste Text'], ['upload', '📄 Upload PDF / DOCX']].map(([mode, label]) => (
                    <button key={mode} onClick={() => setResumeMode(mode)} style={{
                      flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                      border: `1px solid ${resumeMode === mode ? 'var(--violet)' : 'var(--border)'}`,
                      background: resumeMode === mode ? 'var(--violet-dim)' : 'transparent',
                      color: resumeMode === mode ? 'var(--violet)' : 'var(--text-secondary)'
                    }}>{label}</button>
                  ))}
                </div>
                {resumeMode === 'paste' ? (
                  <textarea value={career.resume_text} onChange={e => setCareer({...career, resume_text: e.target.value})}
                    placeholder="Paste your resume text here — include skills, experience, education, and measurable achievements..."
                    style={{ ...textareaStyle, minHeight: 160 }} />
                ) : (
                  <ResumeUploader onTextExtracted={(text) => { if (text) setCareer({ ...career, resume_text: text }); }} />
                )}
              </div>
            </div>
          )}
          {tab === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--emerald)', marginBottom: 4 }}>Wellness Profile</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Work Hours / Day" value={burn.work_hours_per_day} onChange={v => setBurn({...burn, work_hours_per_day: parseFloat(v)})} type="number" step="0.5" />
                <FormField label="Sleep Hours / Night" value={burn.sleep_hours} onChange={v => setBurn({...burn, sleep_hours: parseFloat(v)})} type="number" step="0.5" />
                <FormField label="Exercise Days / Week" value={burn.exercise_days_per_week} onChange={v => setBurn({...burn, exercise_days_per_week: parseInt(v)})} type="number" min="0" max="7" />
                <div>
                  <label style={labelStyle}>Stress Level: <span style={{ color: 'var(--rose)', fontWeight: 800 }}>{burn.stress_level}/10</span></label>
                  <input type="range" min="1" max="10" value={burn.stress_level} onChange={e => setBurn({...burn, stress_level: parseInt(e.target.value)})} style={{ width: '100%', accentColor: 'var(--rose)', marginTop: 8 }} />
                </div>
                <FormField label="Breaks Per Day" value={burn.breaks_per_day} onChange={v => setBurn({...burn, breaks_per_day: parseInt(v)})} type="number" min="0" max="10" />
                <div>
                  <label style={labelStyle}>Work on Weekends?</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                    {['Yes', 'No'].map(opt => (
                      <button key={opt} onClick={() => setBurn({...burn, weekend_work: opt === 'Yes'})} style={{
                        flex: 1, padding: '12px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
                        borderColor: (opt === 'Yes') === burn.weekend_work ? 'var(--rose)' : 'var(--border)',
                        background: (opt === 'Yes') === burn.weekend_work ? 'rgba(255,75,125,0.1)' : 'transparent',
                        color: (opt === 'Yes') === burn.weekend_work ? 'var(--rose)' : 'var(--text-secondary)'
                      }}>{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center' }}>
          {tab > 0 && <button className="btn-ghost" onClick={() => setTab(t => t - 1)}>← Previous</button>}
          {tab < 2
            ? <button className="btn-primary" onClick={() => setTab(t => t + 1)} style={{ minWidth: 160 }}>Next →</button>
            : <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: 220, opacity: loading ? 0.7 : 1 }}>
                {loading ? '⚡ Analyzing with AI...' : '🚀 Generate My LifeCard'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text', min, max, step }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} min={min} max={max} step={step} style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  );
}

const labelStyle = { fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 };
const inputStyle = { width: '100%', padding: '12px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s', fontFamily: 'var(--font-body)' };
const textareaStyle = { width: '100%', minHeight: 120, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-body)', resize: 'vertical', outline: 'none' };
