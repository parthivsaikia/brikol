"use client";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { RefreshCw, AlertTriangle, X } from "lucide-react";
import type { AIError } from "~/lib/llm/errors";
import { AI_ERROR_MESSAGES } from "~/lib/llm/errors";

interface RecipeErrorDisplayProps {
  error: AIError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

export function RecipeErrorDisplay({
  error,
  onRetry,
  onDismiss,
  compact = false,
}: RecipeErrorDisplayProps) {
  if (!error) return null;

  const { title, description, actionLabel } = AI_ERROR_MESSAGES[error.code];
  const isRetryable = error.retryable && onRetry;

  return (
    <Alert
      variant="destructive"
      className={compact ? "mb-4" : "mb-6"}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <AlertTitle className={compact ? "text-sm" : undefined}>
            {title}
          </AlertTitle>
          <AlertDescription className={compact ? "text-xs" : undefined}>
            {description}
            {error.validationIssues && error.validationIssues.length > 0 && (
              <ul className="mt-2 list-disc list-inside text-xs space-y-1">
                {error.validationIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
            {process.env.NODE_ENV === "development" && error.rawResponse && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer text-foreground/60">
                  Raw response (debug)
                </summary>
                <pre className="mt-1 p-2 text-xs bg-muted rounded overflow-auto max-h-40">
                  {error.rawResponse.slice(0, 2000)}
                </pre>
              </details>
            )}
          </AlertDescription>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {isRetryable && (
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={onRetry}
              disabled={error.code === "RATE_LIMITED"}
              className="gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {actionLabel || "Retry"}
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size={compact ? "icon-sm" : "icon"}
              onClick={onDismiss}
              aria-label="Dismiss error"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

interface RecipeErrorBannerProps {
  error: AIError | null;
  onRetry?: () => void;
}

export function RecipeErrorBanner({ error, onRetry }: RecipeErrorBannerProps) {
  if (!error) return null;

  const { title, description, actionLabel } = AI_ERROR_MESSAGES[error.code];

  return (
    <Alert variant="destructive" className="mb-4" role="alert">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </div>
        {error.retryable && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="gap-1 shrink-0">
            <RefreshCw className="h-4 w-4" />
            {actionLabel || "Retry"}
          </Button>
        )}
      </div>
    </Alert>
  );
}