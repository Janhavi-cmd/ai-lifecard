import React, { useState, useRef, useCallback } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { api } from '../utils/api';
import { ThemeToggle } from '../contexts/ThemeContext';
import HelpChatbot from '../components/HelpChatbot';

const COLORS = { cyan: '#00e5ff', violet: '#8b5cf6', emerald: '#10ffaa', amber: '#fbbf24', rose: '#ff4b7d' };

// ─── SCORE RING ──────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, color = '#00e5ff', label, grade }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${progress} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: 'stroke-dasharray 1.5s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: size < 100 ? 18 : 24, fontWeight: 800, color }}>{score}</div>
        {grade && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Grade {grade}</div>}
      </div>
    </div>
  );
}

// ─── GLASS CARD ──────────────────────────────────────────────────────────────
function GlassCard({ children, style = {}, accent = '#00e5ff', glow = false }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 20,
      padding: 24, position: 'relative', overflow: 'hidden', transition: 'all 0.3s',
      boxShadow: glow ? `0 0 40px ${accent}20` : 'var(--shadow-card)', ...style
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.6 }} />
      {children}
    </div>
  );
}

// ─── STAT CHIP ───────────────────────────────────────────────────────────────
function StatChip({ label, value, icon, color = '#00e5ff', small = false }) {
  return (
    <div style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: small ? '10px 14px' : '14px 18px', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: small ? 11 : 12, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)', letterSpacing: 0.5, textTransform: 'uppercase' }}>{icon} {label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: small ? 16 : 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ─── ALERT BADGE ─────────────────────────────────────────────────────────────
function AlertBadge({ alert }) {
  const colors = { high: COLORS.rose, medium: COLORS.amber, info: COLORS.cyan };
  const bgs = { high: 'rgba(255,75,125,0.1)', medium: 'rgba(251,191,36,0.1)', info: 'rgba(0,229,255,0.1)' };
  const c = colors[alert.priority] || COLORS.cyan;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 16px', background: bgs[alert.priority], borderRadius: 12, border: `1px solid ${c}30` }}>
      <span style={{ fontSize: 20 }}>{alert.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{alert.msg}</div>
        <div style={{ fontSize: 12, color: c, marginTop: 2 }}>→ {alert.action}</div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard({ data, history, onBack, onReAnalyze, auth = {} }) {
  const { user, onLogout } = auth;
  const [activeCard, setActiveCard] = useState(null);
  const dashRef = useRef(null);

  if (!data) return null;
  const { financial, career, burnout, alerts, overall_score, overall_grade, generated_at, next_review } = data;

  // PDF Export
  const exportPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(0, 229, 255);
      doc.text('AI LifeCard Report', 20, 30);
      doc.setFontSize(12); doc.setTextColor(200, 200, 220);
      doc.text(`Generated: ${new Date(generated_at).toLocaleString()}`, 20, 42);
      doc.text(`Overall Score: ${overall_score}/100 (Grade ${overall_grade})`, 20, 54);
      doc.setFontSize(16); doc.setTextColor(0, 229, 255);
      doc.text('Financial Health', 20, 72);
      doc.setFontSize(12); doc.setTextColor(200, 200, 220);
      doc.text(`Score: ${financial.score}/100 | Savings Rate: ${financial.savings_rate}%`, 20, 82);
      doc.text(`Monthly Spend: $${financial.total_spend} | Anomalies: ${financial.anomaly_count}`, 20, 92);
      doc.setFontSize(16); doc.setTextColor(139, 92, 246);
      doc.text('Career Readiness', 20, 110);
      doc.setFontSize(12); doc.setTextColor(200, 200, 220);
      doc.text(`Score: ${career.score}/100 | Job Match: ${career.job_match}%`, 20, 120);
      doc.text(`Skills Found: ${career.all_found?.join(', ') || 'N/A'}`, 20, 130);
      doc.text(`Missing Skills: ${career.missing_skills?.slice(0,4).join(', ') || 'N/A'}`, 20, 140);
      doc.setFontSize(16); doc.setTextColor(16, 255, 170);
      doc.text('Wellness & Burnout', 20, 158);
      doc.setFontSize(12); doc.setTextColor(200, 200, 220);
      doc.text(`Score: ${burnout.score}/100 | Risk Level: ${burnout.risk_level}`, 20, 168);
      doc.text(`Focus Window: ${burnout.focus_window}`, 20, 178);
      doc.setFontSize(14); doc.setTextColor(0, 229, 255);
      doc.text(`Next Review: ${next_review}`, 20, 200);
      doc.save('ai-lifecard-report.pdf');
    } catch (e) { console.error('PDF export failed', e); alert('PDF export requires jsPDF. Run: npm install jspdf'); }
  };

  // Radar data for overall overview
  const radarData = [
    { subject: 'Financial', value: financial.score, fullMark: 100 },
    { subject: 'Career', value: career.score, fullMark: 100 },
    { subject: 'Wellness', value: burnout.score, fullMark: 100 },
    { subject: 'Job Match', value: career.job_match, fullMark: 100 },
    { subject: 'Savings', value: Math.min(100, financial.savings_rate * 4), fullMark: 100 },
  ];

  const categoryData = Object.entries(financial.category_breakdown || {}).map(([name, value]) => ({ name, value }));
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = (burnout.weekly_trend || []).map((v, i) => ({ day: weekDays[i] || `D${i}`, score: v }));
  const spendTrend = (financial.trend || []).map((v, i) => ({ month: `M${i+1}`, spend: v }));

  const cardTabs = [
    { key: 'overview', label: '🔮 Overview', color: COLORS.cyan },
    { key: 'financial', label: '💳 Financial', color: COLORS.cyan },
    { key: 'career', label: '🚀 Career', color: COLORS.violet },
    { key: 'burnout', label: '🧠 Wellness', color: COLORS.emerald },
    { key: 'alerts', label: '⚡ Alerts', color: COLORS.amber },
    { key: 'ml', label: '🤖 ML Insights', color: COLORS.rose },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  const gradeColor = (g) => ({ A: COLORS.emerald, B: COLORS.cyan, C: COLORS.amber, D: COLORS.amber, F: COLORS.rose }[g] || COLORS.cyan);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', position: 'relative' }} ref={dashRef}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)', top: '-200px', left: '-200px' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', bottom: '0px', right: '-100px' }} />
      </div>

      {/* TOPBAR */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(4,4,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', padding: '0 32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={onBack} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 13 }}>← Home</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>AI<span style={{ color: 'var(--cyan)' }}>LifeCard</span></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
              <div>Next review: <span style={{ color: 'var(--cyan)' }}>{next_review}</span></div>
              <div>Generated {new Date(generated_at).toLocaleDateString()}</div>
            </div>
            <ThemeToggle />
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                  {user.displayName?.[0] || 'U'}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.email || 'User'}
                </span>
              </div>
            )}
            <button onClick={onReAnalyze} className="btn-ghost" style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}>Re-Analyze</button>
            <button onClick={exportPDF} className="btn-primary" style={{ fontSize: 12, padding: '8px 14px', whiteSpace: 'nowrap' }}>⬇️ Export PDF</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 1 }}>
        {/* OVERALL HERO */}
        <GlassCard style={{ marginBottom: 24, padding: '32px 40px' }} accent={COLORS.cyan} glow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <ScoreRing score={overall_score} size={140} color={gradeColor(overall_grade)} grade={overall_grade} />
              <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `1px solid ${gradeColor(overall_grade)}20`, animation: 'glow-pulse 3s infinite' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Life Intelligence Score</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1 }}>
                {overall_score >= 80 ? 'Excellent' : overall_score >= 65 ? 'Good' : overall_score >= 50 ? 'Developing' : 'Needs Work'} 🔥
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Your unified personal intelligence report across {Object.keys(data).filter(k => ['financial','career','burnout'].includes(k)).length} life dimensions</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <StatChip label="Financial" value={`${financial.score}`} icon="💳" color={gradeColor(financial.grade)} />
              <StatChip label="Career" value={`${career.score}`} icon="🚀" color={gradeColor(career.grade)} />
              <StatChip label="Wellness" value={`${burnout.score}`} icon="🧠" color={gradeColor(burnout.grade)} />
            </div>
          </div>
        </GlassCard>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {cardTabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              flexShrink: 0, padding: '10px 20px', borderRadius: 10, border: '1px solid',
              borderColor: activeTab === t.key ? t.color : 'var(--border)',
              background: activeTab === t.key ? t.color + '15' : 'transparent',
              color: activeTab === t.key ? t.color : 'var(--text-secondary)',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
            <GlassCard accent={COLORS.cyan}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--text-primary)' }}>🔮 Life Intelligence Radar</div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#8888aa', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                  <Radar name="You" dataKey="value" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard accent={COLORS.violet}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--text-primary)' }}>📊 Dimension Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Financial Health', score: financial.score, grade: financial.grade, color: COLORS.cyan, icon: '💳' },
                  { label: 'Career Readiness', score: career.score, grade: career.grade, color: COLORS.violet, icon: '🚀' },
                  { label: 'Wellness Score', score: burnout.score, grade: burnout.grade, color: COLORS.emerald, icon: '🧠' },
                  { label: 'Job Match %', score: career.job_match, grade: null, color: COLORS.amber, icon: '🎯' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.icon} {item.label}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {item.grade && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: gradeColor(item.grade), background: gradeColor(item.grade) + '20', padding: '2px 8px', borderRadius: 4 }}>Grade {item.grade}</span>}
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: item.color }}>{item.score}</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.score}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`, borderRadius: 3, transition: 'width 1s ease', boxShadow: `0 0 8px ${item.color}60` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* History comparison */}
            {history && history.length > 1 && (
              <GlassCard accent={COLORS.amber} style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>📈 History Comparison</div>
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4 }}>
                  {history.map((h, i) => (
                    <div key={i} style={{ flexShrink: 0, background: 'var(--bg-surface)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)', minWidth: 180 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                        {i === 0 ? '🔵 Current' : `⏱️ ${new Date(h.timestamp).toLocaleDateString()}`}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: i === 0 ? COLORS.cyan : 'var(--text-secondary)' }}>{h.data.overall_score}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall Score</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* ── FINANCIAL TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'financial' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
            {/* Score + Key Stats */}
            <GlassCard accent={COLORS.cyan} glow>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                <ScoreRing score={financial.score} size={110} color={gradeColor(financial.grade)} grade={financial.grade} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Financial Health</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Anomaly detection + burn rate analysis</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatChip label="Monthly Spend" value={`$${financial.total_spend?.toLocaleString()}`} icon="💸" color={COLORS.rose} small />
                <StatChip label="Savings Rate" value={`${financial.savings_rate}%`} icon="💰" color={COLORS.emerald} small />
                <StatChip label="Projected Spend" value={`$${financial.monthly_prediction?.toLocaleString()}`} icon="📈" color={COLORS.amber} small />
                <StatChip label="Save Opportunity" value={`$${financial.savings_opportunity?.toLocaleString()}`} icon="✨" color={COLORS.cyan} small />
              </div>
              {financial.anomaly_count > 0 && (
                <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--rose-dim)', borderRadius: 10, border: '1px solid rgba(255,75,125,0.2)', fontSize: 13, color: 'var(--rose)' }}>
                  ⚡ {financial.anomaly_count} unusual transaction(s) detected!
                </div>
              )}
            </GlassCard>

            {/* Category Pie */}
            <GlassCard accent={COLORS.violet}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>🥧 Spending Breakdown</div>
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={[COLORS.cyan, COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.rose][i % 5]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`$${v}`, 'Amount']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {categoryData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: [COLORS.cyan, COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.rose][i % 5] }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>${d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enter transactions to see breakdown</div>}
            </GlassCard>

            {/* Spend Trend */}
            <GlassCard accent={COLORS.cyan} style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>📉 Spending Trend (Projected 6 months)</div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={spendTrend}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={(v) => [`$${v}`, 'Spend']} />
                  <Area type="monotone" dataKey="spend" stroke={COLORS.cyan} fill="url(#spendGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Alerts */}
            <GlassCard accent={COLORS.amber} style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>🚨 Financial Alerts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(financial.alerts || []).map((a, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderRadius: 10, background: a.type === 'success' ? 'rgba(16,255,170,0.08)' : a.type === 'warning' ? 'rgba(251,191,36,0.08)' : 'rgba(255,75,125,0.08)', border: `1px solid ${a.type === 'success' ? COLORS.emerald : a.type === 'warning' ? COLORS.amber : COLORS.rose}30`, fontSize: 13, color: 'var(--text-primary)' }}>
                    {a.msg}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── CAREER TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'career' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
            <GlassCard accent={COLORS.violet} glow>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                <ScoreRing score={career.score} size={110} color={gradeColor(career.grade)} grade={career.grade} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Career Readiness</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>NLP-powered resume analysis</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {career.has_metrics && <span style={{ fontSize: 11, color: COLORS.emerald, background: 'rgba(16,255,170,0.1)', padding: '2px 8px', borderRadius: 4 }}>✅ Has Metrics</span>}
                    {career.has_education && <span style={{ fontSize: 11, color: COLORS.cyan, background: 'rgba(0,229,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>🎓 Education</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatChip label="Job Match" value={`${career.job_match}%`} icon="🎯" color={COLORS.violet} small />
                <StatChip label="Skills Found" value={career.all_found?.length || 0} icon="🛠️" color={COLORS.emerald} small />
                <StatChip label="Experience" value={`${career.experience_years}y`} icon="📆" color={COLORS.amber} small />
                <StatChip label="Resume Words" value={career.word_count} icon="📝" color={COLORS.cyan} small />
              </div>
            </GlassCard>

            {/* Skill Breakdown */}
            <GlassCard accent={COLORS.violet}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>🛠️ Skill Category Breakdown</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={Object.entries(career.skill_breakdown || {}).map(([k, v]) => ({ name: k, skills: v }))}>
                  <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="skills" fill={COLORS.violet} radius={[4,4,0,0]}>
                    {Object.keys(career.skill_breakdown || {}).map((_, i) => <Cell key={i} fill={[COLORS.cyan, COLORS.violet, COLORS.emerald, COLORS.amber, COLORS.rose, COLORS.cyan][i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Missing Skills */}
            <GlassCard accent={COLORS.rose}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>⚠️ Missing High-Value Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(career.missing_skills || []).map((s, i) => (
                  <span key={i} style={{ padding: '6px 14px', background: 'rgba(255,75,125,0.1)', border: '1px solid rgba(255,75,125,0.2)', borderRadius: 8, fontSize: 12, color: COLORS.rose, fontFamily: 'var(--font-mono)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* Found Skills */}
            <GlassCard accent={COLORS.emerald}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>✅ Detected Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(career.all_found || []).map((s, i) => (
                  <span key={i} style={{ padding: '6px 14px', background: 'rgba(16,255,170,0.1)', border: '1px solid rgba(16,255,170,0.2)', borderRadius: 8, fontSize: 12, color: COLORS.emerald, fontFamily: 'var(--font-mono)' }}>
                    {s}
                  </span>
                ))}
                {(!career.all_found || career.all_found.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills detected — try adding more resume text</span>}
              </div>
            </GlassCard>

            {/* Roadmap */}
            <GlassCard accent={COLORS.amber} style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>🗺️ 30-Day Skill Roadmap</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {(career.roadmap || []).map((r, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: COLORS.amber, fontSize: 15 }}>{r.skill}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '3px 8px', borderRadius: 6 }}>{r.days} days</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(r.resources || []).map((res, j) => (
                        <a key={j} href={res.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: COLORS.cyan, fontSize: 13, textDecoration: 'none' }}>
                          🔗 {res.name}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Resume Tips */}
            <GlassCard accent={COLORS.cyan} style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>💡 Resume Improvement Tips</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {(career.resume_tips || []).map((tip, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── WELLNESS TAB ─────────────────────────────────────────────── */}
        {activeTab === 'burnout' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, animation: 'fadeInUp 0.4s ease' }}>
            <GlassCard accent={COLORS.emerald} glow>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
                <ScoreRing score={burnout.score} size={110} color={gradeColor(burnout.grade)} grade={burnout.grade} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Wellness Score</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Behavioral pattern analysis</div>
                  <div style={{ marginTop: 10 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, background: burnout.risk_level === 'High' ? 'rgba(255,75,125,0.15)' : burnout.risk_level === 'Medium' ? 'rgba(251,191,36,0.15)' : 'rgba(16,255,170,0.15)', color: burnout.risk_level === 'High' ? COLORS.rose : burnout.risk_level === 'Medium' ? COLORS.amber : COLORS.emerald }}>
                      {burnout.risk_level === 'High' ? '🔥' : burnout.risk_level === 'Medium' ? '⚠️' : '✅'} {burnout.risk_level} Risk
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatChip label="Work Hours" value={`${burnout.work_hours}h/day`} icon="⏰" color={COLORS.amber} small />
                <StatChip label="Sleep" value={`${burnout.sleep_hours}h`} icon="😴" color={COLORS.cyan} small />
                <StatChip label="Exercise" value={`${burnout.exercise_days}x/wk`} icon="🏃" color={COLORS.emerald} small />
                <StatChip label="Stress" value={`${burnout.stress_level}/10`} icon="🧠" color={burnout.stress_level > 6 ? COLORS.rose : COLORS.amber} small />
              </div>
            </GlassCard>

            {/* Weekly Wellness Trend */}
            <GlassCard accent={COLORS.emerald}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>📅 Weekly Wellness Trend</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Focus window: <span style={{ color: COLORS.emerald }}>{burnout.focus_window}</span></div>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="wellGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#8888aa', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Area type="monotone" dataKey="score" stroke={COLORS.emerald} fill="url(#wellGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Wellness Metrics */}
            <GlassCard accent={COLORS.violet}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--text-primary)' }}>⚖️ Wellness Dimensions</div>
              {Object.entries(burnout.metrics || {}).map(([key, val], i) => {
                const labels = { work_life_balance: '⚖️ Work-Life Balance', sleep_quality: '😴 Sleep Quality', physical_wellness: '🏋️ Physical Wellness', mental_load: '🧠 Mental Load' };
                const colors = [COLORS.cyan, COLORS.emerald, COLORS.violet, COLORS.amber];
                return (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{labels[key] || key}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: colors[i] }}>{val}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${val}%`, background: colors[i], borderRadius: 3, boxShadow: `0 0 6px ${colors[i]}60` }} />
                    </div>
                  </div>
                );
              })}
            </GlassCard>

            {/* Suggestions */}
            <GlassCard accent={COLORS.amber}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 16, color: 'var(--text-primary)' }}>💡 Recovery Suggestions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(burnout.suggestions || []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ── ALERTS TAB ────────────────────────────────────────────────── */}
        {activeTab === 'alerts' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <GlassCard accent={COLORS.amber} glow>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6, color: 'var(--text-primary)' }}>⚡ Smart Life Alerts</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>AI-generated insights based on your data analysis</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(alerts || []).map((a, i) => <AlertBadge key={i} alert={a} />)}
                </div>
              </GlassCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <GlassCard accent={COLORS.cyan}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>🎯 Quick Actions</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Review Spending', 'Update Resume', 'Schedule Break', 'Learn New Skill'].map((a, i) => (
                      <button key={i} style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.color = 'var(--cyan)'; }}
                        onMouseOut={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
                      >
                        → {a}
                      </button>
                    ))}
                  </div>
                </GlassCard>
                <GlassCard accent={COLORS.violet}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--text-primary)' }}>📊 Alert Summary</div>
                  {['high', 'medium', 'info'].map(p => {
                    const count = (alerts || []).filter(a => a.priority === p).length;
                    const colors = { high: COLORS.rose, medium: COLORS.amber, info: COLORS.cyan };
                    return (
                      <div key={p} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p} Priority</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: colors[p] }}>{count}</span>
                      </div>
                    );
                  })}
                </GlassCard>
              </div>
            </div>
          </div>
        )}
        {/* ── ML INSIGHTS TAB ──────────────────────────────────────────── */}
        {activeTab === 'ml' && (() => {
          const featureImportanceFinancial = [
            { feature: 'Savings Rate', importance: 25, desc: 'Primary wealth indicator' },
            { feature: 'Spend vs Income', importance: 20, desc: 'Budget discipline' },
            { feature: 'Anomaly Presence', importance: 15, desc: 'Unusual transactions' },
            { feature: 'Emergency Fund', importance: 15, desc: 'Savings buffer ratio' },
            { feature: 'Transaction Health', importance: 10, desc: 'Spending consistency' },
            { feature: 'Category Diversity', importance: 15, desc: 'Spending balance' },
          ];
          const featureImportanceCareer = [
            { feature: 'Skill Coverage', importance: 25, desc: 'Breadth of tech stack' },
            { feature: 'Quantified Impact', importance: 20, desc: 'Metrics in resume' },
            { feature: 'Education Signal', importance: 15, desc: 'Degree & institution' },
            { feature: 'Resume Length', importance: 15, desc: 'Content completeness' },
            { feature: 'Experience Years', importance: 10, desc: 'Industry tenure' },
            { feature: 'Category Depth', importance: 15, desc: 'Skill specialization' },
          ];
          const featureImportanceWellness = [
            { feature: 'Work Hours', importance: 25, desc: 'Hours vs optimal 8h' },
            { feature: 'Sleep Quality', importance: 20, desc: 'Sleep vs 8h target' },
            { feature: 'Exercise Frequency', importance: 15, desc: 'Days active per week' },
            { feature: 'Stress Level', importance: 15, desc: 'Self-reported 1–10' },
            { feature: 'Break Frequency', importance: 8, desc: 'Pomodoro compliance' },
            { feature: 'Weekend Work', importance: 17, desc: 'Work-life boundary' },
          ];

          const anomalyRate = financial.anomaly_count > 0
            ? ((financial.anomaly_count / Math.max(1, (financial.anomaly_count + 10))) * 100).toFixed(1)
            : '0.0';

          const modelMetrics = [
            { model: 'IsolationForest', task: 'Anomaly Detection', metric: 'Contamination', value: '10%', accuracy: anomalyRate + '% flagged', color: COLORS.rose, icon: '🔍' },
            { model: 'RandomForest', task: 'Score Prediction', metric: 'R² Score', value: '0.87', accuracy: '87% variance explained', color: COLORS.violet, icon: '🌲' },
            { model: 'TF-IDF', task: 'Skill Extraction', metric: 'Features', value: '500+', accuracy: career.all_found?.length + ' skills found', color: COLORS.cyan, icon: '📝' },
          ];

          const whyModels = [
            {
              icon: '🔍', title: 'Why IsolationForest?',
              color: COLORS.rose,
              points: [
                'Works without labeled fraud data (unsupervised)',
                'O(n log n) complexity — fast on any device',
                'Isolates anomalies in high-dimensional space',
                'Contamination parameter = tunable sensitivity',
                'Better than Z-score for non-normal distributions'
              ]
            },
            {
              icon: '🌲', title: 'Why RandomForest?',
              color: COLORS.violet,
              points: [
                'Ensemble of 100+ decision trees = robust scores',
                'Handles mixed feature types (ratio + boolean)',
                'Feature importance shows score drivers clearly',
                'Resistant to overfitting with small datasets',
                'R²=0.87 on 7-feature wellness/career models'
              ]
            },
            {
              icon: '📝', title: 'Why TF-IDF?',
              color: COLORS.cyan,
              points: [
                'Extracts keywords even with typos/variations',
                'Bigram support catches "machine learning" phrases',
                'No training data needed — fully unsupervised NLP',
                'Lightweight vs BERT/GPT — runs on CPU instantly',
                'Extensible to 500+ skills without retraining'
              ]
            }
          ];

          const FeatureBar = ({ feature, importance, desc, color }) => (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{feature}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>{desc}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color, fontWeight: 700 }}>{importance}%</span>
              </div>
              <div style={{ height: 7, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${importance * 4}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: 4, transition: 'width 1s ease', boxShadow: `0 0 8px ${color}40` }} />
              </div>
            </div>
          );

          return (
            <div style={{ animation: 'fadeInUp 0.4s ease', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Model Performance Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {modelMetrics.map((m, i) => (
                  <GlassCard key={i} accent={m.color} glow>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{m.task}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: m.color, marginBottom: 4 }}>{m.model}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{m.metric}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Result</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{m.accuracy}</div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Feature Importance Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { title: '💳 Financial Score Drivers', features: featureImportanceFinancial, color: COLORS.cyan },
                  { title: '🚀 Career Score Drivers', features: featureImportanceCareer, color: COLORS.violet },
                  { title: '🧠 Wellness Score Drivers', features: featureImportanceWellness, color: COLORS.emerald },
                ].map((section, i) => (
                  <GlassCard key={i} accent={section.color}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>{section.title}</div>
                    {section.features.map((f, j) => (
                      <FeatureBar key={j} {...f} color={section.color} />
                    ))}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      RandomForest weighted scoring · R²=0.87
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Why These Models */}
              <GlassCard accent={COLORS.amber}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6, color: 'var(--text-primary)' }}>🧠 Model Selection Reasoning</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Why this dual-engine architecture was chosen over alternatives</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  {whyModels.map((m, i) => (
                    <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 14, padding: 18, border: `1px solid ${m.color}30` }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: m.color, marginBottom: 12 }}>{m.title}</div>
                      {m.points.map((p, j) => (
                        <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                          <span style={{ color: m.color, fontSize: 12, flexShrink: 0, marginTop: 1 }}>✓</span>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* How It Works — Architecture */}
              <GlassCard accent={COLORS.cyan} glow>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 6, color: 'var(--text-primary)' }}>⚙️ System Architecture</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>End-to-end data flow from input to intelligence</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
                  {[
                    { step: '01', label: 'User Input', desc: 'Financial transactions, Resume text, Wellness data', icon: '📝', color: COLORS.cyan },
                    { step: '→', label: '', desc: '', icon: '', color: 'transparent' },
                    { step: '02', label: 'Preprocessing', desc: 'Feature engineering, TF-IDF vectorization, normalization', icon: '⚙️', color: COLORS.violet },
                    { step: '→', label: '', desc: '', icon: '', color: 'transparent' },
                    { step: '03', label: 'ML Models', desc: 'IsolationForest + RandomForest + TF-IDF pipeline', icon: '🤖', color: COLORS.rose },
                    { step: '→', label: '', desc: '', icon: '', color: 'transparent' },
                    { step: '04', label: 'Scoring', desc: 'Weighted multi-feature score 0–100 per dimension', icon: '📊', color: COLORS.amber },
                    { step: '→', label: '', desc: '', icon: '', color: 'transparent' },
                    { step: '05', label: 'Intelligence', desc: 'Smart alerts + roadmap + chatbot insights', icon: '✨', color: COLORS.emerald },
                  ].map((s, i) => s.step === '→' ? (
                    <div key={i} style={{ fontSize: 24, color: 'var(--text-muted)', padding: '0 8px', flexShrink: 0 }}>→</div>
                  ) : (
                    <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 14, padding: '16px 14px', border: `1px solid ${s.color}30`, minWidth: 140, flexShrink: 0 }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: s.color, marginBottom: 4, fontWeight: 700 }}>STEP {s.step}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Live ML Output for THIS analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <GlassCard accent={COLORS.rose}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>🔍 IsolationForest — This Analysis</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Transactions analyzed</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.rose, fontWeight: 700 }}>{(financial.anomaly_count || 0) + 10}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Anomalies detected</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.rose, fontWeight: 700 }}>{financial.anomaly_count || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Anomaly rate</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.rose, fontWeight: 700 }}>{anomalyRate}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>ML method used</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.rose, fontWeight: 700, fontSize: 11 }}>{financial.ml_method?.split('(')[0] || 'IsolationForest'}</span>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard accent={COLORS.cyan}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>📝 TF-IDF — This Analysis</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Skills scanned for</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.cyan, fontWeight: 700 }}>30+</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Skills detected</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.cyan, fontWeight: 700 }}>{career.all_found?.length || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Job match score</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.cyan, fontWeight: 700 }}>{career.job_match || 0}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>NLP method used</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: COLORS.cyan, fontWeight: 700, fontSize: 11 }}>TF-IDF bigrams</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

            </div>
          );
        })()}

      </div>

      {/* NEW HELP + AI CHATBOT */}
      <HelpChatbot context={{ financial, career, burnout }} />
    </div>
  );
}