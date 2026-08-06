// Google Identity Services (GIS) integration for real Google login.

export const GOOGLE_CLIENT_ID = '983338411144-2rdlrfl467pncud86e4fddm1ql5m03gr.apps.googleusercontent.com';

export const ADMIN_EMAILS = [
  'sarbaniiitb2020@gmail.com'
];
export const INSTRUCTOR_EMAILS = [
  'sarbaniiitb2020@gmail.com'
];

export const CLOSED_COHORT = false;

const SESSION_KEY = 'genai_session';

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setSession(session) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
}
export function clearSession() { try { sessionStorage.removeItem(SESSION_KEY); } catch {} }
export function getCurrentRole() { const s = getSession(); return s ? s.role : null; }
export function getCurrentName() { const s = getSession(); return s ? s.name : null; }
export function hasSession() { return getSession() !== null; }
export function startSession(name, email, role) {
  setSession({ name, email, role, startedAt: new Date().toISOString() });
}

function roleForEmail(email) {
  const e = (email || '').toLowerCase();
  if (ADMIN_EMAILS.includes(e)) return 'admin';
  if (INSTRUCTOR_EMAILS.includes(e)) return 'instructor';
  return 'student';
}

function decodeIdToken(idToken) {
  try {
    const payload = idToken.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch { return null; }
}

function waitForGoogle(maxWaitMs) {
  const max = maxWaitMs || 5000;
  return new Promise((resolve) => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      resolve(true); return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(interval); resolve(true);
      } else if (Date.now() - start > max) {
        clearInterval(interval); resolve(false);
      }
    }, 100);
  });
}

// Initialize GIS and render the button into a DOM element (not an ID).
// The element must be created and owned by the caller (not React) to avoid reconciliation conflicts.
export async function initGoogleButtonInto(element, onLogin, onError) {
  if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
    onError && onError('Google login not configured.');
    return false;
  }
  if (!element) { onError && onError('No container for Google button.'); return false; }

  const ready = await waitForGoogle();
  if (!ready) {
    onError && onError('Google sign-in script could not load. Check your network or try again.');
    return false;
  }

  try {
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
      cancel_on_tap_outside: false,
    });
    window.google.accounts.id.renderButton(element, {
      theme: 'outline', size: 'large', width: 320, text: 'continue_with', shape: 'pill'
    });
    setTimeout(() => {
      if (element.children.length === 0) {
        onError && onError('Google sign-in blocked. Add the site URL to Authorized JavaScript origins in Google Cloud Console.');
      }
    }, 1500);
    return true;
  } catch (e) {
    onError && onError('Google sign-in failed: ' + (e.message || 'unknown error'));
    return false;
  }
}

// --- Password fallback ---

const ADMIN_PASSWORD_HASH = 'bc7347cf8c0cd8d16292374b95d8ffbaf4243f029301698766b5970c8b80bb5f';
const INSTRUCTOR_PASSWORD_HASH = '7cf5db755289c205961624a7493ff81bec70fb040986d5418a418a72b555682e';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function authenticate(name, password) {
  const trimmedName = (name || '').trim();
  if (!trimmedName) return null;
  if (password) {
    const hash = await sha256(password);
    if (hash === ADMIN_PASSWORD_HASH) return { role: 'admin', name: trimmedName };
    if (hash === INSTRUCTOR_PASSWORD_HASH) return { role: 'instructor', name: trimmedName };
    return null;
  }
  return { role: 'student', name: trimmedName };
}
