// GitHub REST API client — uses a fine-grained PAT (VITE_GITHUB_TOKEN) to read/write
// JSON files in the repo. This is the shared "database" for content + student progress.
//
// Security note: the token is embedded in the client bundle (visible in network/devtools).
// Use a fine-grained PAT scoped to ONLY this repo with ONLY `Contents: Read and Write`.
// Worst case if leaked: someone corrupts repo content — recoverable via git history.

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
const OWNER = import.meta.env.VITE_GITHUB_OWNER || 'sarbaniai';
const REPO = import.meta.env.VITE_GITHUB_REPO || 'genai-platform';
const BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';
const API = 'https://api.github.com';

export function isConfigured() {
  return Boolean(TOKEN && OWNER && REPO);
}

async function ghHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...extra,
  };
}

// Read a JSON file from the repo. Returns { json, sha } or null if missing.
export async function fetchJson(path) {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: await ghHeaders() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub fetch ${path} failed: ${res.status}`);
  const data = await res.json();
  const json = JSON.parse(atob(data.content.replace(/\n/g, '')));
  return { json, sha: data.sha };
}

// Create or update a JSON file. If `sha` is provided, updates; otherwise creates.
export async function writeJson(path, json, sha, message) {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}`;
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(json, null, 2))));
  const body = { message: message || `Update ${path}`, content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(url, {
    method: 'PUT',
    headers: await ghHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  if (res.status === 409) {
    // sha conflict — re-fetch and retry once
    const fresh = await fetchJson(path);
    return writeJson(path, json, fresh ? fresh.sha : undefined, message);
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub write ${path} failed: ${res.status} ${err.message || ''}`);
  }
  const data = await res.json();
  return data.content ? data.content.sha : null;
}

// List files in a directory. Returns array of { name, path, sha } or [] if missing.
export async function listDir(path) {
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: await ghHeaders() });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list ${path} failed: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.filter((f) => f.type === 'file').map((f) => ({ name: f.name, path: f.path, sha: f.sha }));
}
