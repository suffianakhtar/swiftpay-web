import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text',
        'placeholder:text-text-3 outline-none transition-[border-color,box-shadow]',
        'focus:border-accent focus:shadow-[var(--ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex w-full min-h-[80px] rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text',
        'placeholder:text-text-3 outline-none transition-[border-color,box-shadow]',
        'focus:border-accent focus:shadow-[var(--ring)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
