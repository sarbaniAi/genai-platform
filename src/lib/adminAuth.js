// Admin authentication via hashed password.
// The password is never stored in plaintext — only its SHA-256 hash is in the code.
// Verify by hashing the user's input and comparing.

const ADMIN_PASSWORD_HASH = 'bc7347cf8c0cd8d16292374b95d8ffbaf4243f029301698766b5970c8b80bb5f';
const SESSION_KEY = 'genai_admin_unlocked';

export function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function lockAdmin() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

export async function verifyAdminPassword(password) {
  try {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === ADMIN_PASSWORD_HASH;
  } catch {
    return false;
  }
}

export async function unlockAdmin(password) {
  const ok = await verifyAdminPassword(password);
  if (ok) {
    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {}
  }
  return ok;
}
