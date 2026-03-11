import React, { useMemo } from 'react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { Sparkles, TrendingUp, Users, CheckCircle, XCircle, BarChart2, Target, Brain } from 'lucide-react';

// Inject styles once
const STYLE_ID = 'an-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes anFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes anBarGrow{ from{width:0} to{width:var(--bw)} }
    .an-kpi { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor:default; }
    .an-kpi:hover { transform: translateY(-4px) !important; }
    .an-panel { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .an-panel:hover { transform: translateY(-2px); }
    .an-skill-bar { animation: anBarGrow 1s cubic-bezier(0.34,1.1,0.64,1) both; }
  `;
  document.head.appendChild(s);
}

// Vibrant chart colors
const CHART_COLORS = ['#a78bfa', '#34d399', '#f87171', '#fbbf24', '#38bdf8', '#f472b6', '#818cf8', '#4ade80'];
const PIE_COLORS = ['#34d399', '#fbbf24', '#f87171'];
const BAR_GRADIENTS = [
  ['#7c3aed', '#6366f1'], ['#34d399', '#0ea5e9'], ['#f87171', '#f43f5e'],
  ['#fbbf24', '#f97316'], ['#38bdf8', '#6366f1'], ['#f472b6', '#a855f7'],
];

const ACCENTS = [
  { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.65)' },
  { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.65)' },
  { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.65)' },
  { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.65)' },
  { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.65)' },
  { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.65)' },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(12,8,32,0.97)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 10, padding: '0.65rem 1rem', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: 0, fontWeight: 800, color: p.color || '#a78bfa', fontSize: '0.88rem' }}>
          {p.name}: <span style={{ color: '#e2e8f0' }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// Custom legend dot row
const LegendDot = ({ color, glow, label, val }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.4rem 0' }}>
    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${glow || color}`, flexShrink: 0 }} />
    <span style={{ color: '#64748b', fontSize: '0.82rem', flex: 1 }}>{label}</span>
    <span style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '0.88rem' }}>{val}</span>
  </div>
);

const Analytics = ({ candidates }) => {
  const stats = useMemo(() => {
    const total = candidates.length;
    const shortlisted = candidates.filter(c => c.status === 'Shortlisted').length;
    const rejected = candidates.filter(c => c.status === 'Rejected').length;
    const review = candidates.filter(c => c.status === 'Review').length;
    const avgScore = total > 0 ? Math.round(candidates.reduce((s, c) => s + (c.match_score || 0), 0) / total) : 0;
    const topScore = total > 0 ? Math.round(Math.max(...candidates.map(c => c.match_score || 0))) : 0;
    return { total, shortlisted, rejected, review, avgScore, topScore };
  }, [candidates]);

  const skillMap = useMemo(() => {
    const map = {};
    candidates.forEach(c => (c.skills_matched || []).forEach(sk => { map[sk] = (map[sk] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  }, [candidates]);

  const scoreDistribution = useMemo(() => {
    const b = { '0–60': 0, '60–70': 0, '70–80': 0, '80–90': 0, '90–100': 0 };
    candidates.forEach(c => {
      const s = c.match_score || 0;
      if (s < 60) b['0–60']++; else if (s < 70) b['60–70']++; else if (s < 80) b['70–80']++; else if (s < 90) b['80–90']++; else b['90–100']++;
    });
    return Object.entries(b).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  const statusData = [
    { name: 'Shortlisted', value: stats.shortlisted, color: '#34d399', glow: 'rgba(52,211,153,0.7)' },
    { name: 'Review', value: stats.review, color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' },
    { name: 'Rejected', value: stats.rejected, color: '#f87171', glow: 'rgba(248,113,113,0.7)' },
  ].filter(d => d.value > 0);

  const maxSkill = skillMap.length > 0 ? skillMap[0].count : 1;

  return (
    <div style={{ animation: 'anFadeIn 0.4s ease both' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <div style={{ width: 44, height: 44, borderRadius: '13px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}>
          <BarChart2 size={20} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>Analytics Dashboard</h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Recruitment insights and AI performance metrics in real-time</p>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Applicants', value: stats.total, icon: <Users size={18} />, from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.55)', color: '#a78bfa' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: <CheckCircle size={18} />, from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.55)', color: '#34d399' },
          { label: 'Rejected', value: stats.rejected, icon: <XCircle size={18} />, from: '#f43f5e', to: '#f87171', glow: 'rgba(244,63,94,0.55)', color: '#f87171' },
          { label: 'Avg AI Score', value: `${stats.avgScore}%`, icon: <TrendingUp size={18} />, from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.55)', color: '#fbbf24' },
        ].map((k, i) => (
          <div key={i} className="an-kpi" style={{ padding: '1.2rem 1.3rem', background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', border: `1px solid ${k.glow.replace('0.55', '0.2')}`, borderRadius: '16px', boxShadow: `0 0 18px ${k.glow.replace('0.55', '0.08')}`, animationDelay: `${i * 0.06}s`, animation: 'anFadeIn 0.4s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.68rem', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{k.label}</p>
                <h2 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1, color: k.color, textShadow: `0 0 20px ${k.glow}` }}>{k.value}</h2>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: '11px', background: `linear-gradient(135deg,${k.from},${k.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 0 14px ${k.glow}`, flexShrink: 0 }}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 2: Score Distribution + Status Breakdown ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.1rem', marginBottom: '1.1rem' }}>

        {/* Score Distribution Bar Chart */}
        <div className="an-panel" style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 24px rgba(124,58,237,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg,#a855f7,#6366f1,#38bdf8)' }} />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <Target size={15} color="#a78bfa" style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.8))' }} />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0' }}>Score Distribution</h3>
            </div>
            {candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1e293b', fontSize: '0.82rem' }}>Upload resumes to see score data.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={scoreDistribution} barCategoryGap="30%">
                  <defs>
                    {scoreDistribution.map((_, i) => (
                      <linearGradient key={i} id={`sdg${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={1} />
                        <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0.4} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#1e293b" tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#1e293b" tick={{ fontSize: 10, fill: '#334155' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139,92,246,0.06)' }} />
                  <Bar dataKey="value" name="Candidates" radius={[6, 6, 0, 0]}>
                    {scoreDistribution.map((_, i) => <Cell key={i} fill={`url(#sdg${i})`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Breakdown Donut */}
        <div className="an-panel" style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 24px rgba(124,58,237,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg,#34d399,#fbbf24,#f87171)' }} />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <Brain size={15} color="#a78bfa" style={{ filter: 'drop-shadow(0 0 6px rgba(167,139,250,0.8))' }} />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0' }}>Candidate Status Breakdown</h3>
            </div>
            {statusData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1e293b', fontSize: '0.82rem' }}>No data yet. Upload resumes to see metrics.</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <PieChart width={190} height={190}>
                    <defs>
                      {statusData.map((d, i) => (
                        <filter key={i} id={`pglow${i}`}>
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      ))}
                    </defs>
                    <Pie data={statusData} cx={90} cy={90} innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                  {/* Center text */}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", color: '#e2e8f0' }}>{stats.total}</p>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</p>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {[
                    { label: 'Shortlisted', val: stats.shortlisted, color: '#34d399', glow: 'rgba(52,211,153,0.7)' },
                    { label: 'Review', val: stats.review, color: '#fbbf24', glow: 'rgba(251,191,36,0.7)' },
                    { label: 'Rejected', val: stats.rejected, color: '#f87171', glow: 'rgba(248,113,113,0.7)' },
                    { label: 'New', val: candidates.filter(c => c.status === 'New').length, color: '#94a3b8', glow: 'rgba(148,163,184,0.5)' },
                  ].map(d => (
                    <LegendDot key={d.label} {...d} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Candidate Scores List + Top Skills ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.1rem' }}>

        {/* Per-Candidate Score Bars */}
        <div className="an-panel" style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 24px rgba(124,58,237,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg,#a855f7,#6366f1,#0ea5e9)' }} />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={15} color="#a78bfa" />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0' }}>Candidate AI Scores</h3>
              <span style={{ marginLeft: 'auto', padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 800, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa' }}>
                Top: {stats.topScore}%
              </span>
            </div>
            {candidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1e293b', fontSize: '0.82rem' }}>Upload resumes to see scores.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: 220, overflowY: 'auto', paddingRight: '0.25rem' }}>
                {[...candidates]
                  .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
                  .map((c, i) => {
                    const sc = Math.round(c.match_score || 0);
                    const color = sc >= 85 ? '#34d399' : sc >= 70 ? '#fbbf24' : '#f87171';
                    const glow = sc >= 85 ? 'rgba(52,211,153,0.6)' : sc >= 70 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)';
                    const accent = ACCENTS[i % ACCENTS.length];
                    return (
                      <div key={c.id} style={{ animationDelay: `${i * 0.04}s`, animation: 'anFadeIn 0.35s ease both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                          {/* Rank */}
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e293b', minWidth: 22 }}>#{i + 1}</span>
                          {/* Avatar */}
                          <div style={{ width: 26, height: 26, borderRadius: '7px', flexShrink: 0, background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff', boxShadow: `0 0 8px ${accent.glow}` }}>
                            {c.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {/* Name */}
                          <span style={{ flex: 1, fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                          {/* Score */}
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color, textShadow: `0 0 8px ${glow}`, minWidth: 36, textAlign: 'right' }}>{sc}%</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden', marginLeft: 46 }}>
                          <div style={{ width: `${sc}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg,${color}99,${color})`, boxShadow: `0 0 6px ${glow}`, transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Top Skills horizontal bars */}
        <div className="an-panel" style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 24px rgba(124,58,237,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '3px', background: 'linear-gradient(90deg,#f472b6,#a855f7,#38bdf8)' }} />
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1.25rem' }}>
              <Sparkles size={15} color="#f472b6" style={{ filter: 'drop-shadow(0 0 6px rgba(244,114,182,0.8))' }} />
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#e2e8f0' }}>Top Skills</h3>
            </div>
            {skillMap.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1e293b', fontSize: '0.82rem' }}>No skill data yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {skillMap.map((sk, i) => {
                  const [from, to] = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
                  const pct = Math.round((sk.count / maxSkill) * 100);
                  return (
                    <div key={sk.name} style={{ animationDelay: `${i * 0.05}s`, animation: 'anFadeIn 0.35s ease both' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.28rem', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{sk.name}</span>
                        <span style={{ color: from, textShadow: `0 0 8px ${from}88`, marginLeft: '0.5rem' }}>{sk.count}</span>
                      </div>
                      <div style={{ height: 7, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                        <div className="an-skill-bar" style={{ '--bw': `${pct}%`, width: `${pct}%`, height: '100%', borderRadius: 999, background: `linear-gradient(90deg,${from},${to})`, boxShadow: `0 0 8px ${from}55` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
