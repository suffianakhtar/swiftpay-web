import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Right-anchored drawer / side panel.
 *  Built on Radix Dialog so we get focus trap + Esc + scroll lock for free. */
export const Drawer        = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose   = DialogPrimitive.Close;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: 'right' | 'left';
    width?: number;
    hideClose?: boolean;
  }
>(({ className, children, side = 'right', width = 440, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-[fade-in_0.2s_ease-out]" />
    <DialogPrimitive.Content
      ref={ref}
      style={{ width }}
      className={cn(
        'fixed inset-y-0 z-50 flex flex-col bg-surface shadow-[-12px_0_32px_rgba(0,0,0,.25)]',
        side === 'right' ? 'right-0 border-l border-border' : 'left-0 border-r border-border',
        'data-[state=open]:animate-[fade-in_0.22s_ease-out]',
        'focus:outline-none',
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className="absolute right-3 top-3 rounded-md p-1.5 text-text-3 hover:bg-surface-2 hover:text-text"
          aria-label="Close"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

export const DrawerDescription = DialogPrimitive.Description;
