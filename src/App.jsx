import { useState, useEffect } from 'react';
import { BookOpen, Users, Settings, LogOut, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { DEFAULT_MODULES, DEFAULT_META } from './data/modules';
import { loadModules, saveModules, loadMeta, saveMeta } from './lib/storage';
import {
  authenticate, startSession, clearSession, getCurrentRole, getCurrentName, hasSession,
  initGoogleButton,
} from './lib/adminAuth';
import StudentView from './views/StudentView';
import InstructorView from './views/InstructorView';
import AdminView from './views/AdminView';

function LoginView({ onLogin }) {
  const meta = loadMeta(DEFAULT_META);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(null); // null = loading, true/false = result
  const [googleError, setGoogleError] = useState('');

  const tryInitGoogle = () => {
    setGoogleConfigured(null);
    setGoogleError('');
    initGoogleButton(
      'google-signin-btn',
      (session) => onLogin(session),
      (msg) => { setGoogleError(msg); setGoogleConfigured(false); }
    ).then((ok) => { if (ok) setGoogleConfigured(true); });
  };

  useEffect(() => {
    tryInitGoogle();
  }, [onLogin]);

  const handlePasswordSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!password) { setError('Password is required for instructor/admin login.'); return; }
    setBusy(true); setError('');
    const result = await authenticate(name, password);
    setBusy(false);
    if (result) {
      startSession(result.name, null, result.role);
      onLogin(result);
    } else {
      setError('Incorrect password. If you are a student, use Sign in with Google.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f4f0fb 0%, #e8ebee 50%, #ddf0f1 100%)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <p className="font-mono text-xs tracking-widest uppercase text-slate-500 mb-3">{meta.eyebrow}</p>
        <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: '"Bricolage Grotesque", sans-serif', letterSpacing: '-0.025em' }}>
          GenAI Foundations
        </h1>
        <p className="text-slate-600 mb-6">{meta.thesis}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!showPasswordLogin && (
          <div className="space-y-4">
            <div id="google-signin-btn" className="flex justify-center min-h-[44px]">
              {googleConfigured === null && (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-violet-600 rounded-full animate-spin" />
                  Loading Google sign-in…
                </div>
              )}
              {googleConfigured === false && (
                <div className="text-center p-3 border border-dashed border-amber-300 rounded-lg bg-amber-50">
                  <p className="text-sm text-amber-800 mb-1">{googleError || 'Google sign-in could not load.'}</p>
                  <button onClick={tryInitGoogle} className="text-xs text-amber-700 hover:text-amber-900 underline">
                    Retry
                  </button>
                </div>
              )}
            </div>
            <div className="text-center">
              <button onClick={() => setShowPasswordLogin(true)} className="text-xs text-slate-500 hover:text-slate-700 underline">
                Instructor / Admin? Use password instead
              </button>
            </div>
          </div>
        )}

        {showPasswordLogin && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
              <input type="text" placeholder="Enter your name" value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('pwd-input').focus(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input id="pwd-input" type="password" placeholder="Instructor / Admin password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <button onClick={handlePasswordSubmit} disabled={busy}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition">
              {busy ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center">
              <button onClick={() => { setShowPasswordLogin(false); setError(''); setPassword(''); }}
                className="text-xs text-slate-500 hover:text-slate-700 underline">
                ← Back to Google sign in
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Students sign in with Google. Instructors & admins use password or Google.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => hasSession() ? { role: getCurrentRole(), name: getCurrentName() } : null);
  const [adminSubView, setAdminSubView] = useState('admin'); // 'admin' | 'instructor'
  const [modules, setModules] = useState(() => loadModules() || DEFAULT_MODULES);
  const [meta, setMeta] = useState(() => loadMeta(DEFAULT_META));

  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  const handleLogin = (newSession) => { setSession(newSession); setAdminSubView('admin'); };
  const handleLogout = () => { clearSession(); setSession(null); setAdminSubView('admin'); };

  if (!session) return <LoginView onLogin={handleLogin} />;

  // Admin can switch to view the instructor dashboard.
  if (session.role === 'admin' && adminSubView === 'instructor') {
    return (
      <div>
        <InstructorView
          modules={modules}
          onLogout={handleLogout}
          onBackToAdmin={() => setAdminSubView('admin')}
        />
      </div>
    );
  }

  return (
    <div>
      {session.role === 'student' && (
        <StudentView modules={modules} meta={meta} studentName={session.name} onLogout={handleLogout} />
      )}
      {session.role === 'instructor' && (
        <InstructorView modules={modules} onLogout={handleLogout} />
      )}
      {session.role === 'admin' && (
        <AdminView
          modules={modules}
          setModules={setModules}
          meta={meta}
          setMeta={setMeta}
          defaultModules={DEFAULT_MODULES}
          defaultMeta={DEFAULT_META}
          onLogout={handleLogout}
          onViewInstructor={() => setAdminSubView('instructor')}
        />
      )}
    </div>
  );
}
