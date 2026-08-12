import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Layout
        'flex h-11 w-full rounded-lg px-4 py-2.5',

        // Surface
        'border-input bg-card text-foreground border',

        // Typography
        'placeholder:text-muted-foreground text-sm font-medium',

        // Transitions
        'transition-all duration-200',

        // Hover
        'hover:border-primary/40 hover:bg-muted/20',

        // Focus
        'focus:border-primary focus:ring-primary outline-none focus:ring-2',

        // Keyboard focus
        'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-2',

        // Disabled
        'disabled:bg-muted disabled:cursor-not-allowed disabled:opacity-50',

        // Validation
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:ring-2',

        // File input
        'file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium',

        className,
      )}
      {...props}
    />
  );
}

export { Input };
