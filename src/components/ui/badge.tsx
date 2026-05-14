import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium tracking-[0.01em]',
  {
    variants: {
      tone: {
        neutral:  'bg-surface-3 text-text-2',
        info:     'bg-info-2 text-accent',
        success:  'bg-success-2 text-success',
        warn:     'bg-warn-2 text-warn',
        danger:   'bg-danger-2 text-danger',
        outline:  'border border-border bg-transparent text-text-2',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
