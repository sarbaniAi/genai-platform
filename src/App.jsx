import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, BookOpen, Users, LogOut } from 'lucide-react';

const MODULES = [
  {
    code: "START",
    title: "Starter Resources — Watch These First",
    tag: "Three 1-hour talks from Andrej Karpathy",
    time: "3 hours",
    learn: "Get a complete mental model from the expert.",
    do: "Watch in order: Intro → Deep Dive → Practical.",
    objectives: [
      "Understand LLM architecture, training, and inference",
      "See real-world examples of how LLMs succeed and fail",
      "Learn practical patterns for using LLMs"
    ],
    checkpoint: "Take 3 key insights and write them down.",
    resources: [
      { type: "video", title: "Intro to Large Language Models", link: "https://www.youtube.com/watch?v=zjkBMFhNj_g", time: "1 hr" },
      { type: "video", title: "Deep Dive into LLMs like ChatGPT (Latest)", link: "https://www.youtube.com/watch?v=7xTGNNLPyMI", time: "1 hr" },
      { type: "video", title: "How I use LLMs (Practical)", link: "https://www.youtube.com/watch?v=EWvNQjAaOHw", time: "1 hr" }
    ],
    watchouts: "Watch all three in order. Don't skip.",
    tools: ["YouTube", "Notebook", "Claude or ChatGPT"]
  },
  {
    code: "W1",
    title: "How LLMs Actually Work",
    tag: "Build the mental model that explains both power and failures.",
    time: "7.5 hours",
    learn: "Understand transformers, tokens, attention, and why LLMs hallucinate.",
    do: "Read Karpathy's blog and watch 3Blue1Brown; play with tokenizer.",
    objectives: [
      "Build a correct mental model of transformers",
      "Predict where LLMs will help vs. mislead",
      "Understand the token economy"
    ],
    checkpoint: "Write 2-paragraph explanation of how attention works.",
    resources: [
      { type: "blog", title: "Karpathy — A Recipe for Training Neural Networks", link: "http://karpathy.github.io/2019/04/25/recipe/", time: "20 min" },
      { type: "interactive", title: "Hugging Face — What is a Transformer?", link: "https://huggingface.co/course/en/chapter1/1", time: "30 min" },
      { type: "blog", title: "The Illustrated Transformer", link: "https://jalammar.github.io/illustrated-transformer/", time: "45 min" },
      { type: "video", title: "Attention in Transformers (Chapter 6)", link: "https://www.3blue1brown.com/lessons/attention/", time: "26 min" },
      { type: "tool", title: "OpenAI Tokenizer Demo", link: "https://platform.openai.com/tokenizer", time: "20 min" }
    ],
    watchouts: "This feels theoretical, but it's the foundation.",
    tools: ["Claude", "ChatGPT", "LLM tokenizer", "Python"]
  },
  {
    code: "W2",
    title: "Capabilities, Limits & Failure Modes",
    tag: "Know what can go wrong and when hallucinations matter.",
    time: "8 hours",
    learn: "Understand hallucinations, scaling laws, when to trust LLM output.",
    do: "Read incident cases; test a hallucination yourself.",
    objectives: [
      "Recognize hallucinations and why they happen",
      "Know when hallucinations are acceptable",
      "Understand in-context learning"
    ],
    checkpoint: "List 3 scenarios where hallucinations are OK, 3 where NOT OK.",
    resources: [
      { type: "docs", title: "OpenAI — Limitations of GPT-4", link: "https://help.openai.com/en/articles/6783457-limitations-of-gpt-4", time: "30 min" },
      { type: "video", title: "Mollick — How to Use AI to Do Stuff", link: "https://www.youtube.com/watch?v=bZQun8Y4L2A", time: "1 hr" },
      { type: "video", title: "Why Do LLMs Hallucinate?", link: "https://www.youtube.com/watch?v=Fje9LjNLI9Q", time: "25 min" },
      { type: "database", title: "AI Incident Database", link: "https://incidentdatabase.ai/", time: "2 hrs" },
      { type: "guide", title: "OWASP Top 10 for LLMs", link: "https://owasp.org/www-project-top-10-for-large-language-model-applications/", time: "1.5 hrs" }
    ],
    watchouts: "Bigger models hallucinate less, but they still do.",
    tools: ["Claude", "ChatGPT", "Incident logs"]
  },
  {
    code: "W3",
    title: "Practical Integration — Prompting & APIs",
    tag: "Write effective prompts and integrate LLMs into workflows.",
    time: "8.5 hours",
    learn: "Master prompting, cost modeling, RAG patterns.",
    do: "Write 3 prompts for your infrastructure work.",
    objectives: [
      "Write effective technical prompts",
      "Understand LLM API economics",
      "Know when to use RAG"
    ],
    checkpoint: "Test 3 prompts and report results.",
    resources: [
      { type: "guide", title: "Anthropic — Prompt Engineering Guide", link: "https://docs.anthropic.com/claude/docs/build-with-claude/prompt-engineering/overview", time: "1 hr" },
      { type: "guide", title: "OpenAI — Prompt Engineering", link: "https://platform.openai.com/docs/guides/prompt-engineering", time: "1.5 hrs" },
      { type: "blog", title: "Chip Huyen — LLM Engineering", link: "https://huyenchip.com/2023/04/11/llm-engineering.html", time: "2 hrs" },
      { type: "docs", title: "LangChain — Prompts & Memory", link: "https://python.langchain.com/docs/modules/model_io/prompts/", time: "1.5 hrs" },
      { type: "docs", title: "LlamaIndex — RAG Deep Dive", link: "https://docs.llamaindex.ai/en/stable/", time: "2 hrs" }
    ],
    watchouts: "Good prompts have structure. Test and iterate.",
    tools: ["Claude", "ChatGPT", "LangChain", "Python", "Pinecone"]
  },
  {
    code: "W4",
    title: "Safety, Governance & Capstone",
    tag: "Learn to use LLMs responsibly in production.",
    time: "8 hours",
    learn: "Build verification checklists, protect secrets, design safe workflows.",
    do: "Redact a log; build verification checklist; submit capstone.",
    objectives: [
      "Design verification mechanisms",
      "Keep secrets, PII, and code out of prompts",
      "Understand your org's AI policy"
    ],
    checkpoint: "Capstone: Document one LLM-assisted workflow.",
    resources: [
      { type: "research", title: "Anthropic — Evaluating AI Safety", link: "https://www.anthropic.com/research/evaluating-ai-safety", time: "1 hr" },
      { type: "guide", title: "OpenAI — Our Approach to AI Safety", link: "https://openai.com/safety", time: "1 hr" },
      { type: "docs", title: "HashiCorp Vault", link: "https://www.vaultproject.io/", time: "1 hr" },
      { type: "case", title: "GitHub Copilot in CI/CD", link: "https://github.blog/2023-06-20-how-copilot-for-pull-requests-saves-developers-time/", time: "30 min" },
      { type: "template", title: "Prompt Templates", link: "https://github.com/anthropics/prompt-templates", time: "30 min" }
    ],
    watchouts: "Verification is core engineering. Treat it seriously.",
    tools: ["Org AI policy", "Secrets tooling", "Claude", "ChatGPT", "Vault"]
  }
];

const getResourceIcon = (type) => {
  const icons = {
    video: '🎬',
    blog: '📝',
    interactive: '💻',
    tool: '🔧',
    docs: '📖',
    database: '🗄️',
    guide: '📚',
    research: '🔬',
    case: '📊',
    template: '📋'
  };
  return icons[type] || '🔗';
};

const StudentView = ({ studentName, setStudentName, setCurrentView }) => {
  const [expandedModule, setExpandedModule] = useState(0);
  const [progress, setProgress] = useState({});
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem(`student_${studentName}`);
    if (saved) {
      const data = JSON.parse(saved);
      setProgress(data.progress || {});
      setSubmitted(data.submitted || {});
    }
  }, [studentName]);

  useEffect(() => {
    if (studentName) {
      localStorage.setItem(`student_${studentName}`, JSON.stringify({
        progress,
        submitted
      }));
    }
  }, [progress, submitted, studentName]);

  const toggleModule = (index) => {
    setExpandedModule(expandedModule === index ? -1 : index);
  };

  const toggleProgress = (code) => {
    setProgress(prev => ({ ...prev, [code]: !prev[code] }));
  };

  const handleCheckpointSubmit = (code, response) => {
    setSubmitted(prev => ({ ...prev, [code]: { response, date: new Date().toISOString() } }));
    alert(`✅ Checkpoint submitted for ${code}!`);
  };

  const completedCount = Object.values(progress).filter(Boolean).length;
  const completionPercent = Math.round((completedCount / MODULES.length) * 100);

  if (!studentName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">GenAI Foundations</h1>
          <p className="text-slate-600 mb-8">Interactive Learning Platform</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    setStudentName(e.target.value.trim());
                  }
                }}
              />
            </div>
            <button
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input');
                if (input.value.trim()) {
                  setStudentName(input.value.trim());
                }
              }}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Enter Learning Platform
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">GenAI Foundations</h1>
            <p className="text-sm text-slate-600">Welcome, {studentName}</p>
          </div>
          <button onClick={() => { setStudentName(''); setCurrentView('login'); }} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-slate-700">Your Progress</p>
            <p className="text-sm text-slate-600">{completedCount} of {MODULES.length} weeks</p>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {MODULES.map((module, index) => (
            <div key={module.code} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition">
              <button onClick={() => toggleModule(index)} className="w-full px-6 py-5 flex items-start justify-between hover:bg-slate-50 transition text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 font-mono text-sm font-semibold text-slate-600">{module.code}</span>
                    <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
                    {progress[module.code] && <span className="ml-auto text-violet-600"><Check size={20} /></span>}
                  </div>
                  <p className="text-sm text-slate-600">{module.tag}</p>
                </div>
                <div className="ml-4">
                  {expandedModule === index ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </button>

              {expandedModule === index && (
                <div className="border-t border-slate-200 px-6 py-6 bg-slate-50 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-slate-600 uppercase">Time</p>
                      <p className="text-lg font-semibold text-slate-900">⏱️ {module.time}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs font-medium text-slate-600 uppercase">Status</p>
                      <p className="text-lg font-semibold text-slate-900">{progress[module.code] ? '✅ Complete' : '⏳ In Progress'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">You will learn</p>
                      <p className="text-sm text-emerald-900">{module.learn}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-700 uppercase mb-2">You will do</p>
                      <p className="text-sm text-blue-900">{module.do}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase text-slate-600">Learning Outcomes</h4>
                    <ul className="space-y-2">
                      {module.objectives.map((obj, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-700">
                          <span className="text-violet-600 font-bold mt-0.5">✓</span>{obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase text-slate-600">Resources</h4>
                    <div className="grid gap-2">
                      {module.resources.map((res, i) => (
                        <a key={i} href={res.link} target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-lg border border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition flex justify-between items-center group">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-violet-700">{getResourceIcon(res.type)} {res.title}</p>
                          <span className="text-xs text-slate-500 ml-2 whitespace-nowrap">{res.time}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-900 mb-3">✓ Checkpoint</h4>
                    <p className="text-sm text-amber-900 mb-3">{module.checkpoint}</p>
                    {submitted[module.code] ? (
                      <div className="bg-white p-3 rounded border border-amber-300">
                        <p className="text-xs text-amber-700">✅ Submitted {new Date(submitted[module.code].date).toLocaleDateString()}</p>
                        <p className="text-sm text-amber-900 mt-1">{submitted[module.code].response}</p>
                      </div>
                    ) : (
                      <textarea placeholder="Write your response here..." className="w-full p-3 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3" rows="4" id={`checkpoint-${module.code}`} />
                    )}
                    {!submitted[module.code] && (
                      <button
                        onClick={() => {
                          const text = document.getElementById(`checkpoint-${module.code}`).value;
                          if (text.trim()) {
                            handleCheckpointSubmit(module.code, text);
                          } else {
                            alert('Please write something before submitting.');
                          }
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 rounded-lg transition"
                      >
                        Submit Checkpoint
                      </button>
                    )}
                  </div>

                  <button onClick={() => toggleProgress(module.code)} className={`w-full py-3 rounded-lg font-semibold transition ${progress[module.code] ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-violet-600 text-white hover:bg-violet-700'}`}>
                    {progress[module.code] ? '✅ Mark as In Progress' : '✓ Mark as Complete'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const InstructorView = ({ setCurrentView }) => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const allStudents = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('student_')) {
        allStudents.add(key.replace('student_', ''));
      }
    }
    setStudents(Array.from(allStudents));
  }, []);

  const getStudentProgress = (name) => {
    const saved = localStorage.getItem(`student_${name}`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.progress || {};
    }
    return {};
  };

  const getStudentCheckpoints = (name) => {
    const saved = localStorage.getItem(`student_${name}`);
    if (saved) {
      const data = JSON.parse(saved);
      return data.submitted || {};
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Instructor Dashboard</h1>
            <p className="text-sm text-slate-600">GenAI Foundations Cohort</p>
          </div>
          <button onClick={() => setCurrentView('login')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <p className="text-sm text-slate-600 uppercase font-semibold mb-2">Total Students</p>
            <p className="text-3xl font-bold text-slate-900">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <p className="text-sm text-slate-600 uppercase font-semibold mb-2">Avg Completion</p>
            <p className="text-3xl font-bold text-violet-600">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => {
                const prog = getStudentProgress(s);
                return sum + (Object.values(prog).filter(Boolean).length / MODULES.length * 100);
              }, 0) / students.length) : 0}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <p className="text-sm text-slate-600 uppercase font-semibold mb-2">Submissions</p>
            <p className="text-3xl font-bold text-emerald-600">
              {students.reduce((sum, s) => sum + Object.keys(getStudentCheckpoints(s)).length, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Student Progress</h2>
          </div>
          {students.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p>No students yet. Share the app link with your cohort!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                    {MODULES.map(m => (
                      <th key={m.code} className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase">{m.code}</th>
                    ))}
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(name => {
                    const progress = getStudentProgress(name);
                    const completed = Object.values(progress).filter(Boolean).length;
                    const percent = Math.round((completed / MODULES.length) * 100);
                    return (
                      <tr key={name} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{name}</td>
                        {MODULES.map(m => (
                          <td key={m.code} className="px-3 py-4 text-center">
                            {progress[m.code] ? <span className="text-green-600 font-bold">✓</span> : <span className="text-slate-300">−</span>}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-600 transition-all" style={{ width: `${percent}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 w-8">{percent}%</span>
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
};

const LoginView = ({ setCurrentView }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">GenAI Foundations</h1>
        <p className="text-slate-600 mb-8">Interactive Learning Platform</p>
        <div className="space-y-3">
          <button onClick={() => setCurrentView('student')} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <BookOpen size={20} /> Student Login
          </button>
          <button onClick={() => setCurrentView('instructor')} className="w-full bg-slate-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2">
            <Users size={20} /> Instructor Dashboard
          </button>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-600 text-center">
            This platform stores all data locally in your browser. No server, no accounts, no fees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [studentName, setStudentName] = useState('');

  return (
    <div>
      {currentView === 'login' && <LoginView setCurrentView={setCurrentView} />}
      {currentView === 'student' && (
        <StudentView studentName={studentName} setStudentName={setStudentName} setCurrentView={setCurrentView} />
      )}
      {currentView === 'instructor' && <InstructorView setCurrentView={setCurrentView} />}
    </div>
  );
}
