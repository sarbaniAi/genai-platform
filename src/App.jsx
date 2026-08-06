import { useState, useEffect, useRef } from 'react';
import { BookOpen, Users, Settings, LogOut, Lock } from 'lucide-react';
import { DEFAULT_MODULES, DEFAULT_META } from './data/modules';
import { loadModules, saveModules, loadMeta, saveMeta } from './lib/storage';
import { isAdminUnlocked, unlockAdmin, lockAdmin } from './lib/adminAuth';
import StudentView from './views/StudentView';
import InstructorView from './views/InstructorView';
import AdminView from './views/AdminView';

function LoginView({ setCurrentView }) {
  const meta = loadMeta(DEFAULT_META);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminUnlocked, setAdminUnlocked] = useState(isAdminUnlocked());
  const dotClicks = useRef(0);
  const dotTimer = useRef(null);

  const handleSecretTrigger = () => {
    dotClicks.current += 1;
    if (dotTimer.current) clearTimeout(dotTimer.current);
    dotTimer.current = setTimeout(() => { dotClicks.current = 0; }, 1500);
    if (dotClicks.current >= 5) {
      dotClicks.current = 0;
      setShowAdminPrompt(true);
      setAuthError('');
    }
  };

  const handlePasswordSubmit = async () => {
    const ok = await unlockAdmin(passwordInput);
    if (ok) {
      setAdminUnlocked(true);
      setShowAdminPrompt(false);
      setPasswordInput('');
      setAuthError('');
      setCurrentView('admin');
    } else {
      setAuthError('Incorrect password.');
      setPasswordInput('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f4f0fb 0%, #e8ebee 50%, #ddf0f1 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <p className="font-mono text-xs tracking-widest uppercase text-slate-500 mb-3">{meta.eyebrow}</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Bricolage Grotesque", sans-serif', letterSpacing: '-0.025em' }}>
          GenAI Foundations
        </h1>
        <p className="text-slate-600 mb-8">{meta.thesis}</p>
        <div className="space-y-3">
          <button onClick={() => setCurrentView('student')} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <BookOpen size={20} /> Student Login
          </button>
          <button onClick={() => setCurrentView('instructor')} className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <Users size={20} /> Instructor Dashboard
          </button>
          {adminUnlocked && (
            <button onClick={() => setCurrentView('admin')} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
              <Settings size={20} /> Content Admin
            </button>
          )}
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            All data stored locally in your browser. No server, no accounts, no fees.
          </p>
          <p className="text-center mt-2">
            <button
              onClick={handleSecretTrigger}
              className="text-slate-300 hover:text-slate-400 text-xs cursor-default select-none"
              aria-hidden="true"
              tabIndex={-1}
              style={{ background: 'none', border: 'none', padding: '0 4px' }}
            >
              ·
            </button>
          </p>
        </div>
      </div>

      {showAdminPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={20} className="text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Admin Access</h2>
            </div>
            <input
              type="password"
              autoFocus
              placeholder="Enter admin password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setAuthError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
            />
            {authError && <p className="text-red-600 text-xs mb-2">{authError}</p>}
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setShowAdminPrompt(false); setPasswordInput(''); setAuthError(''); }} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handlePasswordSubmit} className="px-3 py-1.5 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg">Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [studentName, setStudentName] = useState('');
  const [modules, setModules] = useState(() => loadModules() || DEFAULT_MODULES);
  const [meta, setMeta] = useState(() => loadMeta(DEFAULT_META));

  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  // If a non-admin tries to access admin view directly, bounce to login.
  useEffect(() => {
    if (currentView === 'admin' && !isAdminUnlocked()) {
      setCurrentView('login');
    }
  }, [currentView]);

  const handleSetCurrentView = (view) => {
    if (view === 'admin' && !isAdminUnlocked()) {
      setCurrentView('login');
      return;
    }
    setCurrentView(view);
  };

  const handleLogoutFromAdmin = () => {
    lockAdmin();
    setCurrentView('login');
  };

  return (
    <div>
      {currentView === 'login' && <LoginView setCurrentView={handleSetCurrentView} />}
      {currentView === 'student' && (
        <StudentView
          modules={modules}
          meta={meta}
          studentName={studentName}
          setStudentName={setStudentName}
          setCurrentView={handleSetCurrentView}
        />
      )}
      {currentView === 'instructor' && (
        <InstructorView modules={modules} setCurrentView={handleSetCurrentView} />
      )}
      {currentView === 'admin' && isAdminUnlocked() && (
        <AdminView
          modules={modules}
          setModules={setModules}
          meta={meta}
          setMeta={setMeta}
          defaultModules={DEFAULT_MODULES}
          defaultMeta={DEFAULT_META}
          setCurrentView={handleSetCurrentView}
        />
      )}
    </div>
  );
}
