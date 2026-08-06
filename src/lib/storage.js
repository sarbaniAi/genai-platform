// Storage layer — hybrid: GitHub is the source of truth (shared across users),
// localStorage is a per-browser cache + offline fallback.

import { fetchJson, writeJson, listDir, isConfigured } from './githubDb';
import { DEFAULT_MODULES, DEFAULT_META } from '../data/modules';

const MODULES_KEY = 'genai_modules_v1';
const META_KEY = 'genai_meta_v1';
const STUDENT_PREFIX = 'student_';
const CONTENT_PATH = 'content/modules.json';
const META_PATH = 'content/meta.json';
const PROGRESS_DIR = 'progress';

// ---------- localStorage (cache) ----------

export function loadModulesLocal() {
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Failed to parse stored modules', e); }
  return null;
}
export function saveModulesLocal(modules) {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
}
export function loadMetaLocal() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Failed to parse stored meta', e); }
  return null;
}
export function saveMetaLocal(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}
export function resetContent() {
  localStorage.removeItem(MODULES_KEY);
  localStorage.removeItem(META_KEY);
}
export function loadStudentDataLocal(name) {
  try {
    const raw = localStorage.getItem(STUDENT_PREFIX + name);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Failed to parse student data', e); }
  return { progress: {}, submitted: {} };
}
export function saveStudentDataLocal(name, data) {
  localStorage.setItem(STUDENT_PREFIX + name, JSON.stringify(data));
}
export function listStudentsLocal() {
  const students = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STUDENT_PREFIX)) students.push(key.replace(STUDENT_PREFIX, ''));
  }
  return students;
}

// ---------- Remote (GitHub) — content ----------

// Load modules from GitHub. Falls back to localStorage cache, then DEFAULT_MODULES.
export async function loadModulesRemote() {
  if (!isConfigured()) {
    return { modules: loadModulesLocal() || DEFAULT_MODULES, source: 'local' };
  }
  try {
    const result = await fetchJson(CONTENT_PATH);
    if (result) {
      saveModulesLocal(result.json);
      return { modules: result.json, source: 'remote' };
    }
  } catch (e) { console.warn('loadModulesRemote failed, using cache', e); }
  return { modules: loadModulesLocal() || DEFAULT_MODULES, source: 'cache' };
}

// Load meta from GitHub. Falls back to localStorage cache, then DEFAULT_META.
export async function loadMetaRemote() {
  if (!isConfigured()) {
    return { meta: loadMetaLocal() || DEFAULT_META, source: 'local' };
  }
  try {
    const result = await fetchJson(META_PATH);
    if (result) {
      saveMetaLocal(result.json);
      return { meta: result.json, source: 'remote' };
    }
  } catch (e) { console.warn('loadMetaRemote failed, using cache', e); }
  return { meta: loadMetaLocal() || DEFAULT_META, source: 'cache' };
}

// Save modules to GitHub (admin only). Also updates local cache.
export async function saveModulesRemote(modules) {
  saveModulesLocal(modules);
  if (!isConfigured()) return { ok: false, reason: 'not-configured' };
  try {
    const existing = await fetchJson(CONTENT_PATH);
    await writeJson(CONTENT_PATH, modules, existing ? existing.sha : undefined, 'Update curriculum modules');
    return { ok: true };
  } catch (e) {
    console.error('saveModulesRemote failed', e);
    return { ok: false, reason: e.message };
  }
}

// Save meta to GitHub (admin only). Also updates local cache.
export async function saveMetaRemote(meta) {
  saveMetaLocal(meta);
  if (!isConfigured()) return { ok: false, reason: 'not-configured' };
  try {
    const existing = await fetchJson(META_PATH);
    await writeJson(META_PATH, meta, existing ? existing.sha : undefined, 'Update course meta');
    return { ok: true };
  } catch (e) {
    console.error('saveMetaRemote failed', e);
    return { ok: false, reason: e.message };
  }
}

// ---------- Remote (GitHub) — student progress ----------
// Keyed by email (stable unique id from Google login). Falls back to name for password logins.

function progressPath(studentId) {
  return `${PROGRESS_DIR}/${studentId}.json`;
}

function safeId(name, email) {
  return (email || name || 'unknown').toLowerCase().replace(/[^a-z0-9._@-]/g, '_');
}

// Load a student's progress from GitHub. Falls back to localStorage.
export async function loadStudentDataRemote(name, email) {
  const local = loadStudentDataLocal(name);
  if (!isConfigured()) return local;
  try {
    const result = await fetchJson(progressPath(safeId(name, email)));
    if (result && result.json) {
      saveStudentDataLocal(name, result.json);
      return result.json;
    }
  } catch (e) { console.warn('loadStudentDataRemote failed, using cache', e); }
  return local;
}

// Save a student's progress to GitHub. Also updates local cache.
export async function saveStudentDataRemote(name, email, data) {
  saveStudentDataLocal(name, data);
  if (!isConfigured()) return { ok: false, reason: 'not-configured' };
  try {
    const path = progressPath(safeId(name, email));
    const payload = { ...data, name, email: email || null, updatedAt: new Date().toISOString() };
    const existing = await fetchJson(path);
    await writeJson(path, payload, existing ? existing.sha : undefined, `Progress update for ${name}`);
    return { ok: true };
  } catch (e) {
    console.error('saveStudentDataRemote failed', e);
    return { ok: false, reason: e.message };
  }
}

// List ALL students + their progress from GitHub (instructor dashboard).
// Returns array of { name, email, progress, submitted, updatedAt }.
export async function listStudentsRemote() {
  if (!isConfigured()) {
    return listStudentsLocal().map((name) => {
      const d = loadStudentDataLocal(name);
      return { name, email: null, progress: d.progress || {}, submitted: d.submitted || {}, updatedAt: null };
    });
  }
  try {
    const files = await listDir(PROGRESS_DIR);
    const results = await Promise.all(files.map(async (f) => {
      try {
        const r = await fetchJson(f.path);
        if (!r) return null;
        const j = r.json;
        return {
          name: j.name || f.name.replace(/\.json$/, ''),
          email: j.email || null,
          progress: j.progress || {},
          submitted: j.submitted || {},
          updatedAt: j.updatedAt || null,
        };
      } catch (e) { console.warn('Failed to read student file', f.path, e); return null; }
    }));
    return results.filter(Boolean);
  } catch (e) {
    console.error('listStudentsRemote failed, using local', e);
    return listStudentsLocal().map((name) => {
      const d = loadStudentDataLocal(name);
      return { name, email: null, progress: d.progress || {}, submitted: d.submitted || {}, updatedAt: null };
    });
  }
}

// ---------- Export / import (local only, for backup) ----------

export function exportContent() {
  return {
    modules: loadModulesLocal(),
    meta: loadMetaLocal(),
    exportedAt: new Date().toISOString(),
    version: 1
  };
}
export function importContent(json) {
  const data = typeof json === 'string' ? JSON.parse(json) : json;
  if (data.modules) saveModulesLocal(data.modules);
  if (data.meta) saveMetaLocal(data.meta);
  return data;
}
