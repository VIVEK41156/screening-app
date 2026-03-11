import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import CreateJob from './components/CreateJob';
import UploadResume from './components/UploadResume';
import CandidateRanking from './components/CandidateRanking';
import CandidateProfile from './components/CandidateProfile';
import Analytics from './components/Analytics';
import StudentPortal from './components/StudentPortal';
import NewProfiles from './components/NewProfiles';
import TestVideoRecords from './components/TestVideoRecords';

// Map of view ids to display labels (used in tabs + breadcrumb)
const VIEW_LABELS = {
  'dashboard': 'Pipeline Analytics',
  'create-job': 'Job Requirements',
  'upload': 'Upload Resume',
  'new-profiles': 'New Profiles',
  'candidates': 'Candidate Ranking',
  'test-portal': 'Student Portal',
  'video-records': 'Test Video Records',
  'analytics': 'Analytics',
};

const VIEW_SECTION = {
  'dashboard': 'Dashboard',
  'create-job': 'Jobs',
  'upload': 'Resumes',
  'new-profiles': 'Resumes',
  'candidates': 'Candidates',
  'test-portal': 'Portals',
  'video-records': 'Portals',
  'analytics': 'Analytics',
};

// ── Toast component ──
function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast${t.leaving ? ' leaving' : ''}`}
          onClick={() => onRemove(t.id)}
        >
          <span style={{ fontSize: '1.1rem' }}>{t.emoji || '🔔'}</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>{t.title}</p>
            {t.message && <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, marginTop: '0.15rem' }}>{t.message}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('dark');
  const [activeView, setActiveViewRaw] = useState('dashboard');
  const [openTabs, setOpenTabs] = useState([{ id: 'dashboard', label: 'Dashboard' }]);
  const [token, setToken] = useState(localStorage.getItem('hr_token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hr_user')); } catch { return null; }
  });
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [prevCandidateCount, setPrevCandidateCount] = useState(0);
  const [toasts, setToasts] = useState([]);
  const [pageKey, setPageKey] = useState(0); // forces re-mount for animation

  // ── Toast helpers ──
  const addToast = (title, message, emoji = '🔔') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, emoji }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350);
  };

  // ── Tab management ──
  const setActiveView = (viewId) => {
    setActiveViewRaw(viewId);
    setPageKey(k => k + 1);
    setOpenTabs(prev => {
      const exists = prev.find(t => t.id === viewId);
      if (exists) return prev;
      return [...prev, { id: viewId, label: VIEW_LABELS[viewId] || viewId }];
    });
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (newTabs.length === 0) {
        setActiveViewRaw('dashboard');
        return [{ id: 'dashboard', label: 'Dashboard' }];
      }
      if (tabId === activeView) {
        const lastTab = newTabs[newTabs.length - 1];
        setActiveViewRaw(lastTab.id);
        setPageKey(k => k + 1);
      }
      return newTabs;
    });
  };

  // ── Auth & Theme ──

  const handleLogin = (newToken, newUser) => {
    setToken(newToken); setUser(newUser);
    localStorage.setItem('hr_token', newToken);
    localStorage.setItem('hr_user', JSON.stringify(newUser));
  };
  const handleLogout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
  };

  // ── Candidates polling ──
  const fetchCandidates = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/candidates', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.status === 401 || res.status === 400) {
        const data = await res.json();
        if (data.error?.includes('Invalid token') || data.error?.includes('Access denied')) {
          handleLogout(); return;
        }
      }
      if (res.ok) {
        const data = await res.json();
        if (prevCandidateCount > 0 && data.length > prevCandidateCount) {
          const diff = data.length - prevCandidateCount;
          addToast(
            `${diff} New Application${diff > 1 ? 's' : ''} Received!`,
            'A new resume has been processed by AI.',
            '🎉'
          );
          // play sound
          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.7;
            audio.play().catch(() => { });
          } catch (_) { }
        }
        if (data.length > 0) setPrevCandidateCount(data.length);
        setCandidates(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchCandidates();
    const interval = setInterval(fetchCandidates, 5000);
    return () => clearInterval(interval);
  }, [token]);

  if (!token) return <Login onLogin={handleLogin} />;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard candidates={candidates} token={token} onViewProfile={c => setSelectedCandidate(c)} />;
      case 'create-job': return <CreateJob token={token} />;
      case 'upload': return <UploadResume token={token} onUploadSuccess={() => { fetchCandidates(); setActiveView('candidates'); }} setActiveView={setActiveView} />;
      case 'new-profiles': return <NewProfiles candidates={candidates} token={token} onScreenComplete={fetchCandidates} />;
      case 'candidates': return <CandidateRanking candidates={candidates} token={token} onViewProfile={c => setSelectedCandidate(c)} />;
      case 'test-portal': return <StudentPortal candidates={candidates} token={token} />;
      case 'video-records': return <TestVideoRecords candidates={candidates} />;
      case 'analytics': return <Analytics candidates={candidates} token={token} />;
      default: return <Dashboard candidates={candidates} token={token} onViewProfile={c => setSelectedCandidate(c)} />;
    }
  };

  const viewLabel = VIEW_LABELS[activeView] || activeView;
  const viewSection = VIEW_SECTION[activeView] || 'App';

  return (
    <>
      <div className="app-container">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        <main className="main-content">
          {/* Header with tabs */}
          <Header
            user={user}
            onLogout={handleLogout}
            setActiveView={setActiveView}
            candidates={candidates}
            openTabs={openTabs}
            activeView={activeView}
            onTabClick={id => { setActiveViewRaw(id); setPageKey(k => k + 1); }}
            onTabClose={closeTab}
          />

          {/* ── App Content Area ── */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* ── Breadcrumb Strip ── */}
            <div className="breadcrumb-strip">
              <span>🏠</span>
              <span style={{ color: '#334155' }}>›</span>
              <span>{viewSection}</span>
              <span style={{ color: '#334155' }}>›</span>
              <span className="bc-current">{viewLabel}</span>
              <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: '#1e293b' }}>
                {candidates.length} candidates · {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
              </span>
            </div>

            {/* ── Page Content with Animation ── */}
            <div
              key={pageKey}
              className="page-enter"
              style={{ padding: '1.75rem 2.5rem', minHeight: 'calc(100vh - 110px)' }}
            >
              {renderView()}
            </div>
          </div>
        </main>

        {/* Candidate Profile Modal */}
        {selectedCandidate && (
          <CandidateProfile
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            token={token}
          />
        )}

        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}

// ── Global Theme CSS Injector ──
const themeCss = `
.theme-light {
    /* Magic CSS filter that smoothly inverts dark backgrounds to light backgrounds, while keeping accent colors relatively vibrant through a 180deg hue rotation */
    filter: invert(1) hue-rotate(180deg);
    background: #fdfdfd; /* ensures the base background perfectly inverts */
}
/* Re-invert elements that shouldn't be inverted (like avatars, videos, explicit colors) */
.theme-light .re-invert,
.theme-light video,
.theme-light img,
.theme-light iframe {
    filter: invert(1) hue-rotate(180deg);
}
`;

if (!document.getElementById('hr-theme-styles')) {
  const s = document.createElement('style');
  s.id = 'hr-theme-styles';
  s.innerHTML = themeCss;
  document.head.appendChild(s);
}

export default App;
