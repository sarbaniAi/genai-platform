import { useState, useEffect } from 'react';
import { LogOut, Users, Award, FileText, ArrowLeft } from 'lucide-react';
import { listStudents, loadStudentData } from '../lib/storage';

export default function InstructorView({ modules, onLogout, onBackToAdmin }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    setStudents(listStudents());
  }, []);

  const getProgress = (name) => loadStudentData(name).progress || {};
  const getSubmissions = (name) => loadStudentData(name).submitted || {};

  const avgCompletion = students.length
    ? Math.round(students.reduce((sum, s) => {
        const p = getProgress(s);
        return sum + (Object.values(p).filter(Boolean).length / modules.length * 100);
      }, 0) / students.length)
    : 0;
  const totalSubs = students.reduce((sum, s) => sum + Object.keys(getSubmissions(s)).length, 0);

  return (
    <div className="min-h-screen" style={{ background: '#E8EBEE' }}>
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: '"Bricolage Grotesque", sans-serif' }}>
              Instructor Dashboard
            </h1>
            <p className="text-sm text-slate-600">GenAI Foundations Cohort</p>
          </div>
          <div className="flex items-center gap-3">
            {onBackToAdmin && (
              <button onClick={onBackToAdmin} className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-900 border border-teal-200 rounded px-2.5 py-1.5 hover:bg-teal-50">
                <ArrowLeft size={14} /> Back to Admin
              </button>
            )}
            <button onClick={onLogout} className="flex items-center gap-1 text-slate-600 hover:text-slate-900 text-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className="text-slate-400" />
              <p className="text-xs text-slate-600 uppercase font-semibold">Total Students</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Award size={18} className="text-violet-400" />
              <p className="text-xs text-slate-600 uppercase font-semibold">Avg Completion</p>
            </div>
            <p className="text-3xl font-bold text-violet-600">{avgCompletion}%</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-emerald-500" />
              <p className="text-xs text-slate-600 uppercase font-semibold">Submissions</p>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{totalSubs}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Student Progress</h2>
          </div>
          {students.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              <Users size={36} className="mx-auto mb-3 opacity-40" />
              <p>No students yet. Share the app link with your cohort!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                    {modules.map(m => (
                      <th key={m.code} className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase">{m.code}</th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(name => {
                    const p = getProgress(name);
                    const completed = Object.values(p).filter(Boolean).length;
                    const pct = Math.round((completed / modules.length) * 100);
                    return (
                      <tr key={name} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{name}</td>
                        {modules.map(m => (
                          <td key={m.code} className="px-3 py-4 text-center">
                            {p[m.code] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">−</span>}
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-600" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 w-8">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
