'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-")]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover hover:border-primary cursor-pointer hover:shadow-md',

        outline:
          'border-border bg-card text-foreground hover:border-primary/30 hover:bg-muted/40 hover:text-foreground',

        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',

        ghost: 'text-foreground hover:bg-muted hover:text-foreground',

        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md',

        link: 'text-primary underline-offset-4 hover:underline',
      },

      size: {
        default: 'h-10 gap-2 px-4',

        xs: 'h-7 gap-1 rounded-lg px-2 text-xs',

        sm: 'h-9 gap-1.5 rounded-lg px-3',

        lg: 'h-11 gap-2 px-5 text-base',

        icon: 'size-10 rounded-xl',

        'icon-xs': 'size-7 rounded-lg',

        'icon-sm': 'size-9 rounded-lg',

        'icon-lg': 'size-11 rounded-xl',
      },
    },

    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
