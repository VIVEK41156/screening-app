import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, CheckCircle, MapPin, DollarSign, Clock, Trash2, ExternalLink, Copy, Share2, Zap } from 'lucide-react';

// Inject global styles once
const STYLE_ID = 'create-job-styles';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes cjFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes cjCardIn { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes shimmerBg { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    .cj-input { transition: border-color 0.2s, box-shadow 0.2s; }
    .cj-input:focus { outline:none; border-color: #a78bfa !important; box-shadow: 0 0 0 3px rgba(167,139,250,0.2), 0 0 15px rgba(139,92,246,0.2) !important; }
    .cj-input::placeholder { color: #334155; }
    .cj-job-card { animation: cjCardIn 0.3s cubic-bezier(0.34,1.2,0.64,1) both; }
    .cj-job-card:hover { transform: translateY(-4px) !important; box-shadow: 0 0 40px rgba(124,58,237,0.3), 0 12px 28px rgba(0,0,0,0.4) !important; }
    .del-btn:hover { background: rgba(248,113,113,0.2) !important; color: #f87171 !important; border-color: rgba(248,113,113,0.4) !important; }
  `;
  document.head.appendChild(s);
}

// Each job card gets a unique gradient accent based on its index
const JOB_ACCENTS = [
  { from: '#7c3aed', to: '#6366f1', glow: 'rgba(124,58,237,0.4)', light: '#a78bfa' },
  { from: '#0ea5e9', to: '#6366f1', glow: 'rgba(14,165,233,0.4)', light: '#38bdf8' },
  { from: '#10b981', to: '#0ea5e9', glow: 'rgba(16,185,129,0.4)', light: '#34d399' },
  { from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.4)', light: '#fbbf24' },
  { from: '#f43f5e', to: '#a855f7', glow: 'rgba(244,63,94,0.4)', light: '#fb7185' },
  { from: '#8b5cf6', to: '#06b6d4', glow: 'rgba(139,92,246,0.4)', light: '#c4b5fd' },
];

const CreateJob = ({ token }) => {
  const [form, setForm] = useState({ title: '', skills: '', experience: '', location: '', salary_range: '' });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newJobId, setNewJobId] = useState(null);
  const [error, setError] = useState('');
  const [posterJob, setPosterJob] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setJobs(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...form, experience: parseInt(form.experience) || 0 })
      });
      if (res.ok) {
        const data = await res.json();
        setNewJobId(data.id);
        setSuccess(true);
        setForm({ title: '', skills: '', experience: '', location: '', salary_range: '' });
        fetchJobs();
        setTimeout(() => setSuccess(false), 8000);
      } else {
        const d = await res.json();
        if (res.status === 401 || res.status === 400) { setError('Session expired. Please log in again.'); setTimeout(() => window.location.reload(), 2000); return; }
        setError(d.error || 'Failed to create job');
      }
    } catch (e) { setError('Failed to connect to server'); }
    finally { setLoading(false); }
  };

  const getApplyLink = (id) => `https://screening-backend.onrender.com/apply/${id}`;

  const copyLink = (id) => {
    navigator.clipboard.writeText(getApplyLink(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteJob = async (id) => {
    if (!window.confirm('Delete this job and all applicants tied to it?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchJobs();
      else { const d = await res.json(); setError(d.error || 'Failed to delete job'); }
    } catch (e) { setError('Failed to connect to server'); }
  };

  const FIELDS = [
    { name: 'title', label: 'Job Title', placeholder: 'e.g. Senior Frontend Developer', required: true, icon: <Briefcase size={16} /> },
    { name: 'skills', label: 'Required Skills', placeholder: 'e.g. React, Node.js, TypeScript', required: true, icon: <Zap size={16} /> },
    { name: 'experience', label: 'Years of Experience', placeholder: 'e.g. 4', required: true, icon: <Clock size={16} />, type: 'number' },
    { name: 'location', label: 'Location', placeholder: 'e.g. Remote / Bangalore', required: false, icon: <MapPin size={16} /> },
    { name: 'salary_range', label: 'Salary Range', placeholder: 'e.g. ₹12–18 LPA', required: false, icon: <DollarSign size={16} /> },
  ];

  return (
    <div style={{ animation: 'cjFadeIn 0.4s ease' }}>

      {/* ── PAGE HEADER ── */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.1rem', margin: '0 0 0.35rem', fontWeight: 800,
          background: 'linear-gradient(90deg, #a78bfa, #818cf8, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.4))',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <Briefcase size={28} style={{ color: '#7c3aed' }} /> Job Requirements
        </h1>
        <p style={{ color: '#475569', margin: 0, fontSize: '0.92rem' }}>
          Create job profiles, share on LinkedIn & Facebook, and let candidates apply directly.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '1.75rem', alignItems: 'start' }}>

        {/* ── CREATE FORM ── */}
        <div style={{
          background: 'linear-gradient(155deg, rgba(30,10,62,0.95) 0%, rgba(15,18,60,0.95) 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(167,139,250,0.25)',
          boxShadow: '0 0 40px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          position: 'sticky', top: '1rem',
        }}>
          {/* Form top gradient bar */}
          <div style={{ height: '4px', background: 'linear-gradient(90deg, #a855f7, #6366f1, #38bdf8)' }} />

          <div style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }}>
                <Plus size={18} color="#fff" />
              </div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#e2e8f0' }}>Post New Job</h3>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.07)', borderLeft: '3px solid #f87171', padding: '0.75rem 1rem', borderRadius: '0 10px 10px 0', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.83rem' }}>
                {error}
              </div>
            )}

            {/* Success banner */}
            {success && newJobId && (
              <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '14px', padding: '1.1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem', color: '#34d399', fontWeight: 600, fontSize: '0.88rem' }}>
                  <CheckCircle size={16} /> Job posted! Share it now:
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.72rem', color: '#a78bfa', wordBreak: 'break-all', flex: 1 }}>{getApplyLink(newJobId)}</code>
                  <button onClick={() => copyLink(newJobId)} style={{ flexShrink: 0, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                    {copiedId === newJobId ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={() => { setPosterJob({ job: jobs.find(j => j.id === newJobId) || { id: newJobId }, network: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getApplyLink(newJobId))}` }); }}
                    style={{ flex: 1, padding: '0.6rem', background: '#0077B5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                    in LinkedIn
                  </button>
                  <button onClick={() => setPosterJob({ job: { id: newJobId }, network: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getApplyLink(newJobId))}` })}
                    style={{ flex: 1, padding: '0.6rem', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem' }}>
                    f Facebook
                  </button>
                </div>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FIELDS.map(field => (
                <div key={field.name}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span style={{ color: '#7c3aed' }}>{field.icon}</span>
                    {field.label}{field.required && <span style={{ color: '#a855f7' }}>*</span>}
                  </label>
                  <input
                    className="cj-input"
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    required={field.required}
                    onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(139,92,246,0.2)',
                      padding: '0.75rem 1rem', borderRadius: '10px',
                      color: '#e2e8f0', fontFamily: 'inherit', fontSize: '0.88rem',
                    }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '0.5rem', padding: '0.85rem',
                  background: loading ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: 700, fontSize: '0.92rem', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 0 20px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 0 30px rgba(124,58,237,0.8), 0 4px 16px rgba(0,0,0,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.5), 0 4px 12px rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</span> Saving…</> : <><Briefcase size={17} /> Post Job Requirement</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── JOBS LIST ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed' }}>
              Active Job Postings
            </h3>
            <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700 }}>
              {jobs.length}
            </span>
          </div>

          {jobs.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem 2rem',
              background: 'rgba(139,92,246,0.04)', borderRadius: '16px',
              border: '2px dashed rgba(139,92,246,0.2)',
              color: '#334155',
            }}>
              <Briefcase size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>No jobs posted yet.</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#334155' }}>Create your first one using the form →</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.1rem' }}>
              {jobs.map((job, idx) => {
                const accent = JOB_ACCENTS[idx % JOB_ACCENTS.length];
                const skillTags = (job.skills || '').split(',').filter(Boolean).slice(0, 5);
                return (
                  <div
                    key={job.id}
                    className="cj-job-card"
                    style={{
                      background: 'linear-gradient(155deg, rgba(20,10,50,0.95) 0%, rgba(12,15,40,0.95) 100%)',
                      borderRadius: '16px',
                      border: `1px solid ${accent.glow.replace('0.4', '0.3')}`,
                      boxShadow: `0 0 25px ${accent.glow.replace('0.4', '0.15')}, 0 6px 20px rgba(0,0,0,0.35)`,
                      overflow: 'hidden',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Gradient top bar */}
                    <div style={{ height: '3px', background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />

                    <div style={{ padding: '1.25rem' }}>
                      {/* Card header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                          {/* Icon circle */}
                          <div style={{ width: 42, height: 42, borderRadius: '12px', background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 14px ${accent.glow}`, fontSize: '1.1rem' }}>
                            💼
                          </div>
                          <div>
                            <h3 style={{ margin: '0 0 0.2rem', fontSize: '0.97rem', fontWeight: 700, color: '#f0f0ff', lineHeight: 1.3 }}>{job.title}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {job.location && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#475569' }}>
                                  <MapPin size={10} /> {job.location}
                                </span>
                              )}
                              {job.salary_range && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#475569' }}>
                                  <DollarSign size={10} /> {job.salary_range}
                                </span>
                              )}
                              {job.experience > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#475569' }}>
                                  <Clock size={10} /> {job.experience}+ yrs
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Badges + Delete */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                          <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800, background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Active
                          </span>
                          <button
                            className="del-btn"
                            onClick={() => deleteJob(job.id)}
                            title="Delete Job"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', cursor: 'pointer', padding: '0.3rem 0.4rem', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Skill tags */}
                      {skillTags.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {skillTags.map((s, i) => (
                            <span key={s} style={{
                              fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '999px',
                              background: `linear-gradient(135deg, ${accent.from}22, ${accent.to}18)`,
                              color: accent.light,
                              border: `1px solid ${accent.from}44`,
                              animationDelay: `${i * 0.04}s`,
                            }}>
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Apply link */}
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.45rem 0.7rem', marginBottom: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', border: `1px solid ${accent.from}22` }}>
                        <code style={{ fontSize: '0.67rem', color: '#475569', wordBreak: 'break-all', flex: 1 }}>
                          {getApplyLink(job.id)}
                        </code>
                        <button
                          onClick={() => copyLink(job.id)}
                          style={{ flexShrink: 0, background: copiedId === job.id ? 'rgba(52,211,153,0.2)' : `linear-gradient(135deg, ${accent.from}66, ${accent.to}66)`, color: copiedId === job.id ? '#34d399' : accent.light, border: 'none', borderRadius: '6px', padding: '0.25rem 0.55rem', cursor: 'pointer', fontSize: '0.67rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', transition: 'all 0.2s' }}
                        >
                          {copiedId === job.id ? <><CheckCircle size={11} /> Done</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button onClick={() => setPosterJob({ job, network: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getApplyLink(job.id))}` })}
                          style={{ flex: 1, padding: '0.55rem 0', background: '#0077B5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                          in LinkedIn
                        </button>
                        <button onClick={() => setPosterJob({ job, network: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getApplyLink(job.id))}` })}
                          style={{ flex: 1, padding: '0.55rem 0', background: '#1877F2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                          f Facebook
                        </button>
                        <a href={getApplyLink(job.id)} target="_blank" rel="noreferrer"
                          style={{ flex: 1, padding: '0.55rem 0', background: `linear-gradient(135deg, ${accent.from}33, ${accent.to}22)`, color: accent.light, border: `1px solid ${accent.from}44`, borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                          <ExternalLink size={11} /> Preview
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── AI POSTER MODAL ── */}
      {posterJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,4,20,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(10px)' }}>
          <div style={{
            background: 'linear-gradient(155deg,#1a0742,#0c1535)', border: '1px solid rgba(167,139,250,0.25)',
            padding: '2rem', borderRadius: '20px', maxWidth: '520px', width: '100%', textAlign: 'center',
            boxShadow: '0 0 60px rgba(124,58,237,0.3), 0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>🤖</div>
            <h2 style={{ margin: '0 0 0.5rem', background: 'linear-gradient(90deg,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.4rem', fontWeight: 800 }}>
              Gemini AI Poster
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Right-click the image &amp; <b style={{ color: '#a78bfa' }}>Copy Image</b>, then paste it into your {posterJob.network} post!
            </p>
            <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '14px', marginBottom: '1.25rem', border: '1px solid rgba(139,92,246,0.2)' }}>
              <img src={`https://screening-backend.onrender.com/api/public/jobs/${posterJob.job.id}/poster?t=${Date.now()}`} alt="AI Poster" style={{ width: '100%', height: 'auto', aspectRatio: '1/1', borderRadius: '10px', objectFit: 'cover' }} crossOrigin="anonymous" />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setPosterJob(null)} style={{ flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                Cancel
              </button>
              <button onClick={() => { window.open(posterJob.url, '_blank'); setPosterJob(null); }} style={{ flex: 2, padding: '0.8rem', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', boxShadow: '0 0 20px rgba(124,58,237,0.5)' }}>
                Open {posterJob.network}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CreateJob;
