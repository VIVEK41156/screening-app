import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Users, CheckCircle, TrendingUp, Sparkles, Eye, Target } from 'lucide-react';

// --- Intersection Observer Hook ---
const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsIntersecting(true);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [ref, options]);

  return [ref, isIntersecting];
};

const Dashboard = ({ candidates, token, onViewProfile }) => {
  const total = candidates.length;
  const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length;
  const avgScore = total > 0 ? Math.round(candidates.reduce((sum, c) => sum + (c.match_score || 0), 0) / total) : 0;
  const underReview = candidates.filter(c => c.status === 'Review').length;

  // Animate the AI Insight average score circle on scroll
  const [insightRef, insightInView] = useIntersectionObserver({ threshold: 0.2 });
  const [animatedAvg, setAnimatedAvg] = useState(0);

  useEffect(() => {
    if (insightInView && total > 0) {
      let start = 0;
      const target = avgScore;
      const duration = 1500;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setAnimatedAvg(start + (target - start) * easeOut);

        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else {
      setAnimatedAvg(0);
    }
  }, [avgScore, insightInView, total]);


  const generateActivityData = (candidatesList) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const resultList = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      resultList.push({ name: days[d.getDay()], applications: 0, dateObj: new Date(d.setHours(0, 0, 0, 0)) });
    }
    candidatesList.forEach(c => {
      const dateStr = c.created_at ? new Date(c.created_at) : new Date();
      dateStr.setHours(0, 0, 0, 0);
      const targetDay = resultList.find(r => r.dateObj.getTime() === dateStr.getTime());
      if (targetDay) targetDay.applications++;
    });
    return resultList.map(r => ({ name: r.name, applications: r.applications }));
  };

  const activityData = generateActivityData(candidates);
  const topCandidates = [...candidates].sort((a, b) => (b.match_score || 0) - (a.match_score || 0)).slice(0, 5);

  const generateReport = () => {
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });
    const shortlistedCandidates = candidates.filter(c => c.status === 'Shortlisted');
    const sortedAll = [...candidates].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`<!DOCTYPE html><html><head><title>HR Recruitment Report - ${now}</title><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6f8;color:#1a1a2e;padding:2rem;}.header{background:linear-gradient(135deg,#4B3C8C,#3A2E6F);color:white;padding:2.5rem;border-radius:16px;margin-bottom:2rem;display:flex;justify-content:space-between;align-items:center;}.header h1{font-size:1.75rem;font-weight:700;}.header p{opacity:0.8;margin-top:0.25rem;font-size:0.9rem;}.conf{background:rgba(255,255,255,0.2);padding:0.25rem 0.75rem;border-radius:999px;font-size:0.8rem;}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem;}.sc{background:white;border-radius:12px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center;}.sc .v{font-size:2.5rem;font-weight:800;color:#4B3C8C;}.sc .l{color:#666;font-size:0.85rem;margin-top:0.25rem;}h2{font-size:1.15rem;font-weight:700;margin-bottom:1rem;color:#4B3C8C;border-left:4px solid #4B3C8C;padding-left:0.75rem;}.sec{background:white;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.08);}table{width:100%;border-collapse:collapse;}th{background:#f0eef8;color:#4B3C8C;padding:0.75rem 1rem;text-align:left;font-size:0.78rem;text-transform:uppercase;letter-spacing:0.05em;}td{padding:0.875rem 1rem;border-bottom:1px solid #f0f0f0;font-size:0.88rem;}tr:last-child td{border-bottom:none;}.bar-wrap{display:flex;align-items:center;gap:0.5rem;}.bar{height:8px;border-radius:999px;background:#e0e0e0;flex:1;}.fill{height:100%;border-radius:999px;}.badge{padding:0.2rem 0.7rem;border-radius:999px;font-size:0.75rem;font-weight:600;display:inline-block;}.SL{background:#d1fae5;color:#065f46;}.RE{background:#fef3c7;color:#92400e;}.RJ{background:#fee2e2;color:#991b1b;}.footer{text-align:center;color:#aaa;font-size:0.78rem;margin-top:2rem;padding-top:1rem;border-top:1px solid #ddd;}@media print{body{background:white;padding:0;}}</style></head><body><div class="header"><div><h1>⚡ HR Smart AI — Recruitment Report</h1><p>Generated: ${now} · Powered by Google Gemini AI</p></div><span class="conf">CONFIDENTIAL</span></div><div class="stats"><div class="sc"><div class="v">${total}</div><div class="l">Total Applicants</div></div><div class="sc"><div class="v" style="color:#059669">${shortlisted}</div><div class="l">Shortlisted</div></div><div class="sc"><div class="v" style="color:#d97706">${underReview}</div><div class="l">Under Review</div></div><div class="sc"><div class="v">${avgScore}%</div><div class="l">Avg AI Score</div></div></div>${shortlistedCandidates.length > 0 ? `<div class="sec"><h2>✅ Shortlisted Candidates (${shortlistedCandidates.length})</h2><table><thead><tr><th>Candidate</th><th>Email</th><th>AI Score</th><th>Skills</th></tr></thead><tbody>${shortlistedCandidates.map(c => `<tr><td><strong>${c.name || '—'}</strong></td><td>${c.email || '—'}</td><td><div class="bar-wrap"><div class="bar"><div class="fill" style="width:${c.match_score || 0}%;background:#10b981"></div></div><strong style="color:#059669">${Math.round(c.match_score || 0)}%</strong></div></td><td style="font-size:0.8rem;color:#666">${(c.skills_matched || []).slice(0, 4).join(', ')}</td></tr>`).join('')}</tbody></table></div>` : ''}<div class="sec"><h2>📊 All Candidates by Rank</h2><table><thead><tr><th>Rank</th><th>Candidate</th><th>AI Score</th><th>Status</th><th>Skills</th></tr></thead><tbody>${sortedAll.map((c, i) => `<tr><td><strong>#${i + 1}</strong></td><td>${c.name || '—'}<br><span style="font-size:0.75rem;color:#888">${c.email || ''}</span></td><td><div class="bar-wrap"><div class="bar"><div class="fill" style="width:${c.match_score || 0}%;background:${c.match_score > 85 ? '#10b981' : c.match_score > 70 ? '#f59e0b' : '#ef4444'}"></div></div><strong>${Math.round(c.match_score || 0)}%</strong></div></td><td><span class="badge ${c.status === 'Shortlisted' ? 'SL' : c.status === 'Rejected' ? 'RJ' : 'RE'}">${c.status}</span></td><td style="font-size:0.78rem;color:#666">${(c.skills_matched || []).slice(0, 3).join(', ')}</td></tr>`).join('')}</tbody></table></div><div class="footer">HR Smart AI · Confidential Recruitment Report · ${now}</div><script>window.print();</script></body></html>`);
    reportWindow.document.close();
  };

  // KPI cards
  const kpiCards = [
    {
      label: 'Total Resumes', value: total, sub: 'Applicants in pipeline',
      icon: <Users size={22} />, accentColor: '#818cf8',
      bg: 'linear-gradient(135deg, #3730a3 0%, #4c1d95 50%, #312e81 100%)',
      border: 'rgba(139,92,246,0.5)',
      glow: 'rgba(99,102,241,0.6)', iconBg: 'rgba(167,139,250,0.25)',
      iconColor: '#c4b5fd',
    },
    {
      label: 'AI Shortlisted', value: shortlisted, sub: 'Approved by AI scoring',
      icon: <CheckCircle size={22} />, accentColor: '#34d399',
      bg: 'linear-gradient(135deg, #047857 0%, #065f46 50%, #064e3b 100%)',
      border: 'rgba(52,211,153,0.5)',
      glow: 'rgba(16,185,129,0.6)', iconBg: 'rgba(52,211,153,0.25)',
      iconColor: '#6ee7b7',
    },
    {
      label: 'Avg. Match Score', value: `${avgScore}%`, sub: 'Across all candidates',
      icon: <Zap size={22} />, accentColor: '#fbbf24',
      bg: 'linear-gradient(135deg, #b45309 0%, #92400e 50%, #78350f 100%)',
      border: 'rgba(251,191,36,0.5)',
      glow: 'rgba(245,158,11,0.6)', iconBg: 'rgba(251,191,36,0.25)',
      iconColor: '#fde68a',
    },
    {
      label: 'Under Review', value: underReview, sub: 'Awaiting decision',
      icon: <Target size={22} />, accentColor: '#fb7185',
      bg: 'linear-gradient(135deg, #9f1239 0%, #881337 50%, #6f0a2d 100%)',
      border: 'rgba(251,113,133,0.5)',
      glow: 'rgba(244,63,94,0.6)', iconBg: 'rgba(251,113,133,0.25)',
      iconColor: '#fda4af',
    },
  ];


  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* ── PAGE HEADER ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', margin: 0, color: '#e2e8f0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
            Pipeline Analytics <Sparkles size={28} style={{ color: '#a78bfa' }} />
          </h1>
          <p style={{ color: '#475569', margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
            Real-time AI candidate tracking and recruitment insights.
          </p>
        </div>
        <button
          onClick={generateReport}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 1.4rem',
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            border: 'none', borderRadius: '10px',
            color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: '0 0 24px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(124,58,237,0.8), 0 8px 20px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Zap size={17} /> Generate Report
        </button>
      </header>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {kpiCards.map(card => (
          <div
            key={card.label}
            style={{
              position: 'relative', overflow: 'hidden',
              padding: '1.5rem',
              background: card.bg,
              borderRadius: '16px',
              border: `1px solid ${card.border}`,
              boxShadow: `0 0 30px ${card.glow}, 0 8px 24px rgba(0,0,0,0.3)`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 0 45px ${card.glow}, 0 12px 32px rgba(0,0,0,0.4)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 30px ${card.glow}, 0 8px 24px rgba(0,0,0,0.3)`; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 700, margin: '0 0 0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {card.label}
                </p>
                <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {card.value}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp size={11} color="rgba(255,255,255,0.8)" /> {card.sub}
                </p>
              </div>
              <div style={{
                width: 48, height: 48, borderRadius: '12px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff',
                backdropFilter: 'blur(4px)',
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART + AI INSIGHT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>

        {/* Area Chart */}
        <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08),0 8px 28px rgba(0,0,0,0.35)', padding: '1.75rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
            Application Activity — Last 7 Days
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#334155" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis stroke="#334155" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(15,10,40,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', color: '#e2e8f0', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }} />
              <Area type="monotone" dataKey="applications" stroke="#818cf8" strokeWidth={2.5} fill="url(#chartGrad)" dot={{ fill: '#818cf8', strokeWidth: 0, r: 4 }} activeDot={{ r: 7, fill: '#a78bfa' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight Card */}
        <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08),0 8px 28px rgba(0,0,0,0.35)', padding: '1.75rem', position: 'relative', overflow: 'hidden' }} ref={insightRef}>
          {/* Decorative orb */}
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Sparkles color="#fbbf24" size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fbbf24' }}>
              AI Insight
            </h3>
          </div>

          {total > 0 ? (
            <>
              <p style={{ color: '#64748b', lineHeight: 1.75, marginBottom: '1rem', fontSize: '0.88rem' }}>
                {shortlisted > 0
                  ? `"AI has shortlisted ${shortlisted} top candidates from ${total} applicants with an average match of ${avgScore}%."`
                  : `"${total} resumes received. Review candidates and shortlist the best matches to speed up hiring."`}
              </p>
              <div style={{ background: 'rgba(124,58,237,0.12)', padding: '1rem', borderRadius: '10px', borderLeft: '3px solid #7c3aed' }}>
                <p style={{ fontSize: '0.8rem', color: '#a78bfa', margin: 0, lineHeight: 1.7 }}>
                  <strong>Recommendation:</strong> Fast-track candidates scoring above 85% for immediate interview scheduling.
                </p>
              </div>
            </>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Upload resumes to get AI-powered insights and candidate recommendations.</p>
          )}

          {/* Score ring */}
          {total > 0 && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: `conic-gradient(#7c3aed ${animatedAvg * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(124,58,237,0.5)',
                position: 'relative',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e0a3e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa' }}>{Math.round(animatedAvg)}%</span>
                </div>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#c4b5fd' }}>Avg Match Rate</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569' }}>{shortlisted} of {total} shortlisted</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── TOP CANDIDATES TABLE ── */}
      {topCandidates.length > 0 && (
        <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08),0 8px 28px rgba(0,0,0,0.35)', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(139,92,246,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(124,58,237,0.06)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#a78bfa' }}>
              🏆 Top Ranked Candidates
            </h3>
            <button
              onClick={generateReport}
              style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 500 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
            >
              🖨️ Print Full Report
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(139,92,246,0.05)' }}>
                {['Rank', 'Candidate', 'AI Match Score', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.5rem', color: '#334155', fontWeight: 600, fontSize: '0.75rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCandidates.map((c, i) => {
                // Rank badge colors
                const rankColors = ['#fbbf24', '#94a3b8', '#fb923c'];
                const rankColor = rankColors[i] || '#6b7280';
                // Score color
                const scoreColor = c.match_score > 85 ? '#34d399' : c.match_score > 70 ? '#fbbf24' : '#f87171';
                const scoreGlow = c.match_score > 85 ? 'rgba(52,211,153,0.4)' : c.match_score > 70 ? 'rgba(251,191,36,0.4)' : 'rgba(248,113,113,0.4)';
                // Status pill
                const statusStyle = c.status === 'Shortlisted'
                  ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)' }
                  : c.status === 'Rejected'
                    ? { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' }
                    : { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' };

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid rgba(139,92,246,0.08)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Rank */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: rankColor }}>
                        #{i + 1}
                      </span>
                    </td>

                    {/* Candidate */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: `linear-gradient(135deg, hsl(${i * 52 + 200},70%,55%), hsl(${i * 52 + 240},70%,45%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'white', fontSize: '0.9rem',
                          flexShrink: 0,
                        }}>
                          {c.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, margin: 0, fontSize: '0.88rem', color: '#e2e8f0' }}>{c.name}</p>
                          <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0 }}>{c.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Score bar */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                          <div style={{ width: `${c.match_score || 0}%`, height: '100%', background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)`, borderRadius: 999 }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: scoreColor, minWidth: 38 }}>
                          {Math.round(c.match_score || 0)}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ padding: '0.3rem 0.85rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, background: statusStyle.bg, color: statusStyle.color }}>
                        {c.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button
                        onClick={() => onViewProfile(c)}
                        style={{
                          padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '0.35rem',
                          background: 'rgba(124,58,237,0.12)',
                          border: 'none',
                          borderRadius: '8px', color: '#a78bfa', cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(124,58,237,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                      >
                        <Eye size={13} /> View Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
