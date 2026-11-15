import { cn } from "~/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-ring",
  {
    variants: {
      variant: {
        default: "bg-sage text-cream",
        secondary: "bg-muted text-charcoal border-mist",
        destructive: "bg-rust text-cream",
        outline: "text-charcoal border-mist bg-background",
        success: "bg-sage/10 text-sage border-sage/20",
        warning: "bg-honey/10 text-charcoal border-honey/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}