import * as React from "react";
import { cn } from "~/lib/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border-mist bg-background px-4 py-2 text-base text-charcoal placeholder:text-muted-foreground transition-colors duration-150 outline-none",
        "focus-ring",
        "disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted",
        "aria-invalid:border-rust aria-invalid:ring-2 aria-invalid:ring-rust",
        className
      )}
      {...props}
    />
  );
}

export { Input };