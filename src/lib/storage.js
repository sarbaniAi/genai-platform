// localStorage helpers for modules, meta, and per-student progress.

const MODULES_KEY = 'genai_modules_v1';
const META_KEY = 'genai_meta_v1';
const STUDENT_PREFIX = 'student_';

export function loadModules() {
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored modules', e);
  }
  return null;
}

export function saveModules(modules) {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
}

export function loadMeta(defaultMeta) {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse stored meta', e);
  }
  return defaultMeta;
}

export function saveMeta(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function resetContent() {
  localStorage.removeItem(MODULES_KEY);
  localStorage.removeItem(META_KEY);
}

export function loadStudentData(name) {
  try {
    const raw = localStorage.getItem(STUDENT_PREFIX + name);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse student data', e);
  }
  return { progress: {}, submitted: {} };
}

export function saveStudentData(name, data) {
  localStorage.setItem(STUDENT_PREFIX + name, JSON.stringify(data));
}

export function listStudents() {
  const students = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STUDENT_PREFIX)) {
      students.push(key.replace(STUDENT_PREFIX, ''));
    }
  }
  return students;
}

export function exportContent() {
  return {
    modules: loadModules(),
    meta: loadMeta({}),
    exportedAt: new Date().toISOString(),
    version: 1
  };
}

export function importContent(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (data.modules) saveModules(data.modules);
  if (data.meta) saveMeta(data.meta);
  return data;
}
