'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function Label({
  className,
  required,
  ...props
}: React.ComponentProps<'label'> & {
  required?: boolean;
}) {
  return (
    <label
      data-slot="label"
      className={cn(
        // Layout
        'flex items-center gap-1.5',

        // Typography
        'text-sm leading-none font-medium',

        // Theme colors
        'text-foreground',

        // Accessibility & interaction
        'transition-colors duration-200 select-none',

        // Disabled states
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',

        // Validation states
        'peer-aria-invalid:text-destructive',

        className,
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export { Label };
