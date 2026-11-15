"use client";

import { useState, type FormEvent } from "react";
import { Form } from "react-router";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Loader2, ChefHat } from "lucide-react";
import { useRecipeGeneration } from "~/lib/llm/useRecipeGeneration";
import { RecipeErrorDisplay } from "~/components/recipe-error-display";
import type { RecipeResponse } from "~/lib/llm/response";

interface RecipeGeneratorProps {
  onRecipeGenerated?: (recipe: RecipeResponse) => void;
}

export function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const [items, setItems] = useState("");
  const [servings, setServings] = useState(1);

  const { isLoading, isRetrying, error, recipe, generate, clearError } =
    useRecipeGeneration({
      onSuccess: (recipe) => onRecipeGenerated?.(recipe),
      maxRetries: 2,
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!items.trim()) return;
    clearError();
    await generate({ items: items.trim(), servings: Math.max(1, servings) });
  };

  const handleRetry = () => {
    if (items.trim()) {
      generate({ items: items.trim(), servings: Math.max(1, servings) });
    }
  };

  return (
    <div className="space-y-6">
      <Form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="items">What do you have in your fridge?</Label>
          <Textarea
            id="items"
            placeholder="e.g., 3 eggs, half an onion, tomato, cheddar, spinach..."
            value={items}
            onChange={(e) => setItems(e.target.value)}
            disabled={isLoading}
            rows={3}
            aria-describedby={error ? "error-message" : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servings">Number of servings</Label>
          <Input
            id="servings"
            type="number"
            min="1"
            max="20"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
            disabled={isLoading}
            className="w-24"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !items.trim()}
          className="w-full gap-2"
          aria-busy={isLoading}
        >
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {!isLoading && <ChefHat className="h-4 w-4" aria-hidden="true" />}
          {isLoading ? (isRetrying ? "Retrying…" : "Generating…") : "Generate Recipe"}
        </Button>
      </Form>

      <RecipeErrorDisplay
        error={error}
        onRetry={handleRetry}
        onDismiss={clearError}
        compact
      />

      {recipe && recipe.status === "ok" && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            Recipe generated successfully! <code>{recipe.recipe.title}</code>
          </p>
        </div>
      )}
    </div>
  );
}