import { useState, useEffect } from 'react';
import { BookOpen, Users, Settings, LogOut, Lock } from 'lucide-react';
import { DEFAULT_MODULES, DEFAULT_META } from './data/modules';
import { loadModules, saveModules, loadMeta, saveMeta } from './lib/storage';
import { authenticate, startSession, clearSession, getCurrentRole, getCurrentName, hasSession } from './lib/adminAuth';
import StudentView from './views/StudentView';
import InstructorView from './views/InstructorView';
import AdminView from './views/AdminView';

function LoginView({ onLogin }) {
  const meta = loadMeta(DEFAULT_META);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setBusy(true);
    setError('');
    const result = await authenticate(name, password);
    setBusy(false);
    if (result) {
      startSession(result.name, result.role);
      onLogin(result);
    } else {
      setError('Authentication failed.');
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

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('pwd-input').focus(); }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password <span className="text-slate-400">(students leave blank)</span></label>
            <input
              id="pwd-input"
              type="password"
              placeholder="Instructors & admins enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Students: just enter your name. Instructors & admins: enter your name + password.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(() => hasSession() ? { role: getCurrentRole(), name: getCurrentName() } : null);
  const [modules, setModules] = useState(() => loadModules() || DEFAULT_MODULES);
  const [meta, setMeta] = useState(() => loadMeta(DEFAULT_META));

  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  const handleLogin = (newSession) => setSession(newSession);

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  if (!session) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div>
      {session.role === 'student' && (
        <StudentView
          modules={modules}
          meta={meta}
          studentName={session.name}
          setStudentName={() => {}}
          onLogout={handleLogout}
        />
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
        />
      )}
    </div>
  );
}
