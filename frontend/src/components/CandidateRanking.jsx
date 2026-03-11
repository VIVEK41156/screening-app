import React, { useState } from 'react';
import { CheckCircle, XCircle, Filter, Eye, Trash2, Trophy, Medal, Star, Zap, Users, TrendingUp } from 'lucide-react';

// Inject once
const STYLE_ID = 'cr-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes crFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes crScoreBar { from{width:0} to{width:var(--target-w)} }
    @keyframes crPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
    @keyframes crGlow  { 0%,100%{box-shadow:0 0 12px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 30px rgba(124,58,237,0.7)} }

    .cr-card {
      animation: crFadeIn 0.32s cubic-bezier(0.34,1.1,0.64,1) both;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .cr-card:hover { transform: translateY(-3px) !important; }

    .cr-filter-btn { transition: all 0.18s ease; }
    .cr-action-btn { transition: all 0.18s ease; }
    .cr-action-btn:hover:not(:disabled) { filter: brightness(1.25); transform: translateY(-1px); }

    .cr-del-btn:hover:not(:disabled) { background: rgba(248,113,113,0.2) !important; color: #f87171 !important; border-color: rgba(248,113,113,0.4) !important; }
    .cr-score-fill { animation: crScoreBar 1s cubic-bezier(0.34,1.1,0.64,1) both; }
  `;
  document.head.appendChild(s);
}

// Rank badge configs for top 3
const RANK_CONFIGS = [
  { bg: 'linear-gradient(135deg,#f59e0b,#f97316)', glow: 'rgba(245,158,11,0.7)', icon: <Trophy size={16} color="#fff" />, label: '🥇' },
  { bg: 'linear-gradient(135deg,#94a3b8,#64748b)', glow: 'rgba(148,163,184,0.6)', icon: <Medal size={16} color="#fff" />, label: '🥈' },
  { bg: 'linear-gradient(135deg,#c2773e,#a05a2c)', glow: 'rgba(194,119,62,0.6)', icon: <Star size={16} color="#fff" />, label: '🥉' },
];

// Avatar accent palette
const ACCENTS = [
  { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.65)' },
  { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.65)' },
  { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.65)' },
  { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.65)' },
  { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.65)' },
  { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.65)' },
];

// Status styles
const STATUS = {
  Shortlisted: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', glow: 'rgba(52,211,153,0.25)', label: '✓ Shortlisted' },
  Review: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', glow: 'rgba(251,191,36,0.25)', label: '⏳ Review' },
  Rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', glow: 'rgba(248,113,113,0.25)', label: '✗ Rejected' },
  New: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', glow: 'rgba(148,163,184,0.15)', label: '🆕 New' },
};

// Glowing score bar
const ScoreBar = ({ score }) => {
  const color = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: 7, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        <div
          className="cr-score-fill"
          style={{
            '--target-w': `${score}%`,
            position: 'absolute', left: 0, top: 0, height: '100%',
            background: `linear-gradient(90deg, ${color}99, ${color})`,
            borderRadius: 999,
          }}
        />
      </div>
      <span style={{ fontWeight: 800, color, fontSize: '0.88rem', minWidth: 38, textAlign: 'right' }}>
        {score}%
      </span>
    </div>
  );
};

const FILTERS = ['All', 'Shortlisted', 'Review', 'Rejected', 'New'];

const CandidateRanking = ({ candidates, token, onViewProfile }) => {
  const [filter, setFilter] = useState('All');
  const [updating, setUpdating] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);

  const filtered = filter === 'All' ? candidates : candidates.filter(c => c.status === filter);

  const updateStatus = async (id, status) => {
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await fetch(`/api/candidates/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      window.location.reload();
    } catch (e) { console.error(e); }
    setUpdating(p => ({ ...p, [id]: false }));
  };

  const deleteCandidate = async (id) => {
    if (!window.confirm('Permanently delete this candidate?')) return;
    setUpdating(p => ({ ...p, [id]: true }));
    try {
      await fetch(`/api/candidates/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      window.location.reload();
    } catch (e) { console.error(e); }
    setUpdating(p => ({ ...p, [id]: false }));
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
      if (res.ok) window.location.reload();
    } catch (e) { console.error(e); }
  };

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;
  const toggleAll = () => setSelectedIds(allSelected ? [] : filtered.map(c => c.id));
  const toggleOne = (id) => setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  // Stat counts
  const counts = {
    All: candidates.length,
    Shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    Review: candidates.filter(c => c.status === 'Review').length,
    Rejected: candidates.filter(c => c.status === 'Rejected').length,
    New: candidates.filter(c => c.status === 'New').length,
  };

  if (!candidates || candidates.length === 0) {
    return (
      <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08)', textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
        <h3 style={{ color: '#e2e8f0', margin: '0 0 0.5rem' }}>No candidates yet</h3>
        <p style={{ color: '#475569', margin: 0 }}>Go to "Upload Resume" and upload some PDFs to get started.</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'crFadeIn 0.4s ease both' }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '13px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}>
            <TrendingUp size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>Candidate Rankings</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>{candidates.length} applicants · AI-ranked by match score</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {filtered.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll}
                style={{ width: 15, height: 15, accentColor: '#7c3aed', cursor: 'pointer' }} />
              Select All
            </label>
          )}
          {selectedIds.length > 0 && (
            <button onClick={handleBulkDelete}
              style={{ padding: '0.55rem 1rem', background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; }}
            >
              <Trash2 size={14} /> Delete ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* ── STAT SUMMARY ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', val: counts.All, color: '#8B5CF6', icon: <Users size={14} /> },
          { label: 'Shortlisted', val: counts.Shortlisted, color: '#10B981', icon: <CheckCircle size={14} /> },
          { label: 'Review', val: counts.Review, color: '#F59E0B', icon: <Filter size={14} /> },
          { label: 'Rejected', val: counts.Rejected, color: '#EF4444', icon: <XCircle size={14} /> },
        ].map(st => (
          <div key={st.label} style={{ flex: '1 1 120px', padding: '0.85rem 1.1rem', borderRadius: '14px', background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', gap: '0.7rem', minWidth: 110, boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
              {st.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{st.val}</p>
              <p style={{ margin: 0, fontSize: '0.67rem', color: '#475569', marginTop: '0.1rem' }}>{st.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── FILTER TABS ── */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const isActive = filter === f;
          const st = STATUS[f] || STATUS.New;
          return (
            <button key={f}
              className="cr-filter-btn"
              onClick={() => { setFilter(f); setSelectedIds([]); }}
              style={{
                padding: '0.45rem 1.1rem', borderRadius: '999px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: isActive ? 700 : 500,
                background: isActive ? (f === 'All' ? 'linear-gradient(135deg,#7c3aed,#6366f1)' : st.bg) : 'rgba(255,255,255,0.04)',
                color: isActive ? (f === 'All' ? '#fff' : st.color) : '#475569',
                border: isActive ? `1px solid ${f === 'All' ? '#7c3aed' : st.border}` : '1px solid rgba(139,92,246,0.12)',
                fontSize: '0.82rem',
                transition: 'all 0.18s ease',
              }}
            >
              {f} <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>{counts[f] !== undefined ? `(${counts[f]})` : ''}</span>
            </button>
          );
        })}
      </div>

      {/* ── CANDIDATE CARDS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map((c, i) => {
          const rank = i; // 0-based global rank (sorted by parent)
          const accent = ACCENTS[i % ACCENTS.length];
          const st = STATUS[c.status] || STATUS.New;
          const rc = rank < 3 ? RANK_CONFIGS[rank] : null;
          const score = Math.round(c.match_score || 0);
          const skills = Array.isArray(c.skills_matched) ? c.skills_matched : (c.skills || '').split(',').filter(Boolean);
          const isSelected = selectedIds.includes(c.id);

          return (
            <div key={c.id} className="cr-card"
              style={{
                background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))',
                borderRadius: '16px',
                border: isSelected ? '2px solid #7c3aed' : `1px solid ${rank < 3 ? (rc?.glow.replace('0.7', '0.3') || 'rgba(139,92,246,0.2)') : 'rgba(139,92,246,0.15)'}`,
                boxShadow: isSelected ? '0 0 24px rgba(124,58,237,0.5)' : rank < 3 ? `0 0 20px ${rc?.glow.replace('0.7', '0.15')}` : '0 4px 20px rgba(0,0,0,0.35)',
                overflow: 'hidden',
                animationDelay: `${i * 0.04}s`,
              }}
            >
              {/* Colored top strip: gold/silver/bronze for top 3, brand for rest */}
              <div style={{ height: '3px', background: rank < 3 ? rc?.bg : 'linear-gradient(90deg,#7c3aed,#6366f1)' }} />

              <div style={{ padding: '1.1rem 1.4rem' }}>
                {/* Main row */}
                <div style={{ display: 'grid', gridTemplateColumns: '20px 44px 1fr 260px 140px auto', gap: '1rem', alignItems: 'center' }}>
                  {/* Checkbox */}
                  <input type="checkbox" checked={isSelected} onChange={() => toggleOne(c.id)}
                    style={{ width: 15, height: 15, accentColor: 'var(--brand-primary)', cursor: 'pointer' }} />

                  {/* Rank badge */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                    background: rc ? rc.bg : 'rgba(124,58,237,0.1)',
                    border: rc ? 'none' : '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: rc ? `0 0 16px ${rc.glow}` : 'none',
                    fontSize: rc ? '1.3rem' : '0.82rem', fontWeight: 800,
                    color: rc ? '#fff' : '#7c3aed',
                  }}>
                    {rc ? rc.label : `#${i + 1}`}
                  </div>

                  {/* Candidate info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', minWidth: 0 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '12px', flexShrink: 0,
                      background: `linear-gradient(135deg,${accent.from},${accent.to})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                      boxShadow: `0 0 14px ${accent.glow}`,
                    }}>
                      {c.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</p>
                      <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</p>
                      {c.experience > 0 && <p style={{ margin: 0, fontSize: '0.68rem', color: '#334155' }}>{c.experience} yrs exp</p>}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div>
                    <p style={{ margin: '0 0 0.35rem', fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>AI Match Score</p>
                    <ScoreBar score={score} />
                  </div>

                  {/* Status pill */}
                  <div style={{ padding: '0.35rem 0.9rem', borderRadius: '999px', background: st.bg, color: st.color, fontWeight: 700, fontSize: '0.75rem', textAlign: 'center', border: `1px solid ${st.border}`, whiteSpace: 'nowrap' }}>
                    {st.label}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button className="cr-action-btn" onClick={() => onViewProfile(c)}
                      title="View Profile"
                      style={{ padding: '0.5rem 0.7rem', background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700 }}>
                      <Eye size={13} /> View
                    </button>
                    <button className="cr-action-btn" onClick={() => updateStatus(c.id, 'Shortlisted')}
                      disabled={updating[c.id] || c.status === 'Shortlisted'}
                      title="Shortlist"
                      style={{ padding: '0.5rem 0.55rem', background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', cursor: c.status === 'Shortlisted' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: c.status === 'Shortlisted' ? 0.35 : 1 }}>
                      <CheckCircle size={14} />
                    </button>
                    <button className="cr-action-btn" onClick={() => updateStatus(c.id, 'Rejected')}
                      disabled={updating[c.id] || c.status === 'Rejected'}
                      title="Reject"
                      style={{ padding: '0.5rem 0.55rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', cursor: c.status === 'Rejected' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', opacity: c.status === 'Rejected' ? 0.35 : 1 }}>
                      <XCircle size={14} />
                    </button>
                    <button className="cr-del-btn" onClick={() => deleteCandidate(c.id)}
                      disabled={updating[c.id]}
                      title="Delete"
                      style={{ padding: '0.5rem 0.55rem', background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Skills row */}
                {skills.length > 0 && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(139,92,246,0.1)', display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {skills.slice(0, 7).map((skill, si) => (
                      <span key={skill} style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '0.18rem 0.6rem', borderRadius: '999px',
                        background: `linear-gradient(135deg,${ACCENTS[si % ACCENTS.length].from}1a,${ACCENTS[si % ACCENTS.length].to}12)`,
                        color: `hsl(${260 + si * 30},70%,75%)`,
                        border: `1px solid ${ACCENTS[si % ACCENTS.length].from}33`,
                      }}>
                        {skill.trim()}
                      </span>
                    ))}
                    {skills.length > 7 && <span style={{ fontSize: '0.68rem', color: '#475569', padding: '0.18rem 0.4rem' }}>+{skills.length - 7} more</span>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateRanking;
