"use client";

import { useState, useCallback } from "react";
import { generateRecipe, type RecipeInput, type RecipeResponse } from "./ai";
import { classifyError, type AIError, AI_ERROR_MESSAGES } from "./errors";
import { toast, ToastAction } from "~/components/ui/toast";

interface UseRecipeGenerationOptions {
  onSuccess?: (recipe: RecipeResponse) => void;
  onError?: (error: AIError) => void;
  maxRetries?: number;
}

interface UseRecipeGenerationState {
  isLoading: boolean;
  isRetrying: boolean;
  error: AIError | null;
  recipe: RecipeResponse | null;
}

export function useRecipeGeneration(options: UseRecipeGenerationOptions = {}) {
  const { onSuccess, onError, maxRetries = 2 } = options;

  const [state, setState] = useState<UseRecipeGenerationState>({
    isLoading: false,
    isRetrying: false,
    error: null,
    recipe: null,
  });

  const generate = useCallback(
    async (input: RecipeInput): Promise<RecipeResponse | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      let lastError: AIError | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            setState((prev) => ({ ...prev, isRetrying: true }));
            await new Promise((r) => setTimeout(r, 1000 * attempt));
          }

          const recipe = await generateRecipe(input);
          setState({ isLoading: false, isRetrying: false, error: null, recipe });
          onSuccess?.(recipe);
          return recipe;
        } catch (error) {
          lastError = classifyError(error);
          console.error(`[Recipe Generation Attempt ${attempt + 1}]`, lastError);

          if (!lastError.retryable || attempt === maxRetries) {
            break;
          }
        }
      }

      const finalError = lastError!;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        error: finalError,
      }));
      onError?.(finalError);

      const { title, description, actionLabel } = AI_ERROR_MESSAGES[finalError.code];
      toast({
        variant: "destructive",
        title,
        description,
        action: actionLabel
          ? <ToastAction onClick={() => generate(input)}>{actionLabel}</ToastAction>
          : undefined,
      });

      return null;
    },
    [maxRetries, onSuccess, onError]
  );

  const retry = useCallback(() => {
    if (state.error && state.error.retryable) {
      // The last input would need to be stored for true retry
      // For now, just clear error so user can resubmit
      setState((prev) => ({ ...prev, error: null }));
    }
  }, [state.error]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    generate,
    retry,
    clearError,
  };
}