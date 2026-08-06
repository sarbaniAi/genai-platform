// Google Identity Services (GIS) integration for real Google login.
// Users sign in with Google; their email determines their role via allowlists.
// Password fallback is kept for admin/instructor who prefer password auth.

// TODO: Replace these placeholders with your real values.
// See SETUP-GOOGLE-AUTH.md for how to create a Google OAuth Client ID.
export const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// Emails authorized for each role. Add your Gmail addresses here.
export const ADMIN_EMAILS = [
  'your-admin@gmail.com'
];
export const INSTRUCTOR_EMAILS = [
  'your-instructor@gmail.com'
];

// If true, only emails in the allowlists above can sign in (closed cohort).
// If false, anyone with a Google account can sign in as a student.
export const CLOSED_COHORT = false;

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

export function hasSession() {
  return getSession() !== null;
}

export function startSession(name, email, role) {
  setSession({ name, email, role, startedAt: new Date().toISOString() });
}

// Determine role from email.
function roleForEmail(email) {
  const e = (email || '').toLowerCase();
  if (ADMIN_EMAILS.includes(e)) return 'admin';
  if (INSTRUCTOR_EMAILS.includes(e)) return 'instructor';
  return 'student';
}

// Decode a Google ID token (JWT) to extract the email and name.
// The ID token is a base64-encoded JWT; we decode the payload (middle segment).
// For full security you'd verify the signature server-side, but for this
// client-only app the worst case is someone sees admin UI (their edits stay local).
function decodeIdToken(idToken) {
  try {
    const payload = idToken.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// Initialize Google Identity Services and render the button.
// Returns true if GIS loaded and rendered, false if Client ID is placeholder.
export function initGoogleButton(elementId, onLogin, onError) {
  if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
    return false; // not configured yet
  }
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    onError && onError('Google script not loaded yet. Try again in a moment.');
    return false;
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      const payload = decodeIdToken(response.credential);
      if (!payload || !payload.email) {
        onError && onError('Could not read your Google account.');
        return;
      }
      const email = payload.email.toLowerCase();
      const name = payload.name || payload.given_name || email.split('@')[0];
      const role = roleForEmail(email);
      if (CLOSED_COHORT && role === 'student') {
        onError && onError('This cohort is private. Contact your instructor for access.');
        return;
      }
      onLogin({ name, email, role });
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });
  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    { theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'pill' }
  );
  return true;
}

// --- Password fallback (for admin/instructor who prefer passwords) ---

const ADMIN_PASSWORD_HASH = 'bc7347cf8c0cd8d16292374b95d8ffbaf4243f029301698766b5970c8b80bb5f';
const INSTRUCTOR_PASSWORD_HASH = '7cf5db755289c205961624a7493ff81bec70fb040986d5418a418a72b555682e';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Password-based auth. If a password is provided, it MUST match admin or instructor
// (no fallthrough to student). If no password, it's a student (name only).
export async function authenticate(name, password) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return null;

  if (password) {
    const hash = await sha256(password);
    if (hash === ADMIN_PASSWORD_HASH) return { role: 'admin', name: trimmedName };
    if (hash === INSTRUCTOR_PASSWORD_HASH) return { role: 'instructor', name: trimmedName };
    // Wrong password — REJECT, do not fall through to student.
    return null;
  }
  // No password — student login (name only). Note: this is the legacy fallback
  // and is less secure than Google login. Prefer Google login for real auth.
  return { role: 'student', name: trimmedName };
}
