import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ' +
    'transition-[background,border-color,transform,opacity] active:translate-y-[0.5px] ' +
    'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-accent-fg shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_1px_2px_rgba(0,0,0,.18)] ' +
          'hover:bg-[color-mix(in_oklab,var(--c-accent)_88%,white)]',
        default:
          'border border-border bg-surface-2 text-text hover:bg-surface-3',
        ghost:
          'text-text-2 hover:bg-surface-2 hover:text-text',
        outline:
          'border border-border bg-transparent hover:bg-surface-2',
        destructive:
          'bg-danger text-white shadow-[0_1px_0_rgba(255,255,255,.18)_inset,0_1px_2px_rgba(0,0,0,.18)] ' +
          'hover:opacity-90',
        link:
          'text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-[12.5px]',
        md: 'h-9 px-4',
        lg: 'h-10 px-5 text-[15px]',
        icon: 'size-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {loading ? (
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
