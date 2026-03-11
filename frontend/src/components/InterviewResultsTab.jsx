import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Send, FileText, CheckCircle, Video, UserCheck, Star } from 'lucide-react';

const InterviewResultsTab = ({ candidate, token, onActionComplete }) => {
    const [loading, setLoading] = useState(false);
    const [actionType, setActionType] = useState(null); // 'offer' or 'reject'
    const [status, setStatus] = useState('');

    if (!candidate.interview_data) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed var(--border-light)' }}>
                <Video size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Interview Data Yet</h3>
                <p style={{ color: 'var(--text-secondary)' }}>This candidate has not completed their Live AI Interview session.</p>
            </div>
        );
    }

    const { evaluation, transcript } = candidate.interview_data;

    // Transform data for Recharts
    const radarData = [
        { subject: 'Communication', A: evaluation.communicationScore, fullMark: 100 },
        { subject: 'Technical', A: evaluation.technicalScore, fullMark: 100 },
        { subject: 'Prob. Solving', A: evaluation.problemSolvingScore, fullMark: 100 },
        { subject: 'Confidence', A: evaluation.confidenceScore, fullMark: 100 },
        { subject: 'Culture Fit', A: evaluation.cultureFitScore, fullMark: 100 },
    ];

    const handleSendAction = async (type) => {
        setLoading(true);
        setActionType(type);
        try {
            const endpoint = type === 'offer' ? '/api/candidates/' + candidate.id + '/send-offer' : '/api/candidates/' + candidate.id + '/send-rejection';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setStatus('success');
                if (onActionComplete) onActionComplete();
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem', animation: 'fadeIn 0.4s ease' }}>

            {/* LEFT COLUMN: Overview & Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(145deg, rgba(20,20,35,0.8), rgba(10,10,20,0.9))', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent)', filter: 'blur(80px)', opacity: 0.2 }}></div>

                    <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>AI Interview Score</h3>
                    <div style={{ fontSize: '4rem', fontWeight: 900, background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>
                        {evaluation.overallScore}%
                    </div>

                    <div style={{ margin: '1.5rem 0 2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Recommendation</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: evaluation.recommendation === 'Hire' ? 'var(--success)' : evaluation.recommendation === 'Reject' ? 'var(--danger)' : '#f59e0b', marginTop: '0.25rem' }}>
                            {evaluation.recommendation}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                        <button
                            onClick={() => handleSendAction('offer')}
                            disabled={loading || status === 'success'}
                            style={{
                                flex: 1, padding: '1rem', borderRadius: '14px', border: 'none',
                                background: status === 'success' && actionType === 'offer' ? 'var(--success)' : 'linear-gradient(135deg, var(--primary), #3A2E6F)',
                                color: 'white', fontWeight: 700, fontSize: '0.85rem', cursor: loading || status === 'success' ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                transition: 'all 0.3s ease', boxShadow: status === 'success' && actionType === 'offer' ? '0 0 20px rgba(34,197,94,0.3)' : '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                        >
                            {loading && actionType === 'offer' ? <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> :
                                status === 'success' && actionType === 'offer' ? <><CheckCircle size={16} /> Offer Sent</> :
                                    <><Send size={16} /> Send Offer</>}
                        </button>

                        <button
                            onClick={() => handleSendAction('reject')}
                            disabled={loading || status === 'success'}
                            style={{
                                flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.4)',
                                background: status === 'success' && actionType === 'reject' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.1)',
                                color: status === 'success' && actionType === 'reject' ? 'white' : '#fca5a5', fontWeight: 700, fontSize: '0.85rem', cursor: loading || status === 'success' ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading && actionType === 'reject' ? <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#fca5a5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div> :
                                status === 'success' && actionType === 'reject' ? <><CheckCircle size={16} /> Rejection Sent</> :
                                    <><Send size={16} /> Send Rejection</>}
                        </button>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px' }}>
                    <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={16} /> Key Strengths</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {evaluation.strengths.map((s, i) => (
                            <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <span style={{ color: 'var(--success)' }}>✓</span> {s}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* RIGHT COLUMN: Recharts & Transcript */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Recharts Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Capability Radar Matrix</h3>
                        <div style={{ flex: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                    <Radar name="Candidate" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '24px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Score Breakdown</h3>
                        <div style={{ flex: 1, width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={radarData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e1e2d', border: 'none', borderRadius: '8px' }} />
                                    <Bar dataKey="A" fill="url(#colorUv)" radius={[0, 4, 4, 0]} barSize={20} />
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                            <stop offset="100%" stopColor="var(--accent)" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* AI Summary */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><UserCheck size={20} color="var(--accent)" /> AI Evaluator Summary</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>{evaluation.summary}</p>
                </div>

            </div>

        </div>
    );
};

export default InterviewResultsTab;
