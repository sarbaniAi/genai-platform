import { useState, useRef } from 'react';
import { LogOut, Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown, Download, Upload, RotateCcw } from 'lucide-react';
import { exportContent, importContent, resetContent } from '../lib/storage';
import ModuleEditor from '../components/ModuleEditor';

const blankModule = () => ({
  code: '',
  title: '',
  tag: '',
  time: '',
  learn: '',
  do: '',
  objectives: [],
  checkpoint: '',
  resources: [],
  watchouts: '',
  tools: []
});

export default function AdminView({ modules, setModules, meta, setMeta, defaultModules, defaultMeta, setCurrentView }) {
  const [editing, setEditing] = useState(null); // index or 'new' or null
  const [draft, setDraft] = useState(null);
  const fileRef = useRef(null);

  const startNew = () => { setDraft(blankModule()); setEditing('new'); };
  const startEdit = (i) => { setDraft(JSON.parse(JSON.stringify(modules[i]))); setEditing(i); };
  const cancelEdit = () => { setEditing(null); setDraft(null); };

  const saveDraft = () => {
    if (!draft.code.trim() || !draft.title.trim()) {
      alert('Code and Title are required.');
      return;
    }
    if (editing === 'new') {
      setModules([...modules, draft]);
    } else {
      const next = [...modules];
      next[editing] = draft;
      setModules(next);
    }
    setEditing(null);
    setDraft(null);
  };

  const deleteModule = (i) => {
    if (confirm(`Delete module "${modules[i].code} — ${modules[i].title}"? This cannot be undone.`)) {
      setModules(modules.filter((_, idx) => idx !== i));
    }
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= modules.length) return;
    const next = [...modules];
    [next[i], next[j]] = [next[j], next[i]];
    setModules(next);
  };

  const handleExport = () => {
    const data = exportContent();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genai-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = importContent(ev.target.result);
        if (data.modules) setModules(data.modules);
        if (data.meta) setMeta(data.meta);
        alert('Content imported successfully.');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Reset all content to defaults? Your custom modules will be lost.')) {
      resetContent();
      setModules(defaultModules);
      setMeta(defaultMeta);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#E8EBEE' }}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              Content Admin
            </h1>
            <p className="text-sm text-slate-600">Manage GenAI Foundations curriculum</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 hover:bg-slate-50">
              <Download size={14} /> Export
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded px-2.5 py-1.5 hover:bg-slate-50">
              <Upload size={14} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
            <button onClick={handleReset} className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 border border-amber-200 rounded px-2.5 py-1.5 hover:bg-amber-50">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={() => setCurrentView('login')} className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm">
              <LogOut size={18} /> Exit
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Meta editor */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Course Meta</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Eyebrow</label>
              <input
                value={meta.eyebrow || ''}
                onChange={(e) => setMeta({ ...meta, eyebrow: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
              <input
                value={meta.titleLead || ''}
                onChange={(e) => setMeta({ ...meta, titleLead: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Thesis</label>
              <textarea
                value={meta.thesis || ''}
                onChange={(e) => setMeta({ ...meta, thesis: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Modules list */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Modules ({modules.length})</h2>
          <button onClick={startNew} className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg">
            <Plus size={16} /> Add Module
          </button>
        </div>

        <div className="space-y-2">
          {modules.map((m, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 flex items-center gap-3">
              <span className="font-mono text-xs font-medium border border-slate-200 rounded px-2 py-1 text-slate-600 flex-shrink-0">{m.code}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{m.title}</p>
                <p className="text-xs text-slate-500 truncate">{m.tag}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30" title="Move up"><ArrowUp size={16} /></button>
                <button onClick={() => move(i, 1)} disabled={i === modules.length - 1} className="p-1.5 text-slate-400 hover:text-slate-900 disabled:opacity-30" title="Move down"><ArrowDown size={16} /></button>
                <button onClick={() => startEdit(i)} className="p-1.5 text-violet-600 hover:bg-violet-50 rounded" title="Edit"><Pencil size={16} /></button>
                <button onClick={() => deleteModule(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Editor modal */}
      {editing !== null && draft && (
        <ModuleEditor draft={draft} setDraft={setDraft} onSave={saveDraft} onCancel={cancelEdit} isNew={editing === 'new'} />
      )}
    </div>
  );
}
