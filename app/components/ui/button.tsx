import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/cn";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] focus-ring",
  {
    variants: {
      variant: {
        // Using explicit hex values to ensure Tailwind generates the utilities
        default: "bg-[#5B8A5B] text-[#FFFDF7] hover:bg-[#3D6B3D]",
        outline: "border-[#E8E6E0] bg-[#FFFDF7] text-[#1A1A16] hover:bg-[#5B8A5B]/5 hover:border-[#5B8A5B] hover:text-[#5B8A5B]",
        secondary: "bg-[#E8E6E0] text-[#1A1A16] hover:bg-[#5B8A5B]/10 hover:text-[#5B8A5B] border-transparent",
        ghost: "bg-transparent hover:bg-[#E8E6E0] text-[#1A1A16]",
        destructive: "bg-[#B84A3A] text-[#FFFDF7] hover:bg-[#B84A3A]/90",
        link: "text-[#5B8A5B] underline-offset-2 hover:underline",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };