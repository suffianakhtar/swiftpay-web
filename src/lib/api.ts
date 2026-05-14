import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { env } from './env';
import { authHeader, clearSession, isSessionLive } from './auth';
import { uuid } from './utils';

/** Domain error shape returned by the SwiftPay Spring Boot service. */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
}

/** Convenience type for callers — the axios error narrowed to ApiError. */
export type ApiAxiosError = AxiosError<ApiError>;

/** Single shared axios instance.
 *  - baseURL points at /api/v1 (Vite dev proxy handles same-origin in dev)
 *  - Authorization header is injected from local auth state
 *  - X-Correlation-Id stamped per request so backend logs line up with UI sessions
 *  - 401 → session clear + redirect to /login (the AuthContext picks it up) */
export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl.replace(/\/$/, '') + '/api/v1',
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

// --- Request interceptor -----------------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Authorization
  const auth = authHeader();
  if (auth && !config.headers.has('Authorization')) {
    config.headers.set('Authorization', auth);
  }
  // Correlation ID — backend logs use this to thread the call across services
  if (!config.headers.has('X-Correlation-Id')) {
    config.headers.set('X-Correlation-Id', uuid());
  }
  // POST /rtp requires Idempotency-Key. Most callers set this explicitly, but
  // if a caller forgot, generate one automatically so the request never fails
  // the backend's @NotBlank validation.
  if (
    config.method?.toLowerCase() === 'post' &&
    /\/rtp(\/|$)/.test(config.url ?? '') &&
    !config.headers.has('Idempotency-Key')
  ) {
    config.headers.set('Idempotency-Key', uuid());
  }
  return config;
});

// --- Response interceptor ----------------------------------------------------
let onUnauthorized: (() => void) | null = null;
export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error: ApiAxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      clearSession();
      onUnauthorized?.();
    } else if (status === 503) {
      toast.error('Raast upstream is temporarily unavailable. Try again in a moment.');
    } else if (status && status >= 500) {
      toast.error(error.response?.data?.message ?? 'Something went wrong on our side.');
    }
    return Promise.reject(error);
  },
);

/** Tiny guard for callers. */
export function isLoggedIn(): boolean {
  return isSessionLive();
}
