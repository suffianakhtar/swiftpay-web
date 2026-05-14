import { cn } from '@/lib/utils';

interface AvatarProps {
  name?: string | null;
  size?: number;
  tone?: string;
  className?: string;
}

/** Initials-only avatar with optional accent tone. */
export function Avatar({ name, size = 32, tone, className }: AvatarProps) {
  const initials = (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-border font-semibold',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: tone ? `color-mix(in oklab, ${tone} 22%, var(--c-surface-2))` : 'var(--c-surface-2)',
        color: tone ?? 'var(--c-text-2)',
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
