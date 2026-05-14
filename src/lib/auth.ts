/** Auth token storage + helpers.
 *  Note: in production-grade scaffolds, prefer httpOnly cookies set by the
 *  backend over localStorage tokens. This module is a starting point that
 *  matches the existing /api/v1/auth/token (JWT) flow. */

const ACCESS_KEY  = 'sp.accessToken';
const EXPIRES_KEY = 'sp.expiresAt';

export interface AuthSession {
  accessToken: string;
  /** Epoch ms when the token expires. */
  expiresAt: number;
}

export function getSession(): AuthSession | null {
  const accessToken = localStorage.getItem(ACCESS_KEY);
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) ?? 0);
  if (!accessToken || !expiresAt) return null;
  return { accessToken, expiresAt };
}

export function setSession(s: AuthSession) {
  localStorage.setItem(ACCESS_KEY, s.accessToken);
  localStorage.setItem(EXPIRES_KEY, String(s.expiresAt));
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

/** True if we have a session that's still valid (with 30s buffer). */
export function isSessionLive(): boolean {
  const s = getSession();
  if (!s) return false;
  return s.expiresAt - Date.now() > 30_000;
}

/** Build an Authorization header value, or null if no live session. */
export function authHeader(): string | null {
  const s = getSession();
  if (!s) return null;
  return `Bearer ${s.accessToken}`;
}
