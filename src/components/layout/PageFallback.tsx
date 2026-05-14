import { Loader2 } from 'lucide-react';

/** Lightweight fallback shown while a lazy-loaded route is in flight. */
export function PageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center text-text-3">
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
