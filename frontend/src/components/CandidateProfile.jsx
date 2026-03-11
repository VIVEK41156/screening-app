import React, { useState } from 'react';
import { Sparkles, MessageCircle, AlertTriangle, UserCheck, CheckCircle, FileText, X, Star, Zap, BookOpen } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

const CandidateProfile = ({ candidate, onClose, token }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const skillsList = Array.isArray(candidate.skills_matched)
    ? candidate.skills_matched
    : (candidate.skills ? candidate.skills.split(', ') : []);

  const handleGenerateQuestions = async () => {
    setActiveTab('interview');
    if (questions.length > 0) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/interview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const score = candidate.match_score || 0;
  const scoreColor = score >= 85 ? '#34d399' : score >= 70 ? '#fbbf24' : '#f87171';
  const scoreGlow = score >= 85 ? 'rgba(52,211,153,0.6)' : score >= 70 ? 'rgba(251,191,36,0.6)' : 'rgba(248,113,113,0.6)';

  const statusStyle = candidate.status === 'Shortlisted'
    ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.5)', label: candidate.status }
    : candidate.status === 'Rejected'
      ? { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.5)', label: candidate.status }
      : { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.5)', label: candidate.status };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <UserCheck size={15} /> },
    { id: 'resume', label: 'Resume', icon: <FileText size={15} /> },
    { id: 'interview', label: 'AI Interview Prep', icon: <MessageCircle size={15} />, onClick: handleGenerateQuestions },
    { id: 'test', label: 'Student Portal', icon: <BookOpen size={15} /> },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(6, 4, 20, 0.85)',
      zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        width: '92%', maxWidth: 940,
        height: '88vh',
        display: 'flex', flexDirection: 'column',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(155deg, #1a0742 0%, #130e3a 40%, #0c1535 100%)',
        border: '1px solid rgba(167,139,250,0.25)',
        boxShadow: '0 0 60px rgba(124,58,237,0.35), 0 0 100px rgba(99,102,241,0.15), 0 25px 50px rgba(0,0,0,0.6)',
        animation: 'profileFadeIn 0.3s cubic-bezier(0.34,1.4,0.64,1)',
        position: 'relative',
      }}>

        {/* ── Animated top rainbow border ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px', zIndex: 10,
          background: 'linear-gradient(90deg, #a855f7, #6366f1, #38bdf8, #34d399, #fbbf24, #f43f5e, #a855f7)',
          backgroundSize: '300% 100%',
        }} />

        {/* ── HEADER ── */}
        <div style={{
          padding: '2rem 2rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.1) 60%, transparent 100%)',
          borderBottom: '1px solid rgba(167,139,250,0.15)',
          position: 'relative',
        }}>
          {/* Decorative orb top-right */}
          <div style={{ position: 'absolute', top: -30, right: 80, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', fontWeight: 800, color: '#fff',
              boxShadow: `0 0 25px rgba(124,58,237,0.7), 0 0 50px rgba(99,102,241,0.3)`,
              border: '3px solid rgba(167,139,250,0.4)',
              letterSpacing: '-1px',
            }}>
              {candidate.name.charAt(0)}
            </div>

            {/* Name + info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h2 style={{
                  fontSize: '1.9rem', margin: 0, fontWeight: 800,
                  background: 'linear-gradient(90deg, #f0f0ff, #c4b5fd)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  {candidate.name}
                </h2>
                <span style={{
                  padding: '0.25rem 0.85rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800,
                  background: statusStyle.bg, color: statusStyle.color,
                  border: `1px solid ${statusStyle.border}`,
                  boxShadow: `0 0 10px ${statusStyle.border}`,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {statusStyle.label}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                {candidate.email}
                <span style={{ color: 'rgba(139,92,246,0.6)', margin: '0 0.5rem' }}>|</span>
                <span style={{ color: '#94a3b8' }}>{candidate.experience || 0} Yrs Experience</span>
              </p>
            </div>

            {/* Score badge */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${scoreGlow.replace('0.6', '0.3')}`,
              borderRadius: '14px', padding: '0.75rem 1.25rem',
              boxShadow: `0 0 20px ${scoreGlow.replace('0.6', '0.25')}`,
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>AI Score</span>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: scoreColor, lineHeight: 1, textShadow: `0 0 20px ${scoreGlow}` }}>
                {Math.round(score)}%
              </span>
            </div>

            {/* Close */}
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', cursor: 'pointer', width: 36, height: 36, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', outline: 'none', padding: 0, flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.2)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(139,92,246,0.15)', padding: '0 1.5rem', background: 'rgba(0,0,0,0.15)', gap: '0.15rem' }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={tab.onClick ? tab.onClick : () => setActiveTab(tab.id)}
                style={{
                  padding: '0.9rem 1.25rem',
                  background: isActive ? 'rgba(139,92,246,0.12)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #a78bfa' : '2px solid transparent',
                  color: isActive ? '#e2e8f0' : '#475569',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.85rem', transition: 'all 0.15s',
                  borderRadius: '8px 8px 0 0',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#c4b5fd'; e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; } }}
              >
                <span style={{ color: isActive ? '#a78bfa' : 'inherit' }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem 2rem' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
              <div>
                {/* Skills */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} /> Matched Skills
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {skillsList.map((skill, i) => (
                      <span key={skill} style={{
                        padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                        background: `linear-gradient(135deg, hsl(${i * 43 + 220},70%,25%), hsl(${i * 43 + 240},70%,20%))`,
                        color: `hsl(${i * 43 + 200},80%,75%)`,
                        border: `1px solid hsl(${i * 43 + 220},60%,35%)`,
                        boxShadow: `0 0 8px hsla(${i * 43 + 220},70%,50%,0.25)`,
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Test result */}
                {candidate.test_completed ? (
                  <div style={{
                    padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem',
                    background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))',
                    border: '1px solid rgba(52,211,153,0.3)',
                    boxShadow: '0 0 20px rgba(52,211,153,0.1)',
                    display: 'flex', alignItems: 'center', gap: '1.25rem',
                  }}>
                    <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10}
                          data={[{ name: 'Score', value: candidate.test_score, fill: '#34d399' }]} startAngle={90} endAngle={-270}>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar minAngle={15} background={{ fill: 'rgba(255,255,255,0.06)' }} clockWise dataKey="value" cornerRadius={10} animationDuration={1500} />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#34d399" fontSize="22" fontWeight="bold">{candidate.test_score}%</text>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '1rem', fontWeight: 700 }}>
                        <CheckCircle size={18} /> AI Screening Test Passed
                      </h4>
                      <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                        Candidate successfully completed the role-specific AI technical screening test generated by Gemini. Action recommended to schedule final interview.
                      </p>
                    </div>
                  </div>
                ) : candidate.status === 'Shortlisted' ? (
                  <div style={{ padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', boxShadow: '0 0 20px rgba(251,191,36,0.08)' }}>
                    <h4 style={{ margin: '0 0 0.35rem', color: '#fbbf24', fontSize: '0.95rem', fontWeight: 700 }}>⏳ AI Screening Test Pending</h4>
                    <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Candidate has been sent the link but has not yet completed the technical assessment.</p>
                  </div>
                ) : null}

                {/* Skill gaps */}
                <div style={{ padding: '1.25rem', borderRadius: '14px', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', boxShadow: '0 0 20px rgba(248,113,113,0.07)' }}>
                  <h4 style={{ margin: '0 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', fontSize: '0.9rem', fontWeight: 700 }}>
                    <AlertTriangle size={16} /> Skill Gaps Detected
                  </h4>
                  <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>
                    Candidate lacks enterprise experience in Docker and Kubernetes orchestration based on the primary job description requirements.
                  </p>
                </div>
              </div>

              {/* Score Panel */}
              <div>
                <div style={{
                  borderRadius: '16px', padding: '2rem',
                  background: 'linear-gradient(155deg, rgba(124,58,237,0.25) 0%, rgba(79,70,229,0.15) 60%, rgba(14,165,233,0.08) 100%)',
                  border: '1px solid rgba(167,139,250,0.25)',
                  boxShadow: `0 0 40px rgba(124,58,237,0.2)`,
                  textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                  {/* Orb background */}
                  <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${scoreGlow.replace('0.6', '0.15')} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                  <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7c3aed' }}>AI Match Score</p>
                  {/* Conic score ring */}
                  <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 1rem', borderRadius: '50%', background: `conic-gradient(${scoreColor} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`, boxShadow: `0 0 30px ${scoreGlow}` }}>
                    <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', background: 'linear-gradient(155deg, #1a0742,#0c1535)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '2.4rem', fontWeight: 900, color: scoreColor, lineHeight: 1, textShadow: `0 0 20px ${scoreGlow}` }}>
                        {Math.round(score)}%
                      </span>
                    </div>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                    {score >= 85 ? 'Extremely high correlation with required capabilities.' : score >= 70 ? 'Good match — review candidate details.' : 'Low match — manual review recommended.'}
                  </p>
                  {/* Star rating */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={16} fill={s <= Math.round(score / 20) ? scoreColor : 'transparent'} color={s <= Math.round(score / 20) ? scoreColor : '#334155'} style={{ filter: s <= Math.round(score / 20) ? `drop-shadow(0 0 4px ${scoreColor})` : 'none' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESUME TAB ── */}
          {activeTab === 'resume' && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              {candidate.resume_text ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 14px rgba(124,58,237,0.5)' }}>
                        <FileText size={17} color="#fff" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, color: '#e2e8f0', fontSize: '0.95rem' }}>Extracted Resume</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#475569' }}>Parsed by AI · Original PDF not stored</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { const w = window.open('', '_blank'); w.document.write(`<!DOCTYPE html><html><head><title>${candidate.name} — Resume</title><style>body{font-family:'Segoe UI',sans-serif;max-width:820px;margin:2rem auto;padding:0 1.5rem;color:#1e293b;line-height:1.7;}pre{white-space:pre-wrap;font-family:inherit;font-size:0.95rem;}h1{color:#4c1d95;border-bottom:2px solid #4c1d95;padding-bottom:0.5rem;}</style></head><body><h1>${candidate.name}</h1><pre>${candidate.resume_text}</pre></body></html>`); w.document.close(); }}
                      style={{ padding: '0.4rem 1rem', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    >🖨️ Print</button>
                  </div>
                  <div style={{ background: 'rgba(15,10,40,0.7)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 0 25px rgba(99,102,241,0.1)' }}>
                    {candidate.resume_text.split('\n').map((line, i) => {
                      const trimmed = line.trim();
                      const isHeader = trimmed.length > 2 && trimmed.length < 45 && (trimmed === trimmed.toUpperCase() || /^(EDUCATION|EXPERIENCE|SKILLS|SUMMARY|OBJECTIVE|PROJECTS|CERTIFICATIONS|AWARDS|CONTACT|PROFESSIONAL|WORK|EMPLOYMENT|LANGUAGES|INTERESTS|REFERENCES)/i.test(trimmed));
                      if (!trimmed) return <div key={i} style={{ height: '0.45rem' }} />;
                      if (isHeader) return (
                        <div key={i} style={{ margin: '1.1rem 0 0.55rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, rgba(167,139,250,0.6), transparent)' }} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a78bfa', textTransform: 'uppercase' }}>{trimmed}</span>
                          <span style={{ height: '1px', flex: 1, background: 'linear-gradient(270deg, rgba(167,139,250,0.6), transparent)' }} />
                        </div>
                      );
                      return (
                        <p key={i} style={{ margin: '0.12rem 0', fontSize: '0.87rem', color: '#cbd5e1', lineHeight: 1.65, paddingLeft: line.match(/^\s/) ? '1.25rem' : 0 }}>
                          {/^[•\-\*]/.test(trimmed) ? <><span style={{ color: '#7c3aed', marginRight: '0.4rem' }}>◆</span>{trimmed.replace(/^[•\-\*]\s*/, '')}</> : trimmed}
                        </p>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#475569' }}>
                  <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '1rem', margin: 0 }}>No resume text available.</p>
                </div>
              )}
            </div>
          )}

          {/* ── AI INTERVIEW TAB ── */}
          {activeTab === 'interview' && (
            <div>
              {loadingQuestions ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#a78bfa' }}>
                  <Zap size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                  <p>Generating AI Interview Questions…</p>
                </div>
              ) : questions.length > 0 ? (
                <div>
                  <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7c3aed', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} /> AI-Generated Interview Questions for {candidate.name}
                  </h3>
                  {questions.map((q, i) => (
                    <div key={i} style={{
                      padding: '1rem 1.25rem', marginBottom: '0.75rem', borderRadius: '12px',
                      background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)',
                      display: 'flex', gap: '1rem', alignItems: 'flex-start',
                    }}>
                      <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>{q}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                  <MessageCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Click the tab again to generate AI interview questions.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STUDENT PORTAL TAB ── */}
          {activeTab === 'test' && (
            <div style={{ maxWidth: '650px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
                <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.5)' }}>
                  <BookOpen size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#e2e8f0', fontWeight: 700 }}>AI Screening Test</h3>
                  <p style={{ color: '#475569', margin: 0, fontSize: '0.85rem' }}>Manage the technical assessment for {candidate.name}</p>
                </div>
              </div>

              <div style={{ padding: '1.75rem', borderRadius: '16px', background: 'rgba(15,10,40,0.6)', border: '1px solid rgba(139,92,246,0.2)', boxShadow: '0 0 25px rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: '#e2e8f0' }}>Test Access URL</p>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0.2rem 0 0' }}>Send this link directly to the candidate.</p>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.85rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                    background: candidate.test_completed ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                    color: candidate.test_completed ? '#34d399' : '#fbbf24',
                    border: `1px solid ${candidate.test_completed ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    boxShadow: `0 0 10px ${candidate.test_completed ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                  }}>
                    {candidate.test_completed ? '✅ Completed' : '⏳ Pending'}
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.9rem 1rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', border: '1px solid rgba(139,92,246,0.12)' }}>
                  <code style={{ fontSize: '0.8rem', color: '#a78bfa', wordBreak: 'break-all' }}>
                    {`https://screening-backend.onrender.com/test/${candidate.id}`}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`https://screening-backend.onrender.com/test/${candidate.id}`); alert('Exam link copied!'); }}
                    style={{ padding: '0.45rem 1rem', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 0 14px rgba(124,58,237,0.4)' }}
                  >Copy Link</button>
                </div>

                {candidate.test_completed && (
                  <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(52,211,153,0.08)', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.3)' }}>
                    <p style={{ color: '#34d399', margin: 0, fontWeight: 700 }}>Test Result: {candidate.test_score}%</p>
                    <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.35rem', marginBottom: 0 }}>Score synced with AI analysis dashboard.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        <style>{`
          @keyframes profileFadeIn {
            from { opacity:0; transform:scale(0.93) translateY(16px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CandidateProfile;
