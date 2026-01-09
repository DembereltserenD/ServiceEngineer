import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring active:scale-[0.98] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:from-primary/95 hover:to-primary/85 hover:-translate-y-0.5 active:shadow-sm active:translate-y-0",
        destructive:
          "bg-gradient-to-r from-destructive to-destructive/90 text-white shadow-md hover:shadow-lg hover:from-destructive/95 hover:to-destructive/85 hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 focus-visible:ring-destructive/50 dark:from-destructive/80 dark:to-destructive/70",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent hover:shadow-md hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 dark:bg-input/20 dark:border-input dark:hover:bg-input/40",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md hover:-translate-y-0.5 active:shadow-sm active:translate-y-0",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:shadow-sm dark:hover:bg-accent/50 active:bg-accent/80",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/70",
        success:
          "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 focus-visible:ring-emerald-500/50",
        warning:
          "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md hover:shadow-lg hover:from-amber-600 hover:to-amber-700 hover:-translate-y-0.5 active:shadow-sm active:translate-y-0 focus-visible:ring-amber-500/50",
      },
      size: {
        default: "h-10 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        xl: "h-14 rounded-xl px-10 text-lg has-[>svg]:px-8",
        icon: "size-10 rounded-lg",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
