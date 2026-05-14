import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware class merge. Use throughout instead of template strings. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in PKR. Compact = "Rs 1.2M". */
export function fmtPKR(
  n: number,
  opts: { compact?: boolean; sign?: boolean } = {},
): string {
  const num = Math.abs(n);
  let s: string;
  if (opts.compact && num >= 1_000_000) {
    s = (num / 1_000_000).toFixed(num >= 10_000_000 ? 1 : 2) + 'M';
  } else if (opts.compact && num >= 1_000) {
    s = (num / 1_000).toFixed(num >= 10_000 ? 1 : 2) + 'K';
  } else {
    s = num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  const prefix = opts.sign ? (n < 0 ? '−' : '+') : '';
  return `${prefix}Rs ${s}`;
}

/** Relative-time string e.g. "3h ago", "2d ago", or a date for older items. */
export function relTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)        return `${Math.floor(diff)}s ago`;
  if (diff < 3600)      return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)     return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

/** Mask a mobile number: "0300-XXX-1234" → "0300-XXX-1234" (already masked). */
export function maskMobile(m: string): string {
  if (!m) return m;
  const clean = m.replace(/\D/g, '');
  if (clean.length < 6) return m;
  return `${clean.slice(0, 4)}-XXX-${clean.slice(-4)}`;
}

/** Mask an IBAN: "PK36HABB0001234567890123" → "PK36••••0123" */
export function maskIban(i: string): string {
  if (!i || i.length < 10) return i;
  return `${i.slice(0, 4)}••••${i.slice(-4)}`;
}

/** Random UUIDv4 (used for Idempotency-Key generation). */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback (RFC4122 v4-ish, good enough for client-side keys)
  const r = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${r()}-${r().slice(0, 4)}-4${r().slice(0, 3)}-${r().slice(0, 4)}-${r()}${r().slice(0, 4)}`;
}
