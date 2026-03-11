import React, { useState } from 'react';
import CandidateProfile from './CandidateProfile';

const ScoreRing = ({ score }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    let color = 'var(--success)';
    if (score < 80) color = 'var(--warning)';
    if (score < 60) color = 'var(--danger)';

    return (
        <div style={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg className="score-ring" width="56" height="56" viewBox="0 0 56 56" style={{ '--target-offset': offset }}>
                <circle cx="28" cy="28" r={radius} fill="none" stroke="var(--bg-glass)" strokeWidth="6" />
                <circle
                    className="score-ring-circle"
                    cx="28"
                    cy="28"
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                />
            </svg>
            <span style={{ position: 'absolute', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{score}</span>
        </div>
    );
};

const CandidateList = ({ candidates, token }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    if (!candidates || candidates.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <i className="fa-solid fa-inbox" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}></i>
                </div>
                <h3>No Candidates Found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Upload your first resume to start the screening process.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Top Candidates</h3>
                <div style={{ position: 'relative' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-secondary)', fontSize: '0.875rem' }}></i>
                    <input
                        type="text"
                        placeholder="Search skills, roles..."
                        style={{
                            background: 'var(--bg-glass)', border: '1px solid var(--border-light)',
                            padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: 'var(--radius-full)',
                            color: 'var(--text-primary)', outline: 'none', width: 250, fontFamily: 'var(--font-body)'
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Candidate</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>AI Match Score</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Status</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Matched Skills</th>
                            <th style={{ padding: '1rem 2rem', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.875rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map((c, i) => (
                            <tr key={c.id} className="hover-lift" style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', background: 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: `hsl(${i * 60}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, margin: 0 }}>{c.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{c.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <ScoreRing score={c.match_score} />
                                </td>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <span className={`badge ${c.status === 'Shortlisted' ? 'success' : c.status === 'Review' ? 'warning' : 'danger'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {c.skills_matched.slice(0, 3).map(skill => (
                                            <span key={skill} className="badge primary" style={{ textTransform: 'none', background: 'var(--bg-glass)', border: '1px solid rgba(99, 102, 241, 0.2)', color: 'var(--text-secondary)' }}>
                                                {skill}
                                            </span>
                                        ))}
                                        {c.skills_matched.length > 3 && (
                                            <span className="badge" style={{ textTransform: 'none', background: 'transparent', color: 'var(--text-secondary)', padding: '0 0.25rem' }}>
                                                +{c.skills_matched.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 2rem' }}>
                                    <button onClick={() => setSelectedCandidate(c)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                        View Profile
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {selectedCandidate && (
                <CandidateProfile 
                    candidate={selectedCandidate} 
                    onClose={() => setSelectedCandidate(null)} 
                    token={token} 
                />
            )}
        </div>
    );
};

export default CandidateList;
