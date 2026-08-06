import { Save, X, Plus, Trash2 } from 'lucide-react';

export default function ModuleEditor({ draft, setDraft, onSave, onCancel, isNew }) {
  const set = (field, value) => setDraft({ ...draft, [field]: value });

  const updateObjective = (i, value) => {
    const next = [...draft.objectives];
    next[i] = value;
    set('objectives', next);
  };
  const addObjective = () => set('objectives', [...draft.objectives, '']);
  const removeObjective = (i) => set('objectives', draft.objectives.filter((_, idx) => idx !== i));

  const updateResource = (i, field, value) => {
    const next = [...draft.resources];
    next[i] = { ...next[i], [field]: value };
    set('resources', next);
  };
  const addResource = () => set('resources', [...draft.resources, { title: '', link: '', time: '' }]);
  const removeResource = (i) => set('resources', draft.resources.filter((_, idx) => idx !== i));

  const updateTool = (i, value) => {
    const next = [...draft.tools];
    next[i] = value;
    set('tools', next);
  };
  const addTool = () => set('tools', [...draft.tools, '']);
  const removeTool = (i) => set('tools', draft.tools.filter((_, idx) => idx !== i));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{isNew ? 'New Module' : `Edit ${draft.code}`}</h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
              <input value={draft.code} onChange={(e) => set('code', e.target.value)} placeholder="W1" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
              <input value={draft.time} onChange={(e) => set('time', e.target.value)} placeholder="8 hours" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="How LLMs Actually Work" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tag</label>
            <input value={draft.tag} onChange={(e) => set('tag', e.target.value)} placeholder="Build the mental model..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">You will learn</label>
              <textarea value={draft.learn} onChange={(e) => set('learn', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">You will do</label>
              <textarea value={draft.do} onChange={(e) => set('do', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>

          {/* Objectives */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-600">Learning Outcomes</label>
              <button onClick={addObjective} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800"><Plus size={14} /> Add</button>
            </div>
            <div className="space-y-2">
              {draft.objectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <input value={obj} onChange={(e) => updateObjective(i, e.target.value)} className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <button onClick={() => removeObjective(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              ))}
              {draft.objectives.length === 0 && <p className="text-xs text-slate-400 italic">No outcomes yet.</p>}
            </div>
          </div>

          {/* Checkpoint */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Checkpoint</label>
            <textarea value={draft.checkpoint} onChange={(e) => set('checkpoint', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Resources */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-600">Curated Resources</label>
              <button onClick={addResource} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800"><Plus size={14} /> Add</button>
            </div>
            <div className="space-y-3">
              {draft.resources.map((res, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={res.title} onChange={(e) => updateResource(i, 'title', e.target.value)} placeholder="Resource title" className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <button onClick={() => removeResource(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input value={res.link} onChange={(e) => updateResource(i, 'link', e.target.value)} placeholder="https://..." className="col-span-2 px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input value={res.time} onChange={(e) => updateResource(i, 'time', e.target.value)} placeholder="30 min" className="px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>
                </div>
              ))}
              {draft.resources.length === 0 && <p className="text-xs text-slate-400 italic">No resources yet.</p>}
            </div>
          </div>

          {/* Watch-outs */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Watch-outs</label>
            <textarea value={draft.watchouts} onChange={(e) => set('watchouts', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>

          {/* Tools */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-600">Toolset</label>
              <button onClick={addTool} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800"><Plus size={14} /> Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {draft.tools.map((t, i) => (
                <div key={i} className="flex items-center gap-1 border border-slate-300 rounded-lg pl-2 pr-1 py-1">
                  <input value={t} onChange={(e) => updateTool(i, e.target.value)} className="text-sm w-28 focus:outline-none" />
                  <button onClick={() => removeTool(i)} className="p-0.5 text-red-500 hover:bg-red-50 rounded"><X size={14} /></button>
                </div>
              ))}
              {draft.tools.length === 0 && <p className="text-xs text-slate-400 italic">No tools yet.</p>}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={onSave} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg"><Save size={16} /> Save</button>
        </div>
      </div>
    </div>
  );
}
