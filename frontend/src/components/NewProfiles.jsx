import React, { useState } from 'react';
import { UserPlus, Cpu, CheckCircle, Search, AlertTriangle, Play, FileText, Trash2, Sparkles, Zap, Users } from 'lucide-react';

// Inject styles once
const STYLE_ID = 'new-profiles-styles';
if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    @keyframes npSpin   { to { transform: rotate(360deg); } }
    @keyframes npFadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes npPulse  { 0%,100%{opacity:1} 50%{opacity:0.6} }
    @keyframes npGlow   { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 28px rgba(124,58,237,0.7)} }
    @keyframes npRainbow{ 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }

    .np-card {
      animation: npFadeIn 0.3s cubic-bezier(0.34,1.1,0.64,1) both;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .np-card:hover {
      transform: translateY(-3px) !important;
    }
    .np-search:focus {
      outline: none;
      border-color: #a78bfa !important;
      box-shadow: 0 0 0 3px rgba(167,139,250,0.15) !important;
    }
    .np-search::placeholder { color: #334155; }
    .np-del-btn:hover { background: rgba(248,113,113,0.2) !important; color: #f87171 !important; border-color: rgba(248,113,113,0.4) !important; }
    .np-run-btn:hover:not(:disabled) {
      box-shadow: 0 0 30px rgba(124,58,237,0.8) !important;
      transform: translateY(-1px);
    }
    .np-sel-check { accent-color: #7c3aed; width: 16px; height: 16px; cursor: pointer; }
  `;
    document.head.appendChild(s);
}

// Per-candidate avatar accent colors
const AVATAR_ACCENTS = [
    { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.6)' },
    { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.6)' },
    { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.6)' },
    { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.6)' },
    { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.6)' },
    { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.6)' },
];

const NewProfiles = ({ candidates, token, onScreenComplete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [screeningCache, setScreeningCache] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);

    const newCandidates = candidates.filter(c =>
        (c.status === 'New' || c.status === 'Review') &&
        (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleScreening = async (candidateId) => {
        if (screeningCache[candidateId]) return;
        setScreeningCache(prev => ({ ...prev, [candidateId]: 'processing' }));
        try {
            const res = await fetch(`/api/candidates/${candidateId}/screen`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Screening failed');
            setScreeningCache(prev => ({ ...prev, [candidateId]: 'completed' }));
            if (onScreenComplete) setTimeout(onScreenComplete, 1000);
        } catch {
            setScreeningCache(prev => ({ ...prev, [candidateId]: 'error' }));
        }
    };

    const handleDelete = async (candidateId) => {
        if (!window.confirm('Permanently delete this candidate?')) return;
        try {
            const res = await fetch(`/api/candidates/${candidateId}`, {
                method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok && onScreenComplete) {
                setSelectedIds(prev => prev.filter(id => id !== candidateId));
                onScreenComplete();
            }
        } catch (err) { console.error(err); }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Permanently delete ${selectedIds.length} candidate(s)?`)) return;
        try {
            const res = await fetch('/api/candidates/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ candidateIds: selectedIds })
            });
            if (res.ok && onScreenComplete) { setSelectedIds([]); onScreenComplete(); }
        } catch (err) { console.error(err); }
    };

    const allSelected = newCandidates.length > 0 && selectedIds.length === newCandidates.length;
    const toggleSelectAll = () => setSelectedIds(allSelected ? [] : newCandidates.map(c => c.id));
    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    return (
        <div style={{ animation: 'npFadeIn 0.4s ease both' }}>

            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Left: Icon + title + count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '13px',
                        background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 18px rgba(124,58,237,0.55)',
                    }}>
                        <UserPlus size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>New Profiles Inbox</h2>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Direct applications pending AI screening</p>
                    </div>
                    {/* Live count pill */}
                    <div style={{
                        padding: '0.25rem 0.85rem', borderRadius: '999px', fontSize: '0.77rem', fontWeight: 800,
                        background: newCandidates.length > 0 ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                        border: newCandidates.length > 0 ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(255,255,255,0.06)',
                        color: newCandidates.length > 0 ? '#a78bfa' : '#334155',
                        boxShadow: newCandidates.length > 0 ? '0 0 10px rgba(124,58,237,0.25)' : 'none',
                    }}>
                        {newCandidates.length} pending
                    </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            style={{
                                padding: '0.6rem 1.1rem', background: 'rgba(248,113,113,0.1)',
                                color: '#f87171', border: '1px solid rgba(248,113,113,0.25)',
                                borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                                display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
                        >
                            <Trash2 size={15} /> Delete ({selectedIds.length})
                        </button>
                    )}

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                        <input
                            className="np-search"
                            type="text"
                            placeholder="Search candidates…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                background: 'rgba(139,92,246,0.06)',
                                border: '1px solid rgba(139,92,246,0.18)',
                                padding: '0.65rem 1rem 0.65rem 2.4rem',
                                borderRadius: '10px', color: '#e2e8f0',
                                fontFamily: 'inherit', fontSize: '0.85rem',
                                width: '250px', transition: 'all 0.2s',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* ── STATS ROW ── */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Pending Review', value: newCandidates.length, color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', icon: <Users size={16} /> },
                    { label: 'Ready for AI', value: newCandidates.filter(c => c.resume_text).length, color: '#34d399', glow: 'rgba(52,211,153,0.3)', icon: <Sparkles size={16} /> },
                    { label: 'Needs Review', value: newCandidates.filter(c => !c.resume_text).length, color: '#fbbf24', glow: 'rgba(251,191,36,0.3)', icon: <AlertTriangle size={16} /> },
                ].map(stat => (
                    <div key={stat.label} style={{
                        flex: 1, padding: '1rem 1.25rem',
                        background: 'linear-gradient(135deg, rgba(20,10,52,0.9), rgba(12,15,40,0.9))',
                        border: `1px solid ${stat.glow.replace('0.3', '0.25')}`,
                        borderRadius: '14px',
                        boxShadow: `0 0 20px ${stat.glow.replace('0.3', '0.1')}`,
                        display: 'flex', alignItems: 'center', gap: '0.85rem',
                    }}>
                        <div style={{ width: 38, height: 38, borderRadius: '10px', background: `${stat.glow.replace('0.3', '0.15')}`, border: `1px solid ${stat.glow.replace('0.3', '0.3')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, boxShadow: `0 0 12px ${stat.glow}` }}>
                            {stat.icon}
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: stat.color, lineHeight: 1, textShadow: `0 0 16px ${stat.glow}` }}>{stat.value}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', marginTop: '0.1rem' }}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── MAIN TABLE CARD ── */}
            <div style={{
                background: 'linear-gradient(155deg, rgba(20,10,52,0.95), rgba(12,15,40,0.95))',
                borderRadius: '18px',
                border: '1px solid rgba(139,92,246,0.18)',
                boxShadow: '0 0 35px rgba(124,58,237,0.1), 0 8px 28px rgba(0,0,0,0.35)',
                overflow: 'hidden',
            }}>
                {/* Gradient top strip */}
                <div style={{ height: '3px', background: 'linear-gradient(90deg, #a855f7, #6366f1, #0ea5e9, #34d399)' }} />

                {/* Table header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '40px 1fr 220px 200px 160px',
                    padding: '0.85rem 1.5rem',
                    background: 'rgba(139,92,246,0.06)',
                    borderBottom: '1px solid rgba(139,92,246,0.12)',
                    alignItems: 'center', gap: '1rem',
                }}>
                    <input type="checkbox" className="np-sel-check" checked={allSelected} onChange={toggleSelectAll} />
                    {['APPLICANT', 'RESUME STATUS', 'EXPERIENCE', 'ACTIONS'].map(col => (
                        <span key={col} style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: '#475569', textTransform: 'uppercase' }}>{col}</span>
                    ))}
                </div>

                {/* Rows */}
                {newCandidates.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '2px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem', boxShadow: '0 0 20px rgba(52,211,153,0.2)' }}>
                            <CheckCircle size={34} color="#34d399" style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>Inbox Zero! 🎉</p>
                        <p style={{ margin: '0.4rem 0 0', fontSize: '0.82rem', color: '#334155' }}>No un-screened profiles pending right now.</p>
                    </div>
                ) : (
                    newCandidates.map((c, idx) => {
                        const accent = AVATAR_ACCENTS[idx % AVATAR_ACCENTS.length];
                        const status = screeningCache[c.id];
                        const isSelected = selectedIds.includes(c.id);
                        const hasResume = !!c.resume_text;

                        return (
                            <div
                                key={c.id}
                                className="np-card"
                                style={{
                                    display: 'grid', gridTemplateColumns: '40px 1fr 220px 200px 160px',
                                    padding: '1rem 1.5rem', gap: '1rem', alignItems: 'center',
                                    borderBottom: '1px solid rgba(139,92,246,0.08)',
                                    background: isSelected ? 'rgba(124,58,237,0.07)' : 'transparent',
                                    animationDelay: `${idx * 0.04}s`,
                                    boxShadow: isSelected ? '0 0 0 1px rgba(139,92,246,0.2) inset' : 'none',
                                }}
                            >
                                {/* Checkbox */}
                                <input type="checkbox" className="np-sel-check" checked={isSelected} onChange={() => toggleSelect(c.id)} />

                                {/* Applicant */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                                        boxShadow: `0 0 14px ${accent.glow}`,
                                        border: `1px solid ${accent.from}55`,
                                    }}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.92rem' }}>{c.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.73rem', color: '#475569' }}>{c.email}</p>
                                    </div>
                                </div>

                                {/* Resume Status */}
                                <div>
                                    {hasResume ? (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 700,
                                            background: 'rgba(52,211,153,0.12)', color: '#34d399',
                                            border: '1px solid rgba(52,211,153,0.3)',
                                            boxShadow: '0 0 8px rgba(52,211,153,0.2)',
                                        }}>
                                            <FileText size={12} /> Ready for AI
                                        </span>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                            padding: '0.3rem 0.85rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 700,
                                            background: 'rgba(251,191,36,0.1)', color: '#fbbf24',
                                            border: '1px solid rgba(251,191,36,0.25)',
                                            boxShadow: '0 0 8px rgba(251,191,36,0.15)',
                                        }}>
                                            <AlertTriangle size={12} /> Needs Review
                                        </span>
                                    )}
                                </div>

                                {/* Experience */}
                                <div>
                                    <span style={{ fontSize: '0.83rem', color: '#64748b' }}>
                                        {c.experience > 0 ? `${c.experience} yr${c.experience !== 1 ? 's' : ''}` : 'Fresher'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    {status === 'processing' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(167,139,250,0.2)', animation: 'npPulse 1.5s ease infinite' }}>
                                            <Cpu size={14} style={{ animation: 'npSpin 1s linear infinite' }} /> Analyzing…
                                        </div>
                                    ) : status === 'completed' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: '8px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
                                            <CheckCircle size={14} /> Done ✓
                                        </div>
                                    ) : status === 'error' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.8rem', fontWeight: 700, padding: '0.5rem 0.9rem', borderRadius: '8px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                                            <AlertTriangle size={14} /> Failed
                                        </div>
                                    ) : (
                                        <button
                                            className="np-run-btn"
                                            onClick={() => handleScreening(c.id)}
                                            disabled={!hasResume}
                                            style={{
                                                padding: '0.5rem 0.9rem',
                                                background: hasResume ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'rgba(255,255,255,0.04)',
                                                color: hasResume ? '#fff' : '#334155',
                                                border: 'none', borderRadius: '8px', cursor: hasResume ? 'pointer' : 'not-allowed',
                                                fontWeight: 700, fontSize: '0.78rem',
                                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                                boxShadow: hasResume ? '0 0 16px rgba(124,58,237,0.45)' : 'none',
                                                transition: 'all 0.2s', opacity: hasResume ? 1 : 0.5,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            <Zap size={13} /> Run AI
                                        </button>
                                    )}

                                    {/* Delete */}
                                    <button
                                        className="np-del-btn"
                                        onClick={() => handleDelete(c.id)}
                                        title="Delete"
                                        style={{
                                            padding: '0.5rem 0.55rem',
                                            background: 'rgba(255,255,255,0.04)',
                                            color: '#475569',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                            borderRadius: '8px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── BOTTOM INFO STRIP ── */}
            <div style={{
                marginTop: '1.25rem', padding: '1rem 1.25rem',
                background: 'rgba(124,58,237,0.06)',
                borderRadius: '12px', border: '1px solid rgba(139,92,246,0.14)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(167,139,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', boxShadow: '0 0 10px rgba(124,58,237,0.3)', flexShrink: 0 }}>
                    <Cpu size={15} />
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>On-Demand AI:</span>
                    {' '}Applications are captured instantly. Click <strong style={{ color: '#e2e8f0' }}>Run AI</strong> to analyze and automatically route them to Shortlisted or Rejected.
                </p>
            </div>
        </div>
    );
};

export default NewProfiles;
