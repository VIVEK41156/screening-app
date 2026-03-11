import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Tooltip, PolarAngleAxis } from 'recharts';

// ─── STYLES & DEFS ───
const STYLE_ID = 'er-pixel-styles';
if (!document.getElementById(STYLE_ID)) {
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
    @keyframes erFade { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spinPulse { 50% { transform: scale(1.02) rotate(180deg); opacity: 0.8; } 100% { transform: scale(1) rotate(360deg); opacity: 1; } }
    .er-panel {
      background: linear-gradient(155deg, #1b1735, #110f22);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05);
      position: relative;
      overflow: hidden;
    }
    .er-panel-header {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: #94a3b8;
      padding: 1.2rem 1.5rem;
    }
    .er-neon { text-shadow: 0 0 10px currentColor; }
  `;
    document.head.appendChild(s);
}

// Global SVG Defs
const SvgFilters = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
            <filter id="dialGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#3b82f6" floodOpacity="0.4" />
            </filter>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <linearGradient id="needleBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <radialGradient id="dialBg" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="#1e1b4b" stopOpacity="1" />
                <stop offset="95%" stopColor="#312e81" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#111827" stopOpacity="0.9" />
            </radialGradient>
        </defs>
    </svg>
);

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
                <p style={{ margin: 0, color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>{payload[0].payload.name || payload[0].name}</p>
                <p style={{ margin: 0, color: payload[0].payload.fill || payload[0].color || '#fff', fontSize: '16px', fontWeight: 800 }}>{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

// --- Intersection Observer Hook ---
const useIntersectionObserver = (options) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                // Once it's in view, we don't need to un-animate it on scroll out for this specific effect.
                // Or we can toggle it if preferred. For "wow factor", animating once per scroll into view is usually best.
                // Actually, if they scroll up and down, let's keep it mostly "animated in".
                // We'll let it stay true once triggered to avoid jarring re-animations when just scrolling slightly.
            }
        }, options);

        if (ref.current) observer.observe(ref.current);
        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref, options]);

    return [ref, isIntersecting];
};

// ─── 1. OVERALL SCORE (SPEEDOMETER) ───
const Speedometer = ({ score, inView }) => {
    const cx = 150, cy = 150, rOuter = 120, rInner = 95, rDial = 75;
    const startA = 220, endA = -40; // Total 260 degrees arc
    const toRad = (d) => d * Math.PI / 180;

    const getPos = (a, r) => ({ x: cx + r * Math.cos(toRad(a)), y: cy - r * Math.sin(toRad(a)) });
    const arc = (r, s, e) => {
        const large = Math.abs(s - e) > 180 ? 1 : 0;
        return `M ${getPos(s, r).x} ${getPos(s, r).y} A ${r} ${r} 0 ${large} 1 ${getPos(e, r).x} ${getPos(e, r).y}`;
    };

    const angleRange = startA - endA;

    // Use a local state to animate the needle/progress smoothly
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        if (inView) {
            let start = 0;
            const target = score;
            const duration = 1500;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - progress, 3);
                setAnimatedScore(start + (target - start) * easeOut);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        } else {
            setAnimatedScore(0);
        }
    }, [score, inView]);

    const currentA = startA - (animatedScore / 100) * angleRange;
    const thresholdA = startA - 0.8 * angleRange; // 12deg

    const gap = 4;
    const blueStart = startA;
    const blueEnd = thresholdA + gap / 2;
    const greenStart = thresholdA - gap / 2;
    const greenEnd = endA;

    const scoreBlueEnd = Math.max(blueEnd, Math.min(startA, currentA));
    const scoreGreenEnd = Math.max(greenEnd, Math.min(greenStart, currentA));

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '1rem' }}>
            <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 350, filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.5))' }}>
                {/* Outer styling rings */}
                <circle cx={cx} cy={cy} r={rOuter + 25} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="40" />
                <circle cx={cx} cy={cy} r={rOuter + 5} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="15" />

                {/* Main Dial Background */}
                <circle cx={cx} cy={cy} r={rOuter} fill="#1e293b" stroke="#334155" strokeWidth="6" />
                <circle cx={cx} cy={cy} r={rOuter - 6} fill="url(#dialBg)" />

                {/* BACKGROUND TRACKS */}
                <path d={arc(rInner, blueStart, blueEnd)} fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="25" />
                <path d={arc(rInner, greenStart, greenEnd)} fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="25" />

                {/* ACTIVE TRACKS */}
                {scoreBlueEnd < blueStart && (
                    <path d={arc(rInner, blueStart, scoreBlueEnd)} fill="none" stroke="#2563eb" strokeWidth="25" filter="url(#dialGlow)" />
                )}
                {scoreGreenEnd < greenStart && (
                    <path d={arc(rInner, greenStart, scoreGreenEnd)} fill="none" stroke="#10b981" strokeWidth="25" filter="url(#dialGlow)" />
                )}

                {/* INNER DIAL MARKINGS */}
                <path d={arc(rDial, startA, endA)} fill="none" stroke="#475569" strokeWidth="2" opacity="0.5" />

                <line x1={getPos(startA, rDial).x} y1={getPos(startA, rDial).y} x2={getPos(startA, rDial - 8).x} y2={getPos(startA, rDial - 8).y} stroke="#94a3b8" strokeWidth="2" />
                <text x={getPos(startA, rDial - 20).x} y={getPos(startA, rDial - 20).y} fill="#94a3b8" fontSize="14" fontWeight="700" textAnchor="start" dominantBaseline="middle">0</text>

                <line x1={getPos(startA - angleRange / 2, rDial).x} y1={getPos(startA - angleRange / 2, rDial).y} x2={getPos(startA - angleRange / 2, rDial - 8).x} y2={getPos(startA - angleRange / 2, rDial - 8).y} stroke="#94a3b8" strokeWidth="2" />
                <text x={getPos(startA - angleRange / 2, rDial - 22).x} y={getPos(startA - angleRange / 2, rDial - 22).y} fill="#94a3b8" fontSize="14" fontWeight="700" textAnchor="middle" dominantBaseline="middle">50</text>

                <line x1={getPos(endA, rDial).x} y1={getPos(endA, rDial).y} x2={getPos(endA, rDial - 8).x} y2={getPos(endA, rDial - 8).y} stroke="#94a3b8" strokeWidth="2" />
                <text x={getPos(endA, rDial - 22).x} y={getPos(endA, rDial - 20).y} fill="#94a3b8" fontSize="14" fontWeight="700" textAnchor="end" dominantBaseline="middle">100</text>

                {/* CENTER TEXT */}
                <text x={cx} y={cy - 35} fill="#c7d2fe" fontSize="42" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">{Math.round(animatedScore)}%</text>
                <text x={cx} y={cy + 40} fill="#f8fafc" fontSize="14" fontWeight="800" textAnchor="middle">Total Exam Result</text>
                <text x={cx} y={cy + 60} fill="#f8fafc" fontSize="14" fontWeight="900" textAnchor="middle">{score}%</text>

                {/* THE NEEDLE */}
                <g filter="drop-shadow(0 6px 6px rgba(0,0,0,0.6))">
                    <circle cx={cx} cy={cy} r="18" fill="#1e293b" />
                    <circle cx={cx} cy={cy} r="10" fill="#94a3b8" />
                    <circle cx={cx} cy={cy} r="4" fill="#1e293b" />

                    <path d={`M ${cx + 10 * Math.cos(toRad(currentA + 90))} ${cy - 10 * Math.sin(toRad(currentA + 90))} L ${getPos(currentA, rInner - 5).x} ${getPos(currentA, rInner - 5).y} L ${cx + 10 * Math.cos(toRad(currentA - 90))} ${cy - 10 * Math.sin(toRad(currentA - 90))} Z`} fill="url(#needleBody)" />
                    <path d={`M ${cx} ${cy} L ${getPos(currentA, rInner - 5).x} ${getPos(currentA, rInner - 5).y} L ${cx + 10 * Math.cos(toRad(currentA - 90))} ${cy - 10 * Math.sin(toRad(currentA - 90))} Z`} fill="rgba(255,255,255,0.2)" />
                </g>

                <path id="curveLabelLeft" d={arc(rOuter - 15, 200, 160)} fill="none" />
                <text fontSize="8" fill="#64748b" fontWeight="800" letterSpacing="0.1em">
                    <textPath href="#curveLabelLeft" startOffset="50%" textAnchor="middle">OVERDUE (30 DAYS)</textPath>
                </text>

                <path id="curveLabelRight" d={arc(rOuter - 15, 20, -20)} fill="none" />
                <text fontSize="8" fill="#047857" fontWeight="800" letterSpacing="0.1em">
                    <textPath href="#curveLabelRight" startOffset="50%" textAnchor="middle">COMPLETED</textPath>
                </text>
            </svg>
        </div>
    );
};


// ─── 2. SCORE BY SYLLABUS (PROFESSIONAL PIE) ───
const ProfessionalDonut = ({ data, inView }) => {
    const colors = ['#f59e0b', '#a855f7', '#0ea5e9', '#10b981']; // Aptitude, Reasoning, Technical, Verbal

    // Animate data entering only when inView
    const displayData = inView ? data : data.map(d => ({ ...d, score: 0 }));

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '1.5rem', paddingTop: '1rem' }}>
            <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                    <defs>
                        <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity="0.5" />
                        </filter>
                    </defs>
                    <Pie
                        data={displayData}
                        cx="50%" cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="score"
                        stroke="none"
                        animationDuration={1500}
                        cornerRadius={6}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} style={{ filter: 'url(#pieShadow)', stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {data.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i], boxShadow: `0 0 8px ${colors[i]}` }} />
                        {d.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── 3. ACHIEVEMENT BARS (PROFESSIONAL RADIAL) ───
const ProfessionalRadial = ({ data, inView }) => {
    const colors = ['#f59e0b', '#a855f7', '#10b981', '#0ea5e9']; // Aptitude, Reasoning, Technical, Verbal
    const sortedData = [...data].reverse().map((d, i) => ({
        ...d,
        score: inView ? d.score : 0, // Animate from 0 when inView
        fill: colors[colors.length - 1 - i]
    }));

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '1.5rem', paddingTop: '1rem' }}>
            <ResponsiveContainer width="100%" height={230}>
                <RadialBarChart
                    cx="50%" cy="50%"
                    innerRadius="30%" outerRadius="100%"
                    barSize={12}
                    data={sortedData}
                    startAngle={210}
                    endAngle={-30}
                    margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
                >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                        minAngle={15}
                        background={{ fill: '#1e293b' }}
                        clockWise
                        dataKey="score"
                        cornerRadius={6}
                        animationDuration={1500}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {data.map((d, i) => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors[i], boxShadow: `0 0 8px ${colors[i]}` }} />
                        {d.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── MAIN COMPONENT ───
const ExamResultsTab = ({ candidates }) => {
    const [selectedId, setSelectedId] = useState(null);
    const [dropOpen, setDropOpen] = useState(false);

    const completed = candidates.filter(c => c.test_completed);
    const selected = completed.find(c => c.id === selectedId) || completed[0];

    useEffect(() => {
        if (completed.length > 0 && !selectedId) setSelectedId(completed[0].id);
    }, [candidates]);

    if (completed.length === 0) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>No completed exams yet.</div>;
    }

    const score = selected?.test_score ?? 0;

    const seed = selected?.id ?? 1;
    const rng = (offset) => Math.min(100, Math.max(10, Math.round(score + (((seed * offset * 7919) % 41) - 20))));

    const cats = [
        { name: 'Aptitude', score: rng(2) },
        { name: 'Reasoning', score: rng(3) },
        { name: 'Technical', score: rng(4) },
        { name: 'Verbal', score: rng(1) }
    ];

    const passed = score >= 60;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

    const [chartsRef, chartsInView] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div style={{ animation: 'erFade 0.4s ease both' }}>
            <SvgFilters />

            {/* Header & Dropdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontFamily: "'Inter', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>Performance Analytics</h2>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Advanced breakdown of assessment scores</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <button onClick={() => setDropOpen(!dropOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(30,27,75,0.8)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '0.65rem 1.25rem', color: '#c4b5fd', cursor: 'pointer', fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: '0.9rem', minWidth: 220, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <User size={16} />
                        <span style={{ flex: 1, textAlign: 'left' }}>{selected?.name}</span>
                        <ChevronDown size={16} />
                    </button>
                    {dropOpen && (
                        <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 50, minWidth: 220, background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
                            {completed.map(c => (
                                <button key={c.id} onClick={() => { setSelectedId(c.id); setDropOpen(false); }}
                                    style={{ width: '100%', padding: '0.75rem 1rem', background: c.id === selectedId ? 'rgba(139,92,246,0.15)' : 'transparent', border: 'none', color: c.id === selectedId ? '#c4b5fd' : '#94a3b8', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span>{c.name}</span>
                                    <span style={{ fontWeight: 800 }}>{c.test_score}%</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Candidate Summary Card */}
            <div className="er-panel" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `linear-gradient(135deg, ${color}, #000)`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: '#fff', boxShadow: `0 0 20px ${color}66` }}>
                        {selected.name[0]}
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{selected.name}</h3>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{selected.email}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Status</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {passed ? <CheckCircle size={18} /> : <XCircle size={18} />} {passed ? 'PASSED' : 'FAILED'}
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 5px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Score</p>
                        <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}><span className="er-neon" style={{ color }}>{score}</span> / 100</p>
                    </div>
                </div>
            </div>

            {/* The 3 Pixel-Perfect Charts */}
            <div ref={chartsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                {/* 1. Overall Score Speedometer */}
                <div className="er-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="er-panel-header">OVERVIEW</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Speedometer score={score} inView={chartsInView} />
                    </div>
                </div>

                {/* 2. Score by Syllabus Donut */}
                <div className="er-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="er-panel-header">SCORE BY SYLLABUS</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <ProfessionalDonut data={cats} inView={chartsInView} />
                    </div>
                </div>

                {/* 3. Achievement Bars */}
                <div className="er-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="er-panel-header">ACHIEVEMENT BARS</div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <ProfessionalRadial data={cats} inView={chartsInView} />
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ExamResultsTab;
