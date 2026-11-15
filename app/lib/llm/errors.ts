export type AIErrorCode =
  | "PARSE_ERROR"
  | "VALIDATION_ERROR"
  | "SERVINGS_MISMATCH"
  | "RATE_LIMITED"
  | "AUTH_ERROR"
  | "MODEL_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNKNOWN_ERROR";

export interface AIError extends Error {
  code: AIErrorCode;
  retryable: boolean;
  statusCode?: number;
  rawResponse?: string;
  validationIssues?: string[];
}

export function createAIError(
  message: string,
  code: AIErrorCode,
  options: {
    retryable?: boolean;
    statusCode?: number;
    rawResponse?: string;
    validationIssues?: string[];
    cause?: Error;
  } = {}
): AIError {
  const error = new Error(message) as AIError;
  error.code = code;
  error.retryable = options.retryable ?? isRetryableCode(code);
  error.statusCode = options.statusCode;
  error.rawResponse = options.rawResponse;
  error.validationIssues = options.validationIssues;
  if (options.cause) error.cause = options.cause;
  return error;
}

function isRetryableCode(code: AIErrorCode): boolean {
  return [
    "RATE_LIMITED",
    "MODEL_UNAVAILABLE",
    "NETWORK_ERROR",
    "TIMEOUT",
  ].includes(code);
}

export function classifyError(error: unknown, rawResponse?: string): AIError {
  if (error instanceof Error && "code" in error && "retryable" in error) {
    return error as AIError;
  }

  if (error instanceof SyntaxError || (error instanceof Error && error.message.includes("JSON"))) {
    return createAIError("Failed to parse AI response as JSON", "PARSE_ERROR", {
      retryable: false,
      rawResponse,
    });
  }

  if (error instanceof Error && error.message.includes("Zod")) {
    return createAIError("AI response failed validation", "VALIDATION_ERROR", {
      retryable: false,
      rawResponse,
      validationIssues: [error.message],
    });
  }

  if (error instanceof Error && error.message.includes("servings")) {
    return createAIError(error.message, "SERVINGS_MISMATCH", {
      retryable: true,
      rawResponse,
    });
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("429")) {
      return createAIError("Rate limited by AI provider", "RATE_LIMITED", {
        retryable: true,
        statusCode: 429,
        cause: error,
      });
    }
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("api key")) {
      return createAIError("Invalid or missing API key", "AUTH_ERROR", {
        retryable: false,
        statusCode: 401,
        cause: error,
      });
    }
    if (msg.includes("model") && (msg.includes("unavailable") || msg.includes("overloaded"))) {
      return createAIError("AI model temporarily unavailable", "MODEL_UNAVAILABLE", {
        retryable: true,
        statusCode: 503,
        cause: error,
      });
    }
    if (msg.includes("network") || msg.includes("fetch") || msg.includes("connection")) {
      return createAIError("Network error contacting AI provider", "NETWORK_ERROR", {
        retryable: true,
        cause: error,
      });
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return createAIError("Request to AI provider timed out", "TIMEOUT", {
        retryable: true,
        cause: error,
      });
    }
  }

  return createAIError(
    error instanceof Error ? error.message : "Unknown AI error",
    "UNKNOWN_ERROR",
    { rawResponse, cause: error instanceof Error ? error : undefined }
  );
}

export const AI_ERROR_MESSAGES: Record<AIErrorCode, {
  title: string;
  description: string;
  actionLabel?: string;
}> = {
  PARSE_ERROR: {
    title: "Invalid response format",
    description: "The AI returned an unexpected format. Please try again.",
  },
  VALIDATION_ERROR: {
    title: "Invalid recipe structure",
    description: "The AI response didn't match the expected recipe format.",
  },
  SERVINGS_MISMATCH: {
    title: "Serving size mismatch",
    description: "The recipe doesn't match your requested servings. Retrying...",
    actionLabel: "Retry",
  },
  RATE_LIMITED: {
    title: "Too many requests",
    description: "Please wait a moment before generating another recipe.",
    actionLabel: "Retry",
  },
  AUTH_ERROR: {
    title: "Authentication failed",
    description: "AI service credentials are invalid. Contact support.",
  },
  MODEL_UNAVAILABLE: {
    title: "Service temporarily unavailable",
    description: "The AI model is currently overloaded. Please try again shortly.",
    actionLabel: "Retry",
  },
  NETWORK_ERROR: {
    title: "Connection failed",
    description: "Unable to reach the AI service. Check your connection.",
    actionLabel: "Retry",
  },
  TIMEOUT: {
    title: "Request timed out",
    description: "The AI took too long to respond. Please try again.",
    actionLabel: "Retry",
  },
  UNKNOWN_ERROR: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    actionLabel: "Retry",
  },
};