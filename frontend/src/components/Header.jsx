import React from 'react';

const STYLE_TAG_ID = 'header-tab-styles-v3';
if (!document.getElementById(STYLE_TAG_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_TAG_ID;
    style.textContent = `
        @keyframes tabIn {
            from { opacity:0; transform:translateY(-10px) scale(0.9); }
            to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes shimmer {
            0%   { background-position: -200% center; }
            100% { background-position:  200% center; }
        }
        .nav-tab { animation: tabIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .nav-tab:hover .tab-close { opacity:1 !important; transform:scale(1) !important; }
        .tabs-scroll::-webkit-scrollbar { display:none; }
        .inactive-tab:hover {
            background: rgba(255,255,255,0.1) !important;
            color: #e2e8f0 !important;
            border-color: rgba(168,85,247,0.35) !important;
        }
    `;
    document.head.appendChild(style);
}

const Header = ({
    user, onLogout, setActiveView, candidates = [],
    openTabs = [], activeView, onTabClick, onTabClose,
}) => {
    const newCount = candidates.filter(c => c.status === 'New' || c.status === 'Review').length;

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem 0 0',
            background: 'linear-gradient(135deg, #3b1181 0%, #251475 40%, #152b7a 75%, #0e2060 100%)',
            borderBottom: '1px solid rgba(196,181,253,0.3)',
            boxShadow: '0 4px 30px rgba(109,40,217,0.5), 0 1px 0 rgba(196,181,253,0.2)',
            width: '100%',
            boxSizing: 'border-box',
            height: '56px',
        }}>

            {/* ── Rainbow shimmer top bar ── */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #f43f5e, #a855f7, #6366f1, #38bdf8, #34d399, #fbbf24, #f43f5e)',
                backgroundSize: '300% 100%',
                animation: 'shimmer 4s linear infinite',
            }} />

            {/* ── TABS ── */}
            <div
                className="tabs-scroll"
                style={{
                    display: 'flex', alignItems: 'center',
                    flex: 1, height: '100%',
                    overflowX: 'auto', overflowY: 'hidden',
                    gap: '6px',
                    padding: '0 1rem',
                    scrollbarWidth: 'none',
                }}>

                {openTabs.map(tab => {
                    const isActive = tab.id === activeView;
                    return (
                        <div
                            key={tab.id}
                            className={`nav-tab ${!isActive ? 'inactive-tab' : ''}`}
                            onClick={() => onTabClick(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                height: '34px',
                                minWidth: '120px', maxWidth: '180px',
                                padding: '0 0.55rem 0 0.85rem',
                                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
                                cursor: 'pointer',
                                flexShrink: 0, userSelect: 'none',
                                whiteSpace: 'nowrap', overflow: 'hidden',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                // ACTIVE: vivid bright gradient — white-hot
                                background: isActive
                                    ? 'linear-gradient(135deg, #ffffff 0%, #ede9fe 50%, #ddd6fe 100%)'
                                    : 'rgba(255,255,255,0.08)',
                                border: `1px solid ${isActive ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.1)'}`,
                                boxShadow: isActive
                                    ? '0 0 16px rgba(167,139,250,0.8), 0 0 32px rgba(99,102,241,0.4), 0 4px 12px rgba(0,0,0,0.3)'
                                    : 'none',
                                color: isActive ? '#4c1d95' : 'rgba(255,255,255,0.55)',
                            }}
                        >
                            <span style={{
                                flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                                fontSize: '0.8rem',
                                fontWeight: isActive ? 700 : 400,
                                letterSpacing: isActive ? '0.01em' : '0',
                            }}>
                                {tab.label}
                            </span>

                            {/* Close btn */}
                            <button
                                className="tab-close"
                                onClick={e => onTabClose(tab.id, e)}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: isActive ? '#7c3aed' : 'rgba(255,255,255,0.4)',
                                    cursor: 'pointer', padding: '2px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', width: '16px', height: '16px',
                                    outline: 'none', flexShrink: 0, fontSize: '0.62rem',
                                    opacity: isActive ? 1 : 0,
                                    transform: isActive ? 'scale(1)' : 'scale(0.8)',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = isActive ? '#7c3aed' : 'rgba(255,255,255,0.4)';
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* ── RIGHT CONTROLS ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>

                {/* Divider */}
                <div style={{ width: '1px', height: '22px', background: 'rgba(196,181,253,0.2)' }} />

                {/* Bell */}
                <button
                    onClick={() => setActiveView('new-profiles')}
                    title="Notifications"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(196,181,253,0.3)',
                        width: '34px', height: '34px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ddd6fe', cursor: 'pointer', position: 'relative',
                        outline: 'none', padding: 0, transition: 'all 0.2s',
                        boxShadow: '0 0 12px rgba(139,92,246,0.3)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(167,139,250,0.6)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(139,92,246,0.3)'; }}
                >
                    <i className="fa-regular fa-bell" style={{ fontSize: '0.9rem' }}></i>
                    {newCount > 0 && (
                        <span style={{
                            position: 'absolute', top: -2, right: -2,
                            background: 'linear-gradient(135deg,#f43f5e,#ef4444)',
                            color: '#fff', fontSize: '0.58rem', fontWeight: 800,
                            minWidth: '15px', height: '15px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 8px rgba(244,63,94,0.8)',
                            border: '2px solid #3b1181',
                        }}>
                            {newCount > 99 ? '99+' : newCount}
                        </span>
                    )}
                </button>

                {/* Divider */}
                <div style={{ width: '1px', height: '22px', background: 'rgba(196,181,253,0.2)' }} />

                {/* User */}
                <button
                    onClick={onLogout}
                    title={`Logout`}
                    style={{
                        background: 'transparent', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.55rem',
                        cursor: 'pointer', padding: 0, outline: 'none',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 700, color: '#ede9fe',
                            textShadow: '0 0 10px rgba(196,181,253,0.6)',
                        }}>
                            {user?.email?.split('@')[0] || 'Admin'}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(196,181,253,0.5)' }}>HR Manager</span>
                    </div>

                    {/* Avatar */}
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ffffff 0%, #ddd6fe 50%, #a5b4fc 100%)',
                        color: '#4c1d95',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.9rem',
                        boxShadow: '0 0 16px rgba(196,181,253,0.7), 0 0 32px rgba(99,102,241,0.4)',
                        border: '2px solid rgba(196,181,253,0.5)',
                    }}>
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </div>

                    <i className="fa-solid fa-arrow-right-from-bracket"
                        style={{ color: '#fb7185', fontSize: '0.8rem', opacity: 0.9 }}></i>
                </button>
            </div>
        </header>
    );
};

export default Header;
