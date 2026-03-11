import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, UploadCloud, Zap, Brain, Database, Sparkles, FileText, ArrowRight, X } from 'lucide-react';

// Inject styles once
const STYLE_ID = 'upload-resume-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes urSpin   { to { transform: rotate(360deg); } }
    @keyframes urBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes urPulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.08)} }
    @keyframes urShimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes urDrop   { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes urGlow   { 0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.3)} 50%{box-shadow:0 0 40px rgba(124,58,237,0.7)} }
    @keyframes urRing   { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }

    .ur-dropzone { transition: all 0.3s cubic-bezier(0.34,1.1,0.64,1); }
    .ur-dropzone:hover { transform: scale(1.01); }
    .ur-dropzone.dragging { animation: urGlow 1.5s ease infinite; }

    .ur-step-icon { transition: all 0.3s ease; }
    .ur-step-icon.active { animation: urPulse 1.2s ease infinite; }

    .ur-select { appearance:none; -webkit-appearance:none; }
    .ur-select option { background: #1a0742; color: #e2e8f0; }

    .ur-info-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .ur-info-card:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(124,58,237,0.25) !important; }
  `;
  document.head.appendChild(s);
}

const PIPELINE_STAGES = [
  { key: 'uploading', label: 'Uploading File', sub: 'Sending to server securely', icon: <UploadCloud size={18} />, color: '#6366f1', glow: 'rgba(99,102,241,0.5)' },
  { key: 'parsing', label: 'Gemini AI Parsing', sub: 'Extracting skills & data', icon: <Brain size={18} />, color: '#a855f7', glow: 'rgba(168,85,247,0.5)' },
  { key: 'saving', label: 'Saving to Database', sub: 'Storing candidate profile', icon: <Database size={18} />, color: '#0ea5e9', glow: 'rgba(14,165,233,0.5)' },
  { key: 'done', label: 'Complete!', sub: 'Candidate ranked & ready', icon: <CheckCircle size={18} />, color: '#34d399', glow: 'rgba(52,211,153,0.5)' },
];

const UploadResume = ({ onUploadSuccess, setActiveView, token }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');

  useEffect(() => {
    fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setJobs(d); if (d.length > 0) setSelectedJob(d[0].id); })
      .catch(() => { });
  }, [token]);

  const validateAndSetFile = (f) => {
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      setError('Only .pdf, .doc, and .docx files are accepted.'); setStage('error'); setFile(null); return;
    }
    setFile(f); setStage('idle'); setError(''); setResult(null);
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]); };
  const handleFileSelect = (e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]); };

  const handleUpload = async () => {
    if (!file) return;
    setStage('uploading'); setError(''); setResult(null);
    const fd = new FormData();
    fd.append('resume', file);
    fd.append('name', file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    if (selectedJob) fd.append('jobId', selectedJob);
    try {
      setStage('parsing');
      const res = await fetch('/api/resume/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || `Upload failed (${res.status})`); setStage('error'); return; }
      setStage('done'); setResult(data); onUploadSuccess();
    } catch (err) {
      setError(`Network error: ${err.message}. Is the backend running?`); setStage('error');
    }
  };

  const isProcessing = stage === 'uploading' || stage === 'parsing';
  const stageIndex = PIPELINE_STAGES.findIndex(s => s.key === stage);

  const scoreColor = result ? (result.score >= 85 ? '#34d399' : result.score >= 70 ? '#fbbf24' : '#f87171') : '#34d399';
  const scoreGlow = result ? (result.score >= 85 ? 'rgba(52,211,153,0.6)' : result.score >= 70 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)') : 'rgba(52,211,153,0.6)';

  return (
    <div style={{ animation: 'urDrop 0.4s ease both', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ══════════════════════════════
            LEFT — Upload Panel
            ══════════════════════════════ */}
        <div style={{
          background: 'linear-gradient(155deg, rgba(20,10,52,0.95) 0%, rgba(12,15,40,0.95) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(167,139,250,0.2)',
          boxShadow: '0 0 40px rgba(124,58,237,0.15), 0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
        }}>
          {/* Rainbow top bar */}
          <div style={{ height: '3px', background: 'linear-gradient(90deg, #a855f7, #6366f1, #0ea5e9, #34d399)' }} />

          <div style={{ padding: '1.75rem' }}>

            {/* Panel title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }}>
                <UploadCloud size={16} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.97rem', color: '#e2e8f0' }}>Upload Resume</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569' }}>Gemini AI parses, scores and ranks automatically</p>
              </div>
            </div>

            {/* Job selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <Zap size={13} /> Screen Against Job
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="ur-select"
                  value={selectedJob}
                  onChange={e => setSelectedJob(e.target.value)}
                  style={{
                    width: '100%', background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.25)', padding: '0.75rem 2.5rem 0.75rem 1rem',
                    borderRadius: '10px', color: jobs.length === 0 ? '#64748b' : '#e2e8f0',
                    fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(139,92,246,0.25)'; e.target.style.boxShadow = 'none'; }}
                >
                  {jobs.length === 0
                    ? <option value="">⚠️ No jobs yet — create one first</option>
                    : jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)
                  }
                </select>
                {/* Arrow indicator */}
                <div style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#7c3aed', pointerEvents: 'none' }}>▾</div>
              </div>
            </div>

            {/* DROP ZONE */}
            <div
              className={`ur-dropzone${isDragging ? ' dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !isProcessing && document.getElementById('urFileInput').click()}
              style={{
                position: 'relative', overflow: 'hidden',
                border: `2px dashed ${isDragging ? '#a78bfa' : file ? '#34d399' : 'rgba(139,92,246,0.3)'}`,
                borderRadius: '16px',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                background: isDragging
                  ? 'rgba(139,92,246,0.1)'
                  : file && stage !== 'error'
                    ? 'rgba(52,211,153,0.05)'
                    : 'rgba(139,92,246,0.03)',
                minHeight: '220px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <input id="urFileInput" type="file" hidden accept=".pdf,.doc,.docx" onChange={handleFileSelect} />

              {/* Decorative corner glow */}
              {isDragging && <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />}

              {/* Icon */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', marginBottom: '1.1rem',
                background: file && stage !== 'error'
                  ? 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))'
                  : isDragging
                    ? 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(99,102,241,0.2))'
                    : 'rgba(139,92,246,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${file && stage !== 'error' ? 'rgba(52,211,153,0.4)' : isDragging ? 'rgba(167,139,250,0.5)' : 'rgba(139,92,246,0.2)'}`,
                boxShadow: file && stage !== 'error' ? '0 0 20px rgba(52,211,153,0.3)' : isDragging ? '0 0 20px rgba(167,139,250,0.4)' : 'none',
                animation: isDragging ? 'urBounce 1s ease infinite' : 'none',
              }}>
                {file && stage !== 'error'
                  ? <CheckCircle size={36} color="#34d399" style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.8))' }} />
                  : <UploadCloud size={36} color={isDragging ? '#a78bfa' : '#475569'} />
                }
              </div>

              {file && stage !== 'error' ? (
                <>
                  <p style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                    <FileText size={14} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                    {file.name}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {(file.size / 1024).toFixed(1)} KB · click to change file
                  </p>
                </>
              ) : (
                <>
                  <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', color: isDragging ? '#c4b5fd' : '#94a3b8', fontWeight: 700 }}>
                    {isDragging ? '✨ Drop it here!' : 'Click or Drag & Drop'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>PDF · DOC · DOCX · Max 5MB</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', justifyContent: 'center' }}>
                    {['PDF', 'DOC', 'DOCX'].map(fmt => (
                      <span key={fmt} style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#7c3aed', fontSize: '0.7rem', fontWeight: 700 }}>
                        {fmt}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            {stage === 'error' && (
              <div style={{ marginTop: '1rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '12px', padding: '0.9rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <AlertCircle size={17} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.83rem', color: '#fca5a5', margin: 0, lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Upload button */}
            {stage !== 'done' && (
              <button
                onClick={handleUpload}
                disabled={!file || isProcessing}
                style={{
                  width: '100%', marginTop: '1.25rem', padding: '0.95rem',
                  background: !file || isProcessing
                    ? 'rgba(139,92,246,0.2)'
                    : 'linear-gradient(135deg, #7c3aed, #6366f1)',
                  color: !file || isProcessing ? '#475569' : '#fff',
                  border: 'none', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.95rem', cursor: !file || isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: !file || isProcessing ? 'none' : '0 0 25px rgba(124,58,237,0.55), 0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (file && !isProcessing) { e.currentTarget.style.boxShadow = '0 0 35px rgba(124,58,237,0.8), 0 4px 16px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = !file || isProcessing ? 'none' : '0 0 25px rgba(124,58,237,0.55), 0 4px 12px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isProcessing
                  ? <><Loader size={17} style={{ animation: 'urSpin 1s linear infinite' }} /> Analyzing with Gemini AI…</>
                  : <><Zap size={17} /> Process with AI</>
                }
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════
            RIGHT PANEL
            ══════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* AI Processing Pipeline */}
          <div style={{
            background: 'linear-gradient(155deg, rgba(20,10,52,0.95), rgba(12,15,40,0.95))',
            borderRadius: '18px', border: '1px solid rgba(139,92,246,0.18)',
            boxShadow: '0 0 30px rgba(124,58,237,0.1), 0 6px 24px rgba(0,0,0,0.35)',
            overflow: 'hidden',
          }}>
            <div style={{ height: '3px', background: 'linear-gradient(90deg, #a855f7, #6366f1, #0ea5e9, #34d399)' }} />
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={13} /> AI Processing Pipeline
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {PIPELINE_STAGES.map((s, i) => {
                  const isDone = stage === 'done' || (stageIndex > i && stageIndex !== -1);
                  const isActive = stage === s.key;
                  const isPending = !isDone && !isActive;

                  return (
                    <div key={s.key}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.7rem 0.85rem', borderRadius: '12px', background: isActive ? `${s.glow.replace('0.5', '0.08')}` : isDone ? 'rgba(52,211,153,0.05)' : 'transparent', transition: 'all 0.3s' }}>
                        {/* Step circle */}
                        <div
                          className={`ur-step-icon${isActive ? ' active' : ''}`}
                          style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDone
                              ? 'rgba(52,211,153,0.15)'
                              : isActive
                                ? `${s.glow.replace('0.5', '0.15')}`
                                : 'rgba(255,255,255,0.03)',
                            border: `2px solid ${isDone ? '#34d399' : isActive ? s.color : 'rgba(139,92,246,0.12)'}`,
                            boxShadow: isDone ? '0 0 12px rgba(52,211,153,0.4)' : isActive ? `0 0 12px ${s.glow}` : 'none',
                            color: isDone ? '#34d399' : isActive ? s.color : '#334155',
                          }}
                        >
                          {isDone
                            ? <CheckCircle size={18} />
                            : isActive
                              ? <Loader size={18} style={{ animation: 'urSpin 1s linear infinite' }} />
                              : <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{i + 1}</span>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: isDone || isActive ? 700 : 400, color: isDone ? '#34d399' : isActive ? '#e2e8f0' : '#334155', fontSize: '0.88rem', lineHeight: 1.2 }}>
                            {s.label}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: isDone ? '#064e3b' : isActive ? '#64748b' : '#1e293b', marginTop: '0.15rem' }}>
                            {isDone ? '✓ Completed' : isActive ? '⚡ Running…' : s.sub}
                          </p>
                        </div>
                        {isDone && (
                          <CheckCircle size={15} color="#34d399" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(52,211,153,0.6))' }} />
                        )}
                      </div>
                      {/* Connector line */}
                      {i < PIPELINE_STAGES.length - 1 && (
                        <div style={{ marginLeft: '1.85rem', width: '2px', height: '12px', background: isDone ? 'rgba(52,211,153,0.4)' : 'rgba(139,92,246,0.1)', borderRadius: '999px' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info mini cards */}
          {stage === 'idle' && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { icon: '🧠', title: 'Gemini AI Parsing', body: 'Extracts name, email, skills, experience and ranks the candidate.' },
                { icon: '⚡', title: 'Instant Score', body: 'AI assigns a match score against your job requirements in seconds.' },
                { icon: '📧', title: 'Auto Email', body: 'Shortlisted candidates get an interview test email automatically.' },
              ].map(card => (
                <div key={card.title} className="ur-info-card" style={{
                  padding: '0.9rem 1rem',
                  background: 'rgba(139,92,246,0.06)',
                  border: '1px solid rgba(139,92,246,0.14)',
                  borderRadius: '12px',
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{card.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: '#c4b5fd', fontSize: '0.82rem' }}>{card.title}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', lineHeight: 1.5, marginTop: '0.15rem' }}>{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── RESULT CARD ── */}
          {result && stage === 'done' && (
            <div style={{
              animation: 'urDrop 0.4s cubic-bezier(0.34,1.2,0.64,1) both',
              background: 'linear-gradient(155deg, rgba(20,10,52,0.95), rgba(12,15,40,0.95))',
              borderRadius: '18px', overflow: 'hidden',
              border: '1px solid rgba(52,211,153,0.3)',
              boxShadow: '0 0 30px rgba(52,211,153,0.15), 0 6px 24px rgba(0,0,0,0.35)',
            }}>
              <div style={{ height: '3px', background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }} />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.1rem' }}>
                  <CheckCircle size={18} color="#34d399" style={{ filter: 'drop-shadow(0 0 6px rgba(52,211,153,0.8))' }} />
                  <h3 style={{ margin: 0, color: '#34d399', fontWeight: 700, fontSize: '0.95rem' }}>Resume Processed!</h3>
                </div>

                {/* Candidate row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg, ${scoreColor}33, ${scoreColor}18)`, border: `2px solid ${scoreColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: scoreColor, fontSize: '1.1rem', boxShadow: `0 0 12px ${scoreGlow}` }}>
                      {(result.candidate?.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0, color: '#e2e8f0' }}>{result.candidate?.name || 'Candidate'}</p>
                      <p style={{ fontSize: '0.72rem', color: '#475569', margin: 0 }}>{result.candidate?.email || ''}</p>
                    </div>
                  </div>
                  {/* Score ring */}
                  <div style={{ position: 'relative', width: 56, height: 56, borderRadius: '50%', background: `conic-gradient(${scoreColor} ${result.score * 3.6}deg, rgba(255,255,255,0.04) 0deg)`, boxShadow: `0 0 18px ${scoreGlow}` }}>
                    <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', background: '#0c0a1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 900, color: scoreColor }}>{Math.round(result.score)}%</span>
                    </div>
                  </div>
                </div>

                {/* AI recommendation */}
                {result.ai_recommendation && (
                  <div style={{ background: 'rgba(139,92,246,0.08)', padding: '0.85rem', borderRadius: '10px', borderLeft: '3px solid #7c3aed', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>
                      <strong style={{ color: '#a78bfa' }}>AI:</strong> {result.ai_recommendation}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setActiveView('candidates')}
                  style={{
                    width: '100%', padding: '0.8rem',
                    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    boxShadow: '0 0 20px rgba(124,58,237,0.45)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.75)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  View in Rankings <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
