import { useState, useEffect } from 'react';
import { BookOpen, Users, Settings, LogOut } from 'lucide-react';
import { DEFAULT_MODULES, DEFAULT_META } from './data/modules';
import { loadModules, saveModules, loadMeta, saveMeta } from './lib/storage';
import StudentView from './views/StudentView';
import InstructorView from './views/InstructorView';
import AdminView from './views/AdminView';

function LoginView({ setCurrentView }) {
  const meta = loadMeta(DEFAULT_META);
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
          <button onClick={() => setCurrentView('admin')} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <Settings size={20} /> Content Admin
          </button>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            All data stored locally in your browser. No server, no accounts, no fees.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [studentName, setStudentName] = useState('');
  const [modules, setModules] = useState(() => loadModules() || DEFAULT_MODULES);
  const [meta, setMeta] = useState(() => loadMeta(DEFAULT_META));

  // Persist modules and meta whenever they change.
  useEffect(() => { saveModules(modules); }, [modules]);
  useEffect(() => { saveMeta(meta); }, [meta]);

  return (
    <div>
      {currentView === 'login' && <LoginView setCurrentView={setCurrentView} />}
      {currentView === 'student' && (
        <StudentView
          modules={modules}
          meta={meta}
          studentName={studentName}
          setStudentName={setStudentName}
          setCurrentView={setCurrentView}
        />
      )}
      {currentView === 'instructor' && (
        <InstructorView modules={modules} setCurrentView={setCurrentView} />
      )}
      {currentView === 'admin' && (
        <AdminView
          modules={modules}
          setModules={setModules}
          meta={meta}
          setMeta={setMeta}
          defaultModules={DEFAULT_MODULES}
          defaultMeta={DEFAULT_META}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  );
}
