import React, { useState } from 'react';

const LOGO = '/logo.png';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', color: '#38bdf8', glow: '#38bdf8' },
  { id: 'create-job', icon: 'fa-briefcase', label: 'Create Job', color: '#a78bfa', glow: '#a78bfa' },
  { id: 'upload', icon: 'fa-cloud-arrow-up', label: 'Upload Resume', color: '#34d399', glow: '#34d399' },
  { id: 'new-profiles', icon: 'fa-user-clock', label: 'New Profiles', color: '#fb923c', glow: '#fb923c' },
  { id: 'candidates', icon: 'fa-ranking-star', label: 'Candidate Ranking', color: '#f472b6', glow: '#f472b6' },
  { id: 'test-portal', icon: 'fa-graduation-cap', label: 'Student Portal', color: '#818cf8', glow: '#818cf8' },
  { id: 'video-records', icon: 'fa-video', label: 'Test Video Records', color: '#fbbf24', glow: '#fbbf24' },
  { id: 'analytics', icon: 'fa-chart-line', label: 'Analytics', color: '#4ade80', glow: '#4ade80' },
];

const SidebarToggleIcon = ({ isCollapsed }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4"></rect>
    {isCollapsed
      ? <><line x1="8" y1="3" x2="8" y2="21" /><path d="M12 9l3 3-3 3" /></>
      : <><line x1="16" y1="3" x2="16" y2="21" /><path d="M9 9l3 3-3 3" /></>
    }
  </svg>
);

const Sidebar = ({ activeView, setActiveView }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <aside
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
      style={{
        width: isCollapsed ? '76px' : '260px',
        minWidth: isCollapsed ? '76px' : '260px',
        // Rich jewel-toned gradient — deep violet to midnight blue
        background: 'linear-gradient(160deg, #1e0a3c 0%, #16123f 40%, #0b1d3a 80%, #081428 100%)',
        borderRight: '1px solid rgba(168,85,247,0.25)',
        boxShadow: '6px 0 40px rgba(0,0,0,0.6), inset -1px 0 0 rgba(168,85,247,0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxSizing: 'border-box',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden',
        overflowY: 'hidden',
      }}>

      {/* Decorative top glow orb */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '-20px',
        width: '160px',
        height: '160px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />

      {/* ===== TOP: Logo + Toggle ===== */}
      <div style={{
        display: 'flex',
        flexDirection: isCollapsed ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        width: '100%',
        padding: isCollapsed ? '1.5rem 0 0 0' : '1.25rem 1rem 0 1rem',
        marginBottom: '1.5rem',
        gap: isCollapsed ? '1rem' : '0',
        minHeight: '72px',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        {(!isCollapsed || !isSidebarHovered) && (
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'white',
            padding: '0.3rem',
            borderRadius: '10px',
            width: isCollapsed ? '44px' : '50px',
            height: isCollapsed ? '44px' : '50px',
            boxShadow: '0 0 20px rgba(139,92,246,0.6), 0 0 40px rgba(99,102,241,0.3)',
            order: isCollapsed ? 2 : 1,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}>
            <img src={LOGO} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        )}

        {/* Toggle Button */}
        {(!isCollapsed || isSidebarHovered) && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Toggle Sidebar"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '9px',
              color: '#c4b5fd',
              cursor: 'pointer',
              padding: '0.45rem 0.55rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              outline: 'none',
              transition: 'all 0.2s ease',
              order: isCollapsed ? 1 : 2,
              width: isCollapsed ? '75%' : 'auto',
              flexShrink: 0,
              boxShadow: '0 0 12px rgba(139,92,246,0.2)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(99,102,241,0.25))';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.5)';
              e.currentTarget.style.color = '#ede9fe';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(99,102,241,0.1))';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(139,92,246,0.2)';
              e.currentTarget.style.color = '#c4b5fd';
            }}
          >
            <SidebarToggleIcon isCollapsed={isCollapsed} />
          </button>
        )}
      </div>

      {/* ===== NAVIGATION ===== */}
      <nav style={{
        display: 'flex', flexDirection: 'column',
        width: '100%',
        padding: isCollapsed ? '0 8px' : '0 10px',
        flex: 1,
        gap: '4px',
        overflowY: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.id;
          const isHovered = hoveredItem === item.id && !isActive;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={isCollapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                width: '100%',
                flex: 1,
                minHeight: '44px',
                maxHeight: '72px',
                padding: isCollapsed ? '0' : '0 1rem',
                gap: '0.75rem',
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}30 0%, ${item.color}18 60%, transparent 100%)`
                  : isHovered
                    ? 'rgba(255,255,255,0.06)'
                    : 'transparent',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                color: isActive ? item.color : isHovered ? '#e2e8f0' : '#94a3b8',
                transition: 'all 0.2s ease',
                outline: 'none',
                position: 'relative',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? `0 4px 24px ${item.glow}30` : 'none',
              }}
            >
              {/* Active: left glowing bar */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '15%',
                  height: '70%', width: '3px',
                  background: `linear-gradient(180deg, transparent, ${item.color}, transparent)`,
                  borderRadius: '0 3px 3px 0',
                  boxShadow: `0 0 10px ${item.glow}, 0 0 20px ${item.glow}66`,
                }} />
              )}

              {/* Active: full right-edge shimmer */}
              {isActive && !isCollapsed && (
                <div style={{
                  position: 'absolute', right: 0, top: '15%',
                  height: '70%', width: '1px',
                  background: `linear-gradient(180deg, transparent, ${item.color}60, transparent)`,
                }} />
              )}

              {/* Icon */}
              <div style={{
                width: '22px',
                display: 'flex', justifyContent: 'center',
                flexShrink: 0,
                filter: isActive
                  ? `drop-shadow(0 0 8px ${item.glow}) drop-shadow(0 0 16px ${item.glow}88)`
                  : isHovered ? `drop-shadow(0 0 4px ${item.glow}66)` : 'none',
                transition: 'filter 0.25s ease',
              }}>
                <i className={`fa-solid ${item.icon}`} style={{ fontSize: '1.1rem' }}></i>
              </div>

              {/* Label */}
              {!isCollapsed && (
                <span style={{
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing: isActive ? '0.02em' : '0',
                }}>
                  {item.label}
                </span>
              )}

              {/* Active dot */}
              {isActive && !isCollapsed && (
                <div style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 8px ${item.glow}, 0 0 16px ${item.glow}`,
                  flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* ===== BOTTOM STATUS ===== */}
      {!isCollapsed && (
        <div style={{
          padding: '1rem 1.25rem',
          width: '100%',
          boxSizing: 'border-box',
          borderTop: '1px solid rgba(139,92,246,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: 'radial-gradient(circle, #4ade80, #22c55e)',
            boxShadow: '0 0 8px rgba(74,222,128,0.9), 0 0 16px rgba(74,222,128,0.5)',
          }} />
          <span style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.06em' }}>
            System Online
          </span>
        </div>
      )}

      {/* Bottom glow orb */}
      <div style={{
        position: 'absolute',
        bottom: '-60px',
        right: '-40px',
        width: '180px',
        height: '180px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />
    </aside>
  );
};

export default Sidebar;
