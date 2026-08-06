import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { DEFAULT_MODULES, DEFAULT_META } from './data/modules';
import { loadModules, saveModules, loadMeta, saveMeta } from './lib/storage';
import {
  authenticate, startSession, clearSession, getCurrentRole, getCurrentName, hasSession,
} from './lib/adminAuth';
import GoogleSignInButton from './components/GoogleSignInButton';
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

  // Stable callbacks so GoogleSignInButton (memoized) never re-renders.
  const handleGoogleLogin = useCallback((session) => onLogin(session), [onLogin]);
  const handleGoogleError = useCallback((msg) => setError(msg), []);

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
            <GoogleSignInButton onLogin={handleGoogleLogin} onError={handleGoogleError} />
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
  const [adminSubView, setAdminSubView] = useState('admin');
  const [modules, setModules] = useState(() => loadModules() || DEFAULT_MODULES);
  const [meta, setMeta] = useState(() => loadMeta(DEFAULT_META));

  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  const handleLogin = useCallback((newSession) => { setSession(newSession); setAdminSubView('admin'); }, []);
  const handleLogout = useCallback(() => { clearSession(); setSession(null); setAdminSubView('admin'); }, []);

  if (!session) return <LoginView onLogin={handleLogin} />;

  if (session.role === 'admin' && adminSubView === 'instructor') {
    return <InstructorView modules={modules} onLogout={handleLogout} onBackToAdmin={() => setAdminSubView('admin')} />;
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
