import React, { useState } from 'react';
import { Video, X, Play, Eye, Clock, CheckCircle, Award, Camera, Shield, Sparkles } from 'lucide-react';

// Inject styles once
const STYLE_ID = 'tvr-styles';
if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    @keyframes tvrFadeIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes tvrSlideUp { from{opacity:0;transform:translateY(40px) scale(0.93)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes tvrModalBounce {
      0% { opacity: 0; transform: scale(0.85) translateY(30px); }
      70% { transform: scale(1.03) translateY(-10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes tvrGlow    { 0%,100%{box-shadow:0 0 18px rgba(124,58,237,0.35)} 50%{box-shadow:0 0 36px rgba(124,58,237,0.75)} }
    @keyframes tvrPulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
    @keyframes tvrRing    { 0%{box-shadow:0 0 0 0 rgba(124,58,237,0.6)} 100%{box-shadow:0 0 0 14px rgba(124,58,237,0)} }
    @keyframes tvrScan    { 0%{top:0%} 100%{top:100%} }

    .tvr-card {
      animation: tvrFadeIn 0.35s cubic-bezier(0.34,1.1,0.64,1) both;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      cursor: pointer;
    }
    .tvr-card:hover { transform: translateY(-6px) !important; }
    .tvr-card:hover .tvr-play-btn { opacity: 1 !important; transform: scale(1) !important; }
    .tvr-card:hover .tvr-overlay  { opacity: 1 !important; }

    .tvr-play-btn {
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.25s cubic-bezier(0.34,1.2,0.64,1);
      animation: tvrGlow 2s ease infinite;
    }
    .tvr-overlay { opacity: 0; transition: opacity 0.22s ease; }

    .tvr-close:hover { background: rgba(248,113,113,0.3) !important; transform: scale(1.1); }
    .tvr-close { transition: all 0.18s ease; }
  `;
    document.head.appendChild(s);
}

const ACCENTS = [
    { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.7)' },
    { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.7)' },
    { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.7)' },
    { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.7)' },
    { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.7)' },
    { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.7)' },
];

const TestVideoRecords = ({ candidates }) => {
    const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const candidatesWithVideo = candidates.filter(c => c.test_completed && c.video_url);

    const openVideo = (c) => { setSelectedVideoUrl(c.video_url); setSelectedCandidate(c); };
    const closeVideo = (e) => {
        if (e && e.stopPropagation) { e.stopPropagation(); e.preventDefault(); }
        setSelectedVideoUrl(null);
        setSelectedCandidate(null);
    };

    const score = selectedCandidate?.test_score ?? 0;
    const scoreColor = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
    const scoreGlow = score >= 80 ? 'rgba(52,211,153,0.6)' : score >= 60 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)';

    return (
        <div style={{ animation: 'tvrFadeIn 0.4s ease both' }}>

            {/* ── TOP BAR ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '13px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(124,58,237,0.55)' }}>
                    <Video size={20} color="#fff" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e2e8f0' }}>Test Video Records</h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>Proctored session recordings from submitted assessments</p>
                </div>
                {/* Count pill */}
                <div style={{ marginLeft: 'auto', padding: '0.28rem 0.85rem', borderRadius: '999px', background: candidatesWithVideo.length > 0 ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,92,246,0.2)', color: candidatesWithVideo.length > 0 ? '#a78bfa' : '#475569', fontSize: '0.77rem', fontWeight: 800 }}>
                    {candidatesWithVideo.length} recording{candidatesWithVideo.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* ── STATS ROW ── */}
            {candidates.length > 0 && (
                <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Total Tested', val: candidates.filter(c => c.test_completed).length, color: '#8B5CF6', icon: <CheckCircle size={14} /> },
                        { label: 'With Recording', val: candidatesWithVideo.length, color: '#10B981', icon: <Camera size={14} /> },
                        { label: 'Avg Score', val: `${candidates.filter(c => c.test_completed).length > 0 ? Math.round(candidates.filter(c => c.test_completed).reduce((s, c) => s + (c.test_score || 0), 0) / candidates.filter(c => c.test_completed).length) : 0}%`, color: '#3B82F6', icon: <Award size={14} /> },
                    ].map(st => (
                        <div key={st.label} style={{ flex: '1 1 160px', padding: '0.9rem 1.1rem', borderRadius: '14px', background: 'linear-gradient(155deg,rgba(20,10,52,0.95),rgba(12,15,40,0.95))', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', gap: '0.7rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '9px', background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
                                {st.icon}
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: 900, color: st.color, lineHeight: 1 }}>{st.val}</p>
                                <p style={{ margin: 0, fontSize: '0.68rem', color: '#475569', marginTop: '0.1rem' }}>{st.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── VIDEO CARD GRID ── */}
            {candidatesWithVideo.length === 0 ? (
                <div style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '20px', border: '1px solid rgba(139,92,246,0.18)', boxShadow: '0 0 30px rgba(124,58,237,0.08),0 8px 28px rgba(0,0,0,0.35)', textAlign: 'center', padding: '5rem 2rem' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(124,58,237,0.1)', border: '2px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', boxShadow: '0 0 20px rgba(124,58,237,0.2)' }}>
                        <Video size={38} color="#a78bfa" />
                    </div>
                    <h3 style={{ color: '#e2e8f0', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>No Video Records Yet</h3>
                    <p style={{ color: '#475569', margin: 0, fontSize: '0.85rem' }}>Candidates who complete their test with camera active will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
                    {candidatesWithVideo.map((c, idx) => {
                        const accent = ACCENTS[idx % ACCENTS.length];
                        const cScore = c.test_score ?? 0;
                        const sc = cScore >= 80 ? '#10B981' : cScore >= 60 ? '#F59E0B' : '#EF4444';
                        const statusLabel = cScore >= 60 ? 'Passed' : 'Failed';
                        const statusIcon = cScore >= 60 ? <CheckCircle size={12} /> : <Award size={12} />;

                        return (
                            <div key={c.id} className="tvr-card"
                                style={{ background: 'linear-gradient(155deg,rgba(20,10,52,0.97),rgba(12,15,40,0.97))', borderRadius: '18px', border: `1px solid ${accent.glow.replace('0.7', '0.2')}`, boxShadow: '0 0 20px rgba(0,0,0,0.3)', overflow: 'hidden', animationDelay: `${idx * 0.06}s` }}
                                onClick={() => openVideo(c)}
                            >
                                {/* Gradient top strip */}
                                <div style={{ height: '3px', background: `linear-gradient(90deg,${accent.from},${accent.to})` }} />

                                {/* Video Thumbnail area */}
                                <div style={{ position: 'relative', height: 170, background: `radial-gradient(ellipse at 30% 40%, ${accent.from}22 0%, transparent 60%), linear-gradient(135deg,rgba(10,5,25,0.95),rgba(5,3,15,0.98))`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {/* Scan line effect */}
                                    <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,transparent,${accent.from}88,transparent)`, top: '30%', filter: 'blur(1px)', opacity: 0.5 }} />

                                    {/* Camera icon bg */}
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle,${accent.from}18 0%,transparent 70%)`, border: `1px solid ${accent.from}33` }} />

                                    {/* Center play button (appears on hover) */}
                                    <div className="tvr-play-btn"
                                        style={{ width: 58, height: 58, borderRadius: '50%', background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 22px ${accent.glow}, 0 0 0 8px ${accent.from}22`, zIndex: 2 }}>
                                        <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
                                    </div>

                                    {/* REC badge */}
                                    <div style={{ position: 'absolute', top: '0.7rem', left: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.22rem 0.6rem', borderRadius: '999px', background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.35)', boxShadow: '0 0 8px rgba(248,113,113,0.3)' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px rgba(248,113,113,0.9)', animation: 'tvrPulse 1.4s ease infinite' }} />
                                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.06em' }}>REC</span>
                                    </div>

                                    {/* Score ring top-right */}
                                    <div style={{ position: 'absolute', top: '0.65rem', right: '0.75rem', width: 42, height: 42, borderRadius: '50%', background: `conic-gradient(${sc} ${cScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(10,5,25,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 900, color: sc }}>{cScore}%</span>
                                        </div>
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="tvr-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }} />
                                </div>

                                {/* Card body */}
                                <div style={{ padding: '1.1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '10px', flexShrink: 0, background: `linear-gradient(135deg,${accent.from},${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', boxShadow: `0 0 10px ${accent.glow}` }}>
                                            {c.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                                        </div>
                                        {/* Status pill */}
                                        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3, padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 800, background: cScore >= 60 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: cScore >= 60 ? '#10B981' : '#EF4444', border: `1px solid ${cScore >= 60 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, whiteSpace: 'nowrap' }}>
                                            {statusIcon} {statusLabel}
                                        </span>
                                    </div>

                                    {/* Play button */}
                                    <button
                                        style={{ width: '100%', padding: '0.72rem', background: `linear-gradient(135deg,${accent.from},${accent.to})`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontFamily: "'Outfit',sans-serif", fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: `0 0 18px ${accent.glow.replace('0.7', '0.5')}`, transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 28px ${accent.glow}`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 0 18px ${accent.glow.replace('0.7', '0.5')}`; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <Play size={16} fill="currentColor" /> Play Recording
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ══════════════════════════════════════
          PREMIUM VIDEO PLAYER MODAL (CUTE UPGRADE)
          ══════════════════════════════════════ */}
            {selectedVideoUrl && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 10, 30, 0.75)', backdropFilter: 'blur(12px)', animation: 'tvrFadeIn 0.25s ease both' }}
                    onClick={closeVideo}
                >
                    <div
                        className="re-invert"
                        style={{ position: 'relative', width: '90%', maxWidth: 700, borderRadius: '28px', overflow: 'hidden', background: 'linear-gradient(155deg, #1e1b4b, #110f22)', border: '2px solid rgba(244, 114, 182, 0.3)', boxShadow: `0 0 60px rgba(244, 114, 182, 0.15), 0 20px 80px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.05)`, animation: 'tvrModalBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Rainbow top strip (cuter pastel colors) */}
                        <div style={{ height: '5px', background: 'linear-gradient(90deg, #f472b6, #c084fc, #60a5fa, #34d399)' }} />

                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(244, 114, 182, 0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {/* Avatar */}
                                <div className="re-invert" style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #f472b6, #c084fc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', fontWeight: 800, color: '#fff', boxShadow: '0 0 20px rgba(244, 114, 182, 0.4)', flexShrink: 0 }}>
                                    {selectedCandidate?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fdf4ff', fontFamily: "'Outfit',sans-serif" }}>
                                        {selectedCandidate?.name}'s Session ✨
                                    </h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.3rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', fontWeight: 800, color: scoreColor, textShadow: `0 0 10px ${scoreGlow}` }}>
                                            <Award size={12} /> Test Score: {selectedCandidate?.test_score}%
                                        </span>
                                        <span style={{ color: '#475569' }}>·</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                            <Shield size={12} color="#f472b6" /> Proctored
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Close button - Made cuter and more obvious */}
                            <button className="tvr-close re-invert" onClick={closeVideo} title="Close Video"
                                style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #fecdd3, #fda4af)', border: 'none', color: '#be123c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)', transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 63, 94, 0.5)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(244, 63, 94, 0.3)'; }}
                            >
                                <X size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* Video player */}
                        <div
                            style={{ position: 'relative', background: '#000', margin: '1rem 1.5rem', borderRadius: '18px', overflow: 'hidden', border: `2px solid rgba(192, 132, 252, 0.4)`, boxShadow: `0 0 30px rgba(192, 132, 252, 0.25)`, transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <video
                                className="re-invert"
                                src={`https://screening-backend.onrender.com${selectedVideoUrl}`}
                                controls autoPlay
                                style={{ width: '100%', display: 'block', maxHeight: 380, objectFit: 'contain', background: '#000', borderRadius: '16px' }}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        {/* Footer info strip */}
                        <div style={{ padding: '0.5rem 1.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                                <Camera size={14} color="#f472b6" /> Proctored recording
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                                <Sparkles size={14} color="#c084fc" /> AI analyzed
                            </div>
                            <div style={{ marginLeft: 'auto', padding: '0.35rem 1rem', borderRadius: '999px', background: `linear-gradient(135deg, ${scoreColor}22, ${scoreColor}44)`, border: `2px solid ${scoreColor}88`, color: scoreColor, fontSize: '0.8rem', fontWeight: 800, boxShadow: `0 0 16px ${scoreGlow}` }}>
                                {score >= 60 ? '✨ Passed' : '💔 Failed'} · {score}%
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestVideoRecords;
