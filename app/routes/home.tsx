import ItemForm from "~/components/itemform";
import { useActionData, useNavigation, useSubmit } from "react-router";
import type { Route } from "./+types/home";
import { generateRecipe } from "~/lib/llm/ai";
import { classifyError, type AIError, AI_ERROR_MESSAGES } from "~/lib/llm/errors";
import { RecipeDisplay } from "~/components/recipe-display";
import type { RecipeResponse } from "~/lib/llm/response";

type ActionData =
	| { status: "success"; recipe: RecipeResponse }
	| { status: "error"; error: AIError }
	| { status: "error"; message: string };

export function meta() {
	return [
		{ title: "Fridge to Recipe" },
		{ name: "description", content: "Turn your fridge ingredients into a recipe." },
	];
}

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData();
	const items = formData.get("items")?.toString().trim() || "";
	const servings = Number(formData.get("servings"));

	if (!items) {
		return { status: "error", message: "Please enter some ingredients" } as const;
	}

	if (!servings || servings < 1) {
		return { status: "error", message: "Please enter a valid number of servings" } as const;
	}

	try {
		const recipe = await generateRecipe({ items, servings });
		return { status: "success", recipe } as const;
	} catch (error) {
		const aiError = classifyError(error);
		return { status: "error", error: aiError } as const;
	}
};

export default function Home() {
	const actionData = useActionData<ActionData>();
	const navigation = useNavigation();
	const submit = useSubmit();
	const isSubmitting = navigation.state === "submitting";

	const handleRetry = () => {
		submit(null, { method: "post", action: "" });
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Hero header — centered, minimal */}
			<header className="container mx-auto max-w-[720px] px-[1.5rem] py-10 pt-16 text-center">
				<h1 className="text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-charcoal">
					Fridge to Recipe
				</h1>
				<p className="mt-3 text-lg text-muted-foreground max-w-[50ch] mx-auto">
					List what you have. Get a recipe you can actually cook.
				</p>
			</header>

			{/* Form section */}
			<section className="container mx-auto max-w-[720px] px-[1.5rem] pb-6">
				<ItemForm />
			</section>

			{/* Results */}
			<main aria-live="polite">
				{actionData && (
					<>
						{actionData.status === "success" && (
							<RecipeDisplay
								recipe={actionData.recipe}
								isLoading={false}
								error={null}
								onRetry={handleRetry}
							/>
						)}
						{actionData.status === "error" && "error" in actionData && actionData.error && (
							<RecipeDisplay
								recipe={null}
								isLoading={false}
								error={actionData.error}
								onRetry={handleRetry}
							/>
						)}
						{actionData.status === "error" && "message" in actionData && !("error" in actionData) && (
							<RecipeDisplay
								recipe={null}
								isLoading={false}
								error={new Error(actionData.message)}
								onRetry={handleRetry}
							/>
						)}
					</>
				)}

				{isSubmitting && !actionData && (
					<RecipeDisplay
						recipe={null}
						isLoading={true}
						error={null}
					/>
				)}

				{!actionData && !isSubmitting && (
					<div className="container mx-auto max-w-[720px] px-[1.5rem] py-16 text-center">
						<svg className="mx-auto mb-6 w-20 h-20 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
							<path d="M12 2L2 7l10 5 10-5-10-5z" />
							<path d="M2 17l10 5 10-5" />
							<path d="M2 12l10 5 10-5" />
						</svg>
						<h2 className="text-xl font-semibold text-charcoal mb-2">Ready when you are</h2>
						<p className="text-muted-foreground">Enter ingredients above and click Generate</p>
					</div>
				)}
			</main>
		</div>
	);
}