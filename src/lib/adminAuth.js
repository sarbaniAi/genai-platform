// Role-based authentication via hashed passwords.
// Passwords are never stored in plaintext — only their SHA-256 hashes are in the code.
// Role is determined by which password matches:
//   - admin password      → 'admin'
//   - instructor password → 'instructor'
//   - anything else/empty → 'student' (no password needed)

const ADMIN_PASSWORD_HASH = 'bc7347cf8c0cd8d16292374b95d8ffbaf4243f029301698766b5970c8b80bb5f';
const INSTRUCTOR_PASSWORD_HASH = '7cf5db755289c205961624a7493ff81bec70fb040986d5418a418a72b555682e';

const SESSION_KEY = 'genai_session';

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(session) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function getCurrentRole() {
  const s = getSession();
  return s ? s.role : null;
}

export function getCurrentName() {
  const s = getSession();
  return s ? s.name : null;
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Determine role from name + password. Returns { role, name } or null on auth failure.
export async function authenticate(name, password) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return null;

  if (password) {
    const hash = await sha256(password);
    if (hash === ADMIN_PASSWORD_HASH) {
      return { role: 'admin', name: trimmedName };
    }
    if (hash === INSTRUCTOR_PASSWORD_HASH) {
      return { role: 'instructor', name: trimmedName };
    }
  }
  // No password or unknown password → student.
  return { role: 'student', name: trimmedName };
}

export function startSession(name, role) {
  setSession({ name, role, startedAt: new Date().toISOString() });
}

export function hasSession() {
  return getSession() !== null;
}
