import { Form } from "react-router";
import { useNavigation } from "react-router";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/cn";

export default function ItemForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post" action="" className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="items" className="text-sm font-medium text-charcoal">
          What&apos;s in your fridge?
        </Label>
        <Textarea
          id="items"
          name="items"
          placeholder="e.g., 3 eggs, half an onion, tomato, cheddar, spinach..."
          required
          rows={4}
          disabled={isSubmitting}
          aria-describedby="items-hint"
        />
        <p id="items-hint" className="text-xs text-muted-foreground">
          Separate with commas or new lines. Amounts help but aren&apos;t required.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="servings" className="text-sm font-medium text-charcoal">
          Servings
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="servings"
            name="servings"
            type="number"
            min="1"
            max="20"
            defaultValue={1}
            required
            disabled={isSubmitting}
            className="w-20 text-center text-lg font-mono"
            aria-label="Number of servings"
          />
          <span className="text-muted-foreground text-sm">people</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="xl"
        className={cn(
          "w-full gap-2 justify-center py-3",
          isSubmitting && "bg-muted text-muted-foreground"
        )}
      >
        {isSubmitting && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            <span>Finding your recipe…</span>
          </>
        )}
        {!isSubmitting && (
          <span>Generate Recipe</span>
        )}
      </Button>
    </Form>
  );
}