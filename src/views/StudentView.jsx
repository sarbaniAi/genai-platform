import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Check, LogOut, RotateCcw, Loader2 } from 'lucide-react';
import { loadStudentDataRemote, saveStudentDataRemote } from '../lib/storage';

const RESOURCE_ICONS = {
  video: '🎬', blog: '📝', interactive: '💻', tool: '🔧', docs: '📖',
  database: '🗄️', guide: '📚', research: '🔬', case: '📊', template: '📋'
};

const inferIcon = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('video') || t.includes('youtube')) return '🎬';
  if (t.includes('blog') || t.includes('read')) return '📝';
  if (t.includes('interactive') || t.includes('demo') || t.includes('hands-on')) return '💻';
  if (t.includes('tokenizer')) return '🔧';
  if (t.includes('docs') || t.includes('documentation')) return '📖';
  if (t.includes('database') || t.includes('incident')) return '🗄️';
  if (t.includes('guide')) return '📚';
  if (t.includes('research') || t.includes('safety')) return '🔬';
  if (t.includes('case') || t.includes('study')) return '📊';
  if (t.includes('template')) return '📋';
  return '🔗';
};

export default function StudentView({ modules, meta, studentName, studentEmail, onLogout }) {
  const [expandedModule, setExpandedModule] = useState(0);
  const [progress, setProgress] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [syncing, setSyncing] = useState(false);
  const firstLoad = useRef(true);
  const saveTimer = useRef(null);

  // Load progress from GitHub on mount (falls back to local cache).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await loadStudentDataRemote(studentName, studentEmail);
      if (!cancelled) {
        setProgress(data.progress || {});
        setSubmitted(data.submitted || {});
      }
    })();
    return () => { cancelled = true; };
  }, [studentName, studentEmail]);

  // Debounced auto-save progress to GitHub whenever it changes (skip initial load).
  useEffect(() => {
    if (firstLoad.current) { firstLoad.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSyncing(true);
    saveTimer.current = setTimeout(async () => {
      await saveStudentDataRemote(studentName, studentEmail, { progress, submitted });
      setSyncing(false);
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [progress, submitted, studentName, studentEmail]);

  const toggleModule = (i) => setExpandedModule(expandedModule === i ? -1 : i);
  const toggleProgress = (code) => setProgress(p => ({ ...p, [code]: !p[code] }));
  const submitCheckpoint = (code, response) => {
    setSubmitted(s => ({ ...s, [code]: { response, date: new Date().toISOString() } }));
    alert(`✅ Checkpoint submitted for ${code}!`);
  };
  const resetProgress = () => {
    if (confirm('Reset all your progress? This cannot be undone.')) {
      setProgress({});
      setSubmitted({});
    }
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const completionPercent = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: '#E8EBEE' }}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              GenAI Foundations
            </h1>
            <p className="text-sm text-slate-600">Welcome, {studentName}</p>
          </div>
          <div className="flex items-center gap-3">
            {syncing && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Loader2 size={12} className="animate-spin" /> Saving...
              </span>
            )}
            <button onClick={resetProgress} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 text-sm" title="Reset progress">
              <RotateCcw size={16} /> Reset
            </button>
            <button onClick={onLogout} className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-700">Your progress — mark each week as you complete it</p>
            <p className="text-sm text-slate-600"><b className="text-violet-600">{completedCount}</b> / {modules.length}</p>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${completionPercent}%`, background: 'linear-gradient(90deg, #5238C9, #7d67ea)' }} />
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {modules.map((module, index) => {
            const done = !!progress[module.code];
            return (
              <article
                key={module.code}
                className={`bg-white rounded-xl border overflow-hidden transition ${done ? 'border-violet-300 shadow-[0_0_0_1px_#CFC6F3]' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-stretch">
                  <button
                    onClick={() => toggleModule(index)}
                    className="flex-1 min-w-0 text-left bg-none border-none p-4 flex items-start gap-3 cursor-pointer"
                  >
                    <span className={`font-mono text-xs font-medium border rounded-lg px-2 py-1 flex-shrink-0 mt-0.5 transition ${done ? 'text-violet-600 border-violet-300 bg-violet-50' : 'text-slate-500 border-slate-200'}`}>
                      {module.code}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block">
                        <span className="inline-block font-mono text-[0.6rem] uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 mb-1">
                          GenAI Foundations
                        </span>
                      </span>
                      <span className="block text-base font-bold text-slate-900" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
                        {module.title}
                      </span>
                      <span className="block text-sm text-slate-600">{module.tag}</span>
                    </span>
                    <span className={`font-mono text-xl text-slate-400 flex-shrink-0 transition-transform ${expandedModule === index ? 'rotate-45 text-violet-600' : ''}`}>
                      +
                    </span>
                  </button>
                  <button
                    onClick={() => toggleProgress(module.code)}
                    role="switch"
                    aria-checked={done}
                    aria-label={`Mark ${module.title} as complete`}
                    className={`flex-shrink-0 self-center mr-4 border rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition ${done ? 'text-violet-600 border-violet-300 bg-violet-50' : 'text-slate-500 border-slate-200 bg-slate-50'}`}
                  >
                    <span className={`w-3 h-3 rounded border-1.5 flex items-center justify-center ${done ? 'bg-violet-600 border-violet-600' : 'border-slate-400'}`}>
                      {done && <Check size={8} className="text-white" />}
                    </span>
                    <span className="font-mono text-xs">Done</span>
                  </button>
                </div>

                {expandedModule === index && (
                  <div className="border-t border-slate-200 px-4 py-5 bg-slate-50 space-y-5">
                    <span className="inline-block font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">⏱ {module.time}</span>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-teal-700 mb-1">You will learn</p>
                        <p className="text-sm text-slate-900">{module.learn}</p>
                      </div>
                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                        <p className="font-mono text-[0.65rem] uppercase tracking-wider text-violet-700 mb-1">You will do</p>
                        <p className="text-sm text-slate-900">{module.do}</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-2">— Learning outcomes</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {module.objectives.map((obj, i) => (
                          <li key={i} className="text-sm text-slate-700">{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-2">— Checkpoint</p>
                      <p className="text-sm text-slate-900">{module.checkpoint}</p>
                      {submitted[module.code] ? (
                        <div className="mt-2 bg-white p-3 rounded border border-amber-300">
                          <p className="font-mono text-xs text-amber-700">✅ Submitted {new Date(submitted[module.code].date).toLocaleDateString()}</p>
                          <p className="text-sm text-slate-900 mt-1">{submitted[module.code].response}</p>
                        </div>
                      ) : (
                        <>
                          <textarea
                            placeholder="Write your response here..."
                            className="w-full p-3 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mt-2 mb-2"
                            rows={3}
                            id={`checkpoint-${module.code}`}
                          />
                          <button
                            onClick={() => {
                              const text = document.getElementById(`checkpoint-${module.code}`).value;
                              if (text.trim()) submitCheckpoint(module.code, text);
                              else alert('Please write something before submitting.');
                            }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-4 rounded-lg text-sm transition"
                          >
                            Submit Checkpoint
                          </button>
                        </>
                      )}
                    </div>

                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-2">— Curated resources</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {module.resources.map((res, i) => (
                          <a
                            key={i}
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-2.5 bg-white border border-slate-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition"
                          >
                            <span className="text-sm font-medium text-slate-900">{inferIcon(res.title)} {res.title}</span>
                            <span className="block font-mono text-xs text-slate-500 mt-1">{res.time}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-2">— Watch-outs</p>
                      <p className="text-sm text-slate-900">{module.watchouts}</p>
                    </div>

                    <div>
                      <p className="font-mono text-[0.65rem] uppercase tracking-wider text-slate-500 mb-2">— Toolset</p>
                      <div className="flex flex-wrap gap-2">
                        {module.tools.map((t, i) => (
                          <span key={i} className="font-mono text-xs px-2.5 py-1 border border-slate-200 rounded bg-slate-50 text-slate-600">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
