import React, { useEffect, useRef, useState } from 'react';

import { ThemeToggle } from '../contexts/ThemeContext';
import HelpChatbot from '../components/HelpChatbot';

export default function LandingPage({ onStart, onDemo, loading, auth = {} }) {
  const { user, authLoading, onLogin, onLogout } = auth;
  const canvasRef = useRef(null);
  const [typed, setTyped] = useState('');
  const fullText = 'Your Life. Analyzed. Optimized.';

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(interval);
    }, 55);
    return () => clearInterval(interval);
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#00e5ff' : '#8b5cf6',
      opacity: Math.random() * 0.5 + 0.1
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dx = p.x - q.x, dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,229,255,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      // dots
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const features = [
    { icon: '💳', label: 'Financial Intelligence', desc: 'Anomaly detection + burn forecasting', color: '#00e5ff' },
    { icon: '🚀', label: 'Career Readiness', desc: 'NLP skill gap analysis + roadmap', color: '#8b5cf6' },
    { icon: '🧠', label: 'Burnout Prevention', desc: 'Behavioral pattern analysis', color: '#10ffaa' },
    { icon: '⚡', label: 'Smart Alerts', desc: 'Real-time AI-driven recommendations', color: '#fbbf24' },
  ];

  const stats = [
    { value: '8+', label: 'AI Modules' },
    { value: '4', label: 'Life Dimensions' },
    { value: '100%', label: 'Personalized' },
    { value: '∞', label: 'Insights' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-void)', overflow: 'hidden', position: 'relative' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)',
          top: '-200px', left: '-200px', animation: 'orb-float 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
          bottom: '-150px', right: '-100px', animation: 'orb-float 9s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,255,170,0.05) 0%, transparent 70%)',
          top: '40%', left: '60%', animation: 'orb-float 15s ease-in-out infinite'
        }} />
      </div>

      {/* NAV */}
      <nav style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '18px 40px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(4,4,10,0.6)', backdropFilter: 'blur(12px)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, boxShadow: '0 0 20px rgba(0,229,255,0.35)'
          }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            AI<span style={{ color: 'var(--cyan)' }}>LifeCard</span>
          </span>
        </div>

        {/* Right side — all controls in one row with proper spacing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Demo Button */}
          <button className="btn-ghost" onClick={onDemo} disabled={loading}
            style={{ fontSize: 13, padding: '8px 16px', whiteSpace: 'nowrap' }}>
            {loading ? '⚡ Loading...' : '🎮 Try Demo'}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '7px 12px'
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0
                }}>
                  {user.displayName?.[0] || user.email?.[0] || 'U'}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName || user.email || 'Demo User'}
                </span>
              </div>
              <button onClick={onLogout} className="btn-ghost" style={{ fontSize: 12, padding: '7px 12px' }}>Sign out</button>
            </div>
          ) : (
            <button onClick={onLogin} disabled={authLoading} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', padding: '8px 14px', borderRadius: 10,
              cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center',
              gap: 6, transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              🔑 {authLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          )}

          {/* Get Started */}
          <button className="btn-primary" onClick={onStart}
            style={{ fontSize: 13, padding: '8px 18px', whiteSpace: 'nowrap' }}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cyan-dim)',
          border: '1px solid rgba(0,229,255,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 32
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', animation: 'glow-pulse 2s infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)', letterSpacing: 2 }}>AI POWERED LIFE INTELLIGENCE</span>
        </div>

        {/* Heading */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2px' }}>
          <span style={{ color: 'var(--text-primary)' }}>One Dashboard.</span><br />
          <span style={{ background: 'linear-gradient(135deg, var(--cyan) 0%, var(--violet) 50%, var(--emerald) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Infinite Clarity.
          </span>
        </h1>

        {/* Typewriter */}
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 48, minHeight: 28 }}>
          {typed}<span style={{ animation: 'blink 1s infinite', color: 'var(--cyan)' }}>|</span>
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onStart} style={{
            background: 'linear-gradient(135deg, var(--cyan), var(--violet))', color: '#fff', border: 'none',
            padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)',
            cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 0 30px rgba(0,229,255,0.3)', letterSpacing: 0.5
          }}
            onMouseOver={e => e.target.style.transform = 'translateY(-3px)'}
            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
          >
            🚀 Generate My LifeCard
          </button>
          <button onClick={onDemo} disabled={loading} style={{
            background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)',
            padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-display)',
            cursor: 'pointer', transition: 'all 0.3s', opacity: loading ? 0.6 : 1
          }}
            onMouseOver={e => { e.target.style.borderColor = 'var(--cyan)'; e.target.style.color = 'var(--cyan)'; }}
            onMouseOut={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-primary)'; }}
          >
            {loading ? '⚡ Loading Demo...' : '🎮 View Demo'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, justifyContent: 'center', marginTop: 80, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '28px 20px', borderLeft: i > 0 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--cyan)' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
            4 Cards. <span style={{ color: 'var(--violet)' }}>Complete Intelligence.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Each card is powered by specialized AI modules working in harmony</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
              padding: 28, transition: 'all 0.3s', cursor: 'default',
              animation: `fadeInUp 0.6s ease ${i * 0.1}s both`
            }}
              onMouseOver={e => { e.currentTarget.style.borderColor = f.color + '50'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3)`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: f.color, marginBottom: 8 }}>{f.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER CTA */}
      <div style={{ position: 'relative', zIndex: 5, textAlign: 'center', padding: '60px 24px 80px' }}>
        <div style={{
          display: 'inline-block', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-surface))',
          border: '1px solid var(--border)', borderRadius: 24, padding: '48px 64px'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>Ready to understand your life?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Generate your personalized AI LifeCard in under 2 minutes</p>
          <button onClick={onStart} className="btn-primary" style={{ fontSize: 15, padding: '14px 36px' }}>
            🚀 Start Now — It's Free
          </button>
        </div>
      </div>
      {/* HELP CHATBOT — available on landing too */}
      <HelpChatbot showOnLanding />
    </div>
  );
}
