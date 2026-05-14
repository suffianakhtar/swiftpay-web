import { cn } from '@/lib/utils';

interface WordmarkProps {
  size?: number;
  hideText?: boolean;
  className?: string;
}

/** SwiftPay logo + wordmark. Accent colour comes from CSS theme vars,
 *  so it tracks user theme + accent swaps automatically. */
export function Wordmark({ size = 22, hideText, className }: WordmarkProps) {
  return (
    <div className={cn('flex items-center', className)} style={{ gap: size * 0.42 }}>
      <div
        className="grid place-items-center bg-accent shrink-0 shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_1px_2px_rgba(0,0,0,.15)]"
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
        >
          <path
            d="M3.5 13.2 7 9.7l2.5 2.5L16.5 5.2M16.5 5.2H11M16.5 5.2v5.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {!hideText && (
        <span
          className="font-semibold text-text leading-none"
          style={{ fontSize: size * 0.78, letterSpacing: '-0.022em' }}
        >
          Swift<span className="text-accent">Pay</span>
        </span>
      )}
    </div>
  );
}
