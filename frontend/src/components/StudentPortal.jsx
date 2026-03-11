import React, { useState } from 'react';
import { GraduationCap, Copy, CheckCircle, Clock, ExternalLink, Search, Send, Video, Award, TrendingUp, Users, BarChart2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import ExamResultsTab from './ExamResultsTab';
import InterviewResultsTab from './InterviewResultsTab';

// Inject styles once
const STYLE_ID = 'sp-styles';
if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    @keyframes spFadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spScoreW  { from{width:0} to{width:var(--tw)} }
    @keyframes spGlow    { 0%,100%{box-shadow:0 0 14px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 28px rgba(124,58,237,0.65)} }
    @keyframes spToastIn { from{opacity:0;transform:translateX(40px) scale(0.9)} to{opacity:1;transform:translateX(0) scale(1)} }
    @keyframes spToastOut{ from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(40px) scale(0.9)} }

    .sp-row { transition: background 0.18s ease; }
    .sp-row:hover { background: rgba(139,92,246,0.06) !important; }
    .sp-btn { transition: all 0.18s ease; }
    .sp-btn:hover:not(:disabled) { filter: brightness(1.25); transform: translateY(-1px); }
    .sp-tab { transition: all 0.2s ease; }
    .sp-search:focus { outline:none; border-color: #a78bfa !important; box-shadow: 0 0 0 3px rgba(167,139,250,0.15) !important; }
    .sp-search::placeholder { color: #334155; }
    .sp-kpi { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .sp-kpi:hover { transform: translateY(-3px); }
  `;
    document.head.appendChild(s);
}

const ACCENTS = [
    { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.65)' },
    { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.65)' },
    { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.65)' },
    { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.65)' },
    { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.65)' },
    { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.65)' },
];

// Radial gauge
const RadialGauge = ({ score, size = 82 }) => {
    const r = 30, cx = 40, cy = 40;
    const circ = Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
    const glow = score >= 80 ? 'rgba(52,211,153,0.7)' : score >= 60 ? 'rgba(251,191,36,0.7)' : 'rgba(248,113,113,0.7)';
    return (
        <svg width={size} height={size} viewBox="0 0 80 80">
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 5px ${glow})` }} />
            <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
                fontSize="14" fontWeight="900" fontFamily="'Outfit',sans-serif"
                style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>{score}%</text>
        </svg>
    );
};

// Score breakdown panel (expandable)
const ScorePanel = ({ c }) => {
    const score = c.test_score ?? 0;
    const cats = [
        { label: 'Verbal', color: '#a78bfa', glow: 'rgba(167,139,250,0.6)' },
        { label: 'Aptitude', color: '#34d399', glow: 'rgba(52,211,153,0.6)' },
        { label: 'Reasoning', color: '#f472b6', glow: 'rgba(244,114,182,0.6)' },
        { label: 'Technical', color: '#38bdf8', glow: 'rgba(56,189,248,0.6)' },
    ];
    const seed = c.id ?? 1;
    const rng = (i) => Math.min(100, Math.max(10, Math.round(score + (((seed * (i + 1) * 7919) % 41) - 20))));

    return (
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, border: '1px solid rgba(139,92,246,0.15)', padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', animation: 'spFadeIn 0.3s ease both' }}>
            <div style={{ flexShrink: 0, textAlign: 'center' }}>
                <RadialGauge score={score} />
                <p style={{ margin: 0, fontSize: '0.62rem', color: '#334155', fontWeight: 700, letterSpacing: '0.08em', marginTop: 2 }}>TOTAL SCORE</p>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                {cats.map((cat, i) => {
                    const s = rng(i);
                    return (
                        <div key={cat.label} style={{ marginBottom: '0.65rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                                <span style={{ color: '#64748b' }}>{cat.label}</span>
                                <span style={{ color: cat.color, textShadow: `0 0 8px ${cat.glow}` }}>{s}%</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 999, overflow: 'hidden' }}>
                                <div style={{ '--tw': `${s}%`, width: `${s}%`, height: '100%', background: `linear-gradient(90deg,${cat.color}99,${cat.color})`, borderRadius: 999, boxShadow: `0 0 6px ${cat.glow}`, animation: 'spScoreW 0.9s cubic-bezier(0.34,1.1,0.64,1) both' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StudentPortal = ({ candidates, token }) => {
    const [activeTab, setActiveTab] = useState('roster');
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingAction, setLoadingAction] = useState(null);
    const [toast, setToast] = useState('');
    const [expanded, setExpanded] = useState(null);

    const filtered = candidates.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const completed = candidates.filter(c => c.test_completed);
    const pending = candidates.filter(c => !c.test_completed);
    const avg = completed.length > 0
        ? Math.round(completed.reduce((s, c) => s + (c.test_score || 0), 0) / completed.length) : 0;

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const copyLink = (id) => {
        navigator.clipboard.writeText(`${window.location.origin}/test/${id}`);
        showToast('🔗 Exam link copied to clipboard!');
    };

    const hrAction = async (id, action) => {
        setLoadingAction(`${id}-${action}`);
        try {
            const endpoint = action === 'interview' ? `candidates/${id}/send-interview` : `candidates/${id}/send-better-luck`;
            const res = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } });
            const data = await res.json();
            showToast(data.success
                ? action === 'interview' ? '🎉 Interview invite sent!' : '📧 Better luck email sent!'
                : `❌ ${data.error}`
            );
        } catch { showToast('❌ Network error'); }
        finally { setLoadingAction(null); }
    };

    const statusOf = (c) => {
        if (!c.test_completed) return { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', glow: 'rgba(251,191,36,0.25)', icon: <Clock size={12} /> };
        if ((c.test_score ?? 0) >= 60) return { label: 'Passed', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', glow: 'rgba(52,211,153,0.25)', icon: <CheckCircle size={12} /> };
        return { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', glow: 'rgba(248,113,113,0.2)', icon: <Award size={12} /> };
    };

    const TABS = [
        { id: 'roster', label: 'Exam Roster', icon: <Users size={15} /> },
        { id: 'results', label: 'Exam Results', icon: <BarChart2 size={15} /> },
        { id: 'interviews', label: 'AI Interviews', icon: <Video size={15} /> },
    ];

    const TAB_COLORS = { roster: '#a78bfa', results: '#34d399', interviews: '#38bdf8' };

    return (
        <div style={{ animation: 'spFadeIn 0.4s ease both' }}>

            {/* ── TOAST ── */}
            {toast && (
                <div style={{ position: 'fixed', top: '80px', right: '2rem', zIndex: 9999, background: 'linear-gradient(135deg,rgba(124,58,237,0.97),rgba(79,70,229,0.97))', border: '1px solid rgba(167,139,250,0.4)', padding: '0.85rem 1.35rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.85rem', color: '#fff', boxShadow: '0 0 28px rgba(124,58,237,0.5), 0 8px 24px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', animation: 'spToastIn 0.3s cubic-bezier(0.34,1.2,0.64,1) both', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 240 }}>
                    {toast}
                </div>
            )}

            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '13px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}>
                        <GraduationCap size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>Student Exam Portal</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Manage assessments and view performance analytics</p>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                    <input className="sp-search" type="text" placeholder="Search candidates…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', color: '#e2e8f0', fontFamily: 'inherit', fontSize: '0.85rem', width: 240, transition: 'all 0.2s' }} />
                </div>
            </div>

            {/* ── KPI CARDS ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {[
                    { icon: <Users size={18} />, label: 'Total Candidates', val: candidates.length, color: '#a78bfa', from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.55)' },
                    { icon: <CheckCircle size={18} />, label: 'Tests Completed', val: completed.length, color: '#34d399', from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.55)' },
                    { icon: <Clock size={18} />, label: 'Pending Tests', val: pending.length, color: '#fbbf24', from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.55)' },
                    { icon: <TrendingUp size={18} />, label: 'Average Score', val: completed.length ? `${avg}%` : 'N/A', color: '#f472b6', from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.55)' },
                ].map((k, i) => (
                    <div key={i} className="sp-kpi" style={{ padding: '1.1rem 1.25rem', background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', border: `1px solid ${k.glow.replace('0.55', '0.2')}`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.9rem', boxShadow: `0 0 18px ${k.glow.replace('0.55', '0.08')}`, cursor: 'default' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '11px', background: `linear-gradient(135deg,${k.from},${k.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: `0 0 14px ${k.glow}` }}>
                            {k.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Outfit',sans-serif", lineHeight: 1, color: k.color, textShadow: `0 0 14px ${k.glow}` }}>{k.val}</p>
                            <p style={{ margin: 0, fontSize: '0.67rem', color: '#334155', marginTop: '0.15rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{k.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── TAB BAR ── */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '14px', padding: '5px' }}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab.id;
                    const tc = TAB_COLORS[tab.id];
                    return (
                        <button key={tab.id} className="sp-tab" onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.65rem', borderRadius: '10px', border: isActive ? `1px solid ${tc}44` : '1px solid transparent', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '0.875rem',
                                background: isActive ? `linear-gradient(135deg,${tc}22,${tc}12)` : 'transparent',
                                color: isActive ? tc : '#334155',
                                boxShadow: isActive ? `0 0 14px ${tc}33` : 'none',
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ══════════════════════════
          TAB: ROSTER
          ══════════════════════════ */}
            {activeTab === 'roster' && (
                <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08), 0 8px 28px rgba(0,0,0,0.35)', overflow: 'hidden', animation: 'spFadeIn 0.3s ease both' }}>
                    <div style={{ height: '3px', background: 'linear-gradient(90deg,#a855f7,#6366f1,#0ea5e9,#34d399)' }} />

                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 90px 260px', padding: '0.8rem 1.5rem', background: 'rgba(139,92,246,0.06)', borderBottom: '1px solid rgba(139,92,246,0.1)', gap: '1rem', alignItems: 'center' }}>
                        {['CANDIDATE', 'AI MATCH', 'TEST STATUS', 'SCORE', 'ACTIONS'].map(h => (
                            <span key={h} style={{ fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.1em', color: '#334155', textTransform: 'uppercase' }}>{h}</span>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div style={{ padding: '3.5rem', textAlign: 'center', color: '#334155' }}>No candidates found.</div>
                    ) : filtered.map((c, idx) => {
                        const st = statusOf(c);
                        const matchScore = c.match_score ?? c.score ?? null;
                        const isExpanded = expanded === c.id;
                        const accent = ACCENTS[idx % ACCENTS.length];

                        return (
                            <React.Fragment key={c.id}>
                                <div className="sp-row" style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 90px 260px', padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', gap: '1rem', alignItems: 'center', cursor: 'pointer', animationDelay: `${idx * 0.03}s`, animation: 'spFadeIn 0.3s ease both' }}
                                    onClick={() => setExpanded(isExpanded ? null : c.id)}>

                                    {/* Candidate */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', boxShadow: `0 0 10px ${accent.glow}` }}>
                                            {c.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</p>
                                        </div>
                                        {isExpanded ? <ChevronUp size={14} color="#7c3aed" style={{ marginLeft: 4, flexShrink: 0 }} /> : <ChevronDown size={14} color="#334155" style={{ marginLeft: 4, flexShrink: 0 }} />}
                                    </div>

                                    {/* AI Match */}
                                    <div>
                                        {matchScore !== null ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden', maxWidth: 60 }}>
                                                    <div style={{ '--tw': `${matchScore}%`, width: `${matchScore}%`, height: '100%', background: matchScore >= 85 ? '#34d399' : matchScore >= 70 ? '#fbbf24' : '#f87171', borderRadius: 999 }} />
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: '0.82rem', color: matchScore >= 85 ? '#34d399' : matchScore >= 70 ? '#fbbf24' : '#f87171' }}>{matchScore}%</span>
                                            </div>
                                        ) : <span style={{ color: '#1e293b', fontSize: '0.8rem' }}>—</span>}
                                    </div>

                                    {/* Status pill */}
                                    <div>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.28rem 0.75rem', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}`, boxShadow: `0 0 8px ${st.glow}`, whiteSpace: 'nowrap' }}>
                                            {st.icon} {st.label}
                                        </span>
                                    </div>

                                    {/* Score */}
                                    <div>
                                        {c.test_completed
                                            ? <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: (c.test_score ?? 0) >= 60 ? '#34d399' : '#f87171', textShadow: (c.test_score ?? 0) >= 60 ? '0 0 10px rgba(52,211,153,0.7)' : '0 0 10px rgba(248,113,113,0.7)' }}>{c.test_score}%</span>
                                            : <span style={{ color: '#1e293b', fontSize: '0.8rem' }}>—</span>}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                                        <button className="sp-btn" onClick={() => copyLink(c.id)}
                                            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: 8, color: '#818cf8', cursor: 'pointer', padding: '0.38rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Copy size={12} /> Link
                                        </button>
                                        {c.test_completed && (c.test_score ?? 0) >= 60 && (
                                            <button className="sp-btn" onClick={() => hrAction(c.id, 'interview')} disabled={loadingAction === `${c.id}-interview`}
                                                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 8, color: '#34d399', cursor: 'pointer', padding: '0.38rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Video size={12} /> {loadingAction === `${c.id}-interview` ? '…' : c.interview_completed ? 'Review AI' : 'AI Invite'}
                                            </button>
                                        )}
                                        {c.test_completed && (c.test_score ?? 0) < 60 && (
                                            <button className="sp-btn" onClick={() => hrAction(c.id, 'betterluck')} disabled={loadingAction === `${c.id}-betterluck`}
                                                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, color: '#fbbf24', cursor: 'pointer', padding: '0.38rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                                                <Send size={12} /> {loadingAction === `${c.id}-betterluck` ? '…' : 'Better Luck'}
                                            </button>
                                        )}
                                        <a href={`/test/${c.id}`} target="_blank" rel="noopener noreferrer"
                                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#334155', padding: '0.38rem 0.7rem', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, textDecoration: 'none', transition: 'all 0.18s' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }} onMouseLeave={e => { e.currentTarget.style.color = '#334155'; }}>
                                            <ExternalLink size={12} /> Preview
                                        </a>
                                    </div>
                                </div>

                                {/* Expandable score breakdown */}
                                {isExpanded && c.test_completed && (
                                    <div style={{ padding: '0 1.5rem 1.25rem', background: 'rgba(0,0,0,0.15)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
                                        <ScorePanel c={c} />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════
          TAB: EXAM RESULTS
          ══════════════════════════ */}
            {activeTab === 'results' && (
                <div style={{ animation: 'spFadeIn 0.3s ease both' }}>
                    <ExamResultsTab candidates={candidates} />
                </div>
            )}

            {/* ══════════════════════════
          TAB: AI INTERVIEWS
          ══════════════════════════ */}
            {activeTab === 'interviews' && (
                <div style={{ animation: 'spFadeIn 0.3s ease both' }}>
                    {expanded ? (
                        <InterviewResultsTab candidate={candidates.find(c => c.id === expanded)} token={token} onActionComplete={() => window.location.reload()} />
                    ) : (
                        <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '18px', border: '1px solid rgba(56,189,248,0.18)', boxShadow: '0 0 25px rgba(56,189,248,0.08)', overflow: 'hidden' }}>
                            <div style={{ height: '3px', background: 'linear-gradient(90deg,#38bdf8,#6366f1,#a855f7)' }} />

                            {/* Interview table header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 140px 120px', padding: '0.8rem 1.5rem', background: 'rgba(56,189,248,0.05)', borderBottom: '1px solid rgba(56,189,248,0.1)', gap: '1rem', alignItems: 'center' }}>
                                {['CANDIDATE', 'CODING TEST', 'AI SCORE', 'RECOMMENDATION', 'ACTION'].map(h => (
                                    <span key={h} style={{ fontSize: '0.67rem', fontWeight: 800, letterSpacing: '0.1em', color: '#334155', textTransform: 'uppercase' }}>{h}</span>
                                ))}
                            </div>

                            {candidates.filter(c => c.interview_completed && c.interview_data).length === 0 ? (
                                <div style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(56,189,248,0.08)', border: '2px solid rgba(56,189,248,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 18px rgba(56,189,248,0.2)' }}>
                                        <Video size={28} color="#38bdf8" />
                                    </div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '0.88rem' }}>No AI Interviews completed yet.</p>
                                    <p style={{ margin: '0.3rem 0 0', color: '#1e293b', fontSize: '0.78rem' }}>Results will appear here once candidates finish their sessions.</p>
                                </div>
                            ) : candidates.filter(c => c.interview_completed && c.interview_data).map((c, idx) => {
                                const ev = c.interview_data.evaluation;
                                const recColor = ev.recommendation === 'Hire' ? '#34d399' : ev.recommendation === 'Reject' ? '#f87171' : '#fbbf24';
                                const accent = ACCENTS[idx % ACCENTS.length];
                                return (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 140px 120px', padding: '0.9rem 1.5rem', borderBottom: '1px solid rgba(56,189,248,0.06)', gap: '1rem', alignItems: 'center', cursor: 'pointer', animation: 'spFadeIn 0.3s ease both', animationDelay: `${idx * 0.04}s` }}
                                        onClick={() => setExpanded(c.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 0 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', boxShadow: `0 0 10px ${accent.glow}` }}>{c.name?.charAt(0).toUpperCase()}</div>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.88rem' }}>{c.test_score ? `${c.test_score}%` : 'N/A'}</span>
                                        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: ev.score >= 70 ? '#34d399' : ev.score >= 50 ? '#fbbf24' : '#f87171', textShadow: ev.score >= 70 ? '0 0 10px rgba(52,211,153,0.7)' : ev.score >= 50 ? '0 0 10px rgba(251,191,36,0.7)' : '0 0 10px rgba(248,113,113,0.7)' }}>{ev.score}%</span>
                                        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: recColor, background: `${recColor}18`, border: `1px solid ${recColor}44`, padding: '0.25rem 0.7rem', borderRadius: 999, display: 'inline-block' }}>{ev.recommendation}</span>
                                        <button className="sp-btn" onClick={e => { e.stopPropagation(); setExpanded(c.id); }}
                                            style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: 8, color: '#38bdf8', cursor: 'pointer', padding: '0.38rem 0.7rem', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                            View Feedback
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentPortal;
