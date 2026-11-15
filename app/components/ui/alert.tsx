import { cn } from "~/lib/cn";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import * as React from "react";

const iconMap = {
  default: Info,
  destructive: AlertTriangle,
  success: CheckCircle,
  warning: AlertTriangle,
} as const;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
}

export function Alert({
  className,
  variant = "default",
  children,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant];
  const variantStyles = {
    default: "bg-muted text-charcoal border-mist",
    destructive: "bg-rust/10 text-rust border-rust/30",
    success: "bg-sage/10 text-sage border-sage/30",
    warning: "bg-honey/10 text-charcoal border-honey/30",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border p-4 [&>svg~*]:pl-10 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current",
        variantStyles[variant],
        className
      )}
      role="alert"
      {...props}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <div className="grid gap-1 [&>p]:leading-normal">{children}</div>
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("font-semibold leading-none text-base mb-1", className)} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn("text-sm [&_p]:leading-normal", className)} {...props}>
      {children}
    </div>
  );
}