import { cn } from "~/lib/cn";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "field-sizing-content min-h-[120px] w-full rounded-xl border-mist bg-background px-4 py-3 text-base text-charcoal placeholder:text-muted-foreground transition-colors duration-150 outline-none resize-y",
        "focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        "aria-invalid:border-rust aria-invalid:ring-2 aria-invalid:ring-rust",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };