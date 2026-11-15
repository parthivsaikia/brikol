"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/cn";
import type { RecipeResponse, OkResponse } from "~/lib/llm/response";
import { ChevronDown, Clock, Users, Loader2, RefreshCw, AlertTriangle, Sparkles, Minus, Plus } from "lucide-react";

interface RecipeDisplayProps {
	recipe: RecipeResponse | null;
	isLoading: boolean;
	error: Error | null;
	onRetry?: () => void;
}

export function RecipeDisplay({ recipe, isLoading, error, onRetry }: RecipeDisplayProps) {
	const [scaledServings, setScaledServings] = useState(1);
	const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
	const [expandedIngredients, setExpandedIngredients] = useState<Set<string>>(new Set());
	const [isMounted, setIsMounted] = useState(false);
	const recipeRef = useRef(recipe);

	useEffect(() => { recipeRef.current = recipe; }, [recipe]);

	useEffect(() => { setIsMounted(true); }, []);

	useEffect(() => {
		if (recipe?.status === "ok") {
			setScaledServings(recipe.recipe.servings);
			setCheckedSteps(new Set());
		}
	}, [recipe]);

	const scaleFactor = recipe?.status === "ok" ? scaledServings / recipe.recipe.servings : 1;

	const formatQuantity = (quantity: number | null, unit: string | null) => {
		if (quantity === null) return "to taste";
		const scaled = Math.round(quantity * scaleFactor * 100) / 100;
		return unit ? `${scaled} ${unit}` : String(scaled);
	};

	const toggleStep = (stepId: string) => {
		setCheckedSteps((prev) => {
			const next = new Set(prev);
			next.has(stepId) ? next.delete(stepId) : next.add(stepId);
			return next;
		});
	};

	const toggleIngredient = (ingredientId: string) => {
		setExpandedIngredients((prev) => {
			const next = new Set(prev);
			next.has(ingredientId) ? next.delete(ingredientId) : next.add(ingredientId);
			return next;
		});
	};

	const incrementServings = () => setScaledServings((s) => Math.min(s + 1, 20));
	const decrementServings = () => setScaledServings((s) => Math.max(s - 1, 1));

	const progress = recipe?.status === "ok" && recipe.recipe.steps.length > 0
		? (checkedSteps.size / recipe.recipe.steps.length) * 100
		: 0;

	if (isLoading) return <LoadingState />;
	if (error) return <ErrorState error={error} onRetry={onRetry} isMounted={isMounted} />;
	if (!recipe) return <EmptyState isMounted={isMounted} />;
	if (recipe.status === "cannot_make") return <CannotMakeState recipe={recipe} onRetry={onRetry} isMounted={isMounted} />;

	return (
		<>
			{/* Progress bar — fixed at top */}
			<div className="progress-bar" aria-hidden="true">
				<div style={{ transform: `scaleX(${progress / 100})`, borderRadius: '9999px' }} />
			</div>

			<article className="container mx-auto max-w-[880px] px-[1.5rem] pb-16 pt-6">
				{/* Hero — bleeds edges on mobile */}
				<header className="hero-bleed animate-hero mb-8">
					<h1 className="text-[clamp(1.75rem,5vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-charcoal">
						{recipe.recipe.title}
					</h1>
					<p className="mt-2 text-lg text-muted-foreground leading-relaxed max-w-[60ch]">
						{recipe.recipe.description}
					</p>
				</header>

				{/* Meta inline — no badges */}
				<div className="animate-slide-down stagger-1 mb-8 text-sm text-muted-foreground">
					<span>Serves {recipe.recipe.servings}</span>
					<span className="mx-3">·</span>
					<span>{recipe.recipe.prepMinutes} min prep</span>
					<span className="mx-3">·</span>
					<span>{recipe.recipe.cookMinutes} min cook</span>
					<span className="mx-3">·</span>
					<span className="capitalize text-charcoal">{recipe.recipe.difficulty}</span>
				</div>

				{/* Servings Scaler — prominent */}
				<ServingsScaler
					value={scaledServings}
					onIncrement={incrementServings}
					onDecrement={decrementServings}
					original={recipe.recipe.servings}
					className="animate-slide-down stagger-2 mb-10"
				/>

				{/* Desktop: Two-column */}
				<div className="hidden lg:grid lg:grid-cols-[280px_1fr] lg:gap-12 lg:items-start">
					<aside className="lg:sticky lg:top-24 lg:self-start space-y-8 animate-slide-down stagger-3">
						<IngredientsSection
							ingredients={recipe.recipe.ingredients}
							formatQuantity={formatQuantity}
							expandedIngredients={expandedIngredients}
							onToggleIngredient={toggleIngredient}
						/>
					</aside>
					<main className="space-y-8 animate-slide-down stagger-4">
						<StepsSection
							steps={recipe.recipe.steps}
							ingredients={recipe.recipe.ingredients}
							checkedSteps={checkedSteps}
							onToggleStep={toggleStep}
						/>
						{recipe.recipe.tips.length > 0 && (
							<TipsSection tips={recipe.recipe.tips} />
						)}
					</main>
				</div>

				{/* Mobile: Single column */}
				<div className="lg:hidden space-y-10 animate-slide-down stagger-3">
					<IngredientsSection
						ingredients={recipe.recipe.ingredients}
						formatQuantity={formatQuantity}
						expandedIngredients={expandedIngredients}
						onToggleIngredient={toggleIngredient}
					/>
					<StepsSection
						steps={recipe.recipe.steps}
						ingredients={recipe.recipe.ingredients}
						checkedSteps={checkedSteps}
						onToggleStep={toggleStep}
					/>
					{recipe.recipe.tips.length > 0 && (
						<TipsSection tips={recipe.recipe.tips} />
					)}
				</div>
			</article>
		</>
	);
}

function LoadingState() {
	return (
		<div className="container mx-auto max-w-[720px] px-[1.5rem] py-16" role="status" aria-live="polite">
			<div className="flex flex-col items-center gap-6 text-center">
				<div className="relative w-20 h-20">
					<div className="absolute inset-0 border-4 border-mist border-t-sage rounded-full animate-spin" />
					<Sparkles className="absolute inset-0 w-10 h-10 m-auto text-sage animate-pulse" />
				</div>
				<div>
					<p className="text-xl font-semibold text-charcoal">Finding your recipe…</p>
					<p className="text-muted-foreground mt-1">Matching ingredients, balancing flavors</p>
				</div>
			</div>
		</div>
	);
}

function EmptyState({ isMounted }: { isMounted: boolean }) {
	return (
		<div className="container mx-auto max-w-[720px] px-[1.5rem] py-16 text-center">
			<div className={cn("mx-auto mb-8 w-24 h-24 rounded-2xl flex items-center justify-center", isMounted ? "animate-slide-down" : "opacity-0")}>
				<div className="w-full h-full rounded-2xl bg-sage flex items-center justify-center">
					<svg className="w-12 h-12 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
						<path d="M12 2L2 7l10 5 10-5-10-5z" />
						<path d="M2 17l10 5 10-5" />
						<path d="M2 12l10 5 10-5" />
					</svg>
				</div>
			</div>
			<h2 className="text-2xl font-semibold text-charcoal mb-2">Ready when you are</h2>
			<p className="text-muted-foreground max-w-xs mx-auto">
				List what's in your fridge and I'll create a recipe tailored to your ingredients.
			</p>
		</div>
	);
}

function ErrorState({ error, onRetry, isMounted }: { error: Error; onRetry?: () => void; isMounted: boolean }) {
	return (
		<Alert variant="destructive" className={cn("mb-6", isMounted ? "animate-slide-down" : "opacity-0")} role="alert">
			<div className="flex items-start gap-3">
				<AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
				<div className="flex-1">
					<AlertTitle>Couldn't generate recipe</AlertTitle>
					<AlertDescription>{error.message}</AlertDescription>
				</div>
			</div>
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry} className="mt-3 gap-1 w-full sm:w-auto">
					<RefreshCw className="h-4 w-4" />
					Try Again
				</Button>
			)}
		</Alert>
	);
}

function CannotMakeState({ recipe, onRetry, isMounted }: { recipe: RecipeResponse & { status: "cannot_make" }; onRetry?: () => void; isMounted: boolean }) {
	return (
		<Alert variant="destructive" className={cn("mb-6", isMounted ? "animate-slide-down" : "opacity-0")} role="alert">
			<div className="flex items-start gap-3">
				<AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
				<div className="flex-1">
					<AlertTitle>Can't make a recipe with that</AlertTitle>
					<AlertDescription>{recipe.reason}</AlertDescription>
				</div>
			</div>
			{recipe.suggestions.length > 0 && (
				<ul className="mt-3 list-disc list-inside space-y-1 text-sm text-muted-foreground">
					{recipe.suggestions.map((s, i) => <li key={i}>{s}</li>)}
				</ul>
			)}
			{onRetry && (
				<Button variant="outline" size="sm" onClick={onRetry} className="mt-3 gap-1 w-full sm:w-auto">
					<RefreshCw className="h-4 w-4" />
					Try Different Ingredients
				</Button>
			)}
		</Alert>
	);
}

function ServingsScaler({ value, onIncrement, onDecrement, original, className }: {
	value: number;
	onIncrement: () => void;
	onDecrement: () => void;
	original: number;
	className?: string;
}) {
	return (
		<div className={cn("flex items-center justify-between gap-4 p-4 bg-muted rounded-xl border", className)}>
			<div className="flex items-center gap-3">
				<Users className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
				<span className="font-medium text-charcoal">Servings</span>
			</div>
			<div className="flex items-center gap-2">
				<button
					onClick={onDecrement}
					disabled={value <= 1}
					aria-label="Decrease servings"
					className="check-toggle w-12 h-12 text-charcoal"
					style={{ borderColor: value <= 1 ? "var(--color-border)" : "var(--color-mist)" }}
				>
					<Minus className="w-5 h-5 mx-auto" />
				</button>
				<span className="w-16 text-center text-2xl font-semibold tabular-nums text-charcoal">{value}</span>
				<button
					onClick={onIncrement}
					disabled={value >= 20}
					aria-label="Increase servings"
					className="check-toggle w-12 h-12 text-charcoal"
					style={{ borderColor: value >= 20 ? "var(--color-border)" : "var(--color-mist)" }}
				>
					<Plus className="w-5 h-5 mx-auto" />
				</button>
				{value !== original && (
					<Badge variant="secondary" className="ml-2 text-xs px-2 py-1">
						Scaled from {original}
					</Badge>
				)}
			</div>
		</div>
	);
}

function IngredientsSection({
	ingredients,
	formatQuantity,
	expandedIngredients,
	onToggleIngredient,
}: {
	ingredients: OkResponse["recipe"]["ingredients"];
	formatQuantity: (q: number | null, u: string | null) => string;
	expandedIngredients: Set<string>;
	onToggleIngredient: (id: string) => void;
}) {
	return (
		<section aria-labelledby="ingredients-heading" className="space-y-3">
			<h2 id="ingredients-heading" className="text-lg font-semibold text-charcoal flex items-center gap-2">
				<Users className="w-5 h-5 text-sage" aria-hidden="true" />
				Ingredients
				<span className="text-sm font-normal text-muted-foreground">({ingredients.length})</span>
			</h2>
			<ul className="space-y-2" role="list">
				{ingredients.map((ing) => (
					<IngredientItem
						key={ing.id}
						ingredient={ing}
						formatQuantity={formatQuantity}
						isExpanded={expandedIngredients.has(ing.id)}
						onToggle={() => onToggleIngredient(ing.id)}
					/>
				))}
			</ul>
		</section>
	);
}

function IngredientItem({
	ingredient,
	formatQuantity,
	isExpanded,
	onToggle,
}: {
	ingredient: OkResponse["recipe"]["ingredients"][0];
	formatQuantity: (q: number | null, u: string | null) => string;
	isExpanded: boolean;
	onToggle: () => void;
}) {
	const hasSwaps = ingredient.swaps.length > 0;

	return (
		<li>
			<button
				onClick={onToggle}
				className={cn(
					"w-full text-left p-4 rounded-xl border transition-colors",
					"bg-background hover:bg-muted",
					hasSwaps && "pr-12"
				)}
				aria-expanded={isExpanded}
				aria-controls={`swaps-${ingredient.id}`}
			>
				<div className="flex items-center gap-3">
					{/* Custom checkbox */}
					<input
						type="checkbox"
						className="check-toggle"
						checked={false}
						readOnly
						aria-hidden="true"
						tabIndex={-1}
					/>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 flex-wrap">
							<span className="font-medium text-charcoal truncate">{ingredient.name}</span>
							{ingredient.inFridge && (
								<span className="text-xs font-medium text-sage px-3 py-1 rounded-full bg-sage/10">From fridge</span>
							)}
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
							<span className="font-mono text-charcoal">{formatQuantity(ingredient.quantity, ingredient.unit)}</span>
							{ingredient.note && <span>· {ingredient.note}</span>}
						</div>
					</div>
					{hasSwaps && (
						<ChevronDown
							className={cn(
								"w-5 h-5 text-muted-foreground transition-transform",
								isExpanded && "rotate-180 text-sage"
							)}
							aria-hidden="true"
						/>
					)}
				</div>
			</button>
			{hasSwaps && isExpanded && (
				<div id={`swaps-${ingredient.id}`} className="mt-2 ml-10 space-y-2 animate-slide-down" role="region" aria-label={`Substitutes for ${ingredient.name}`}>
					{ingredient.swaps.map((swap, i) => (
						<div key={i} className="flex items-center gap-2 text-sm p-3 rounded-xl bg-muted border">
							<span className="font-mono text-charcoal w-20 shrink-0">
								{swap.quantity != null ? `${swap.quantity} ${swap.unit || ""}` : "to taste"}
							</span>
							<span className="font-medium text-charcoal">{swap.name}</span>
							{swap.note && <span className="text-xs text-muted-foreground italic ml-auto">({swap.note})</span>}
						</div>
					))}
				</div>
			)}
		</li>
	);
}

function StepsSection({
	steps,
	ingredients,
	checkedSteps,
	onToggleStep,
}: {
	steps: OkResponse["recipe"]["steps"];
	ingredients: OkResponse["recipe"]["ingredients"];
	checkedSteps: Set<string>;
	onToggleStep: (id: string) => void;
}) {
	return (
		<section aria-labelledby="steps-heading" className="space-y-0">
			<div className="flex items-center justify-between mb-6">
				<h2 id="steps-heading" className="text-lg font-semibold text-charcoal">
					Steps
				</h2>
				{checkedSteps.size > 0 && (
					<span className="text-sm text-muted-foreground">
						{checkedSteps.size} / {steps.length} done
					</span>
				)}
			</div>
			<ol className="space-y-10" role="list">
				{steps.map((step, index) => (
					<StepItem
						key={step.id}
						step={step}
						ingredients={ingredients}
						stepNumber={index + 1}
						totalSteps={steps.length}
						isChecked={checkedSteps.has(step.id)}
						isFirst={index === 0}
						isLast={index === steps.length - 1}
						onToggle={onToggleStep}
					/>
				))}
			</ol>
		</section>
	);
}

function StepItem({
	step,
	ingredients,
	stepNumber,
	totalSteps,
	isChecked,
	isFirst,
	isLast,
	onToggle,
}: {
	step: OkResponse["recipe"]["steps"][0];
	ingredients: OkResponse["recipe"]["ingredients"];
	stepNumber: number;
	totalSteps: number;
	isChecked: boolean;
	isFirst: boolean;
	isLast: boolean;
	onToggle: (id: string) => void;
}) {
	return (
		<li className="relative group">
			{/* Timeline connector */}
			<div className="absolute left-7 top-0 bottom-0 w-[2px]" aria-hidden="true">
				<div
					className="h-full transition-all duration-300"
					style={{
						background: isChecked ? "var(--color-primary)" : "var(--color-border)",
						transformOrigin: "top",
						transform: isChecked ? "scaleY(1)" : "scaleY(0)",
					}}
				/>
			</div>

			<div className="relative pl-16 py-2">
				{/* Step marker */}
				<div className="absolute left-0 top-1">
					<button
						onClick={() => onToggle(step.id)}
						className={cn(
							"w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-200 ease-spring",
							isChecked
								? "bg-sage border-sage text-cream shadow-[0_0_0_3px_var(--color-sage)/0.2]"
								: "border-mist bg-background text-muted-foreground hover:border-sage hover:text-sage"
						)}
						aria-checked={isChecked}
						aria-label={isChecked ? `Unmark step ${stepNumber}` : `Mark step ${stepNumber} as done`}
					>
						{isChecked ? (
							<svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						) : (
							<span className="text-lg font-semibold tabular-nums">{stepNumber}</span>
						)}
					</button>
				</div>

				{/* Step content */}
				<div
					className={cn(
						"p-4 rounded-xl border transition-all duration-200",
						isChecked
							? "bg-sage/5 border-sage/20 opacity-60"
							: "bg-background border-mist hover:border-sage/30"
					)}
				>
					<h3 className="font-semibold text-charcoal mb-2">{step.title}</h3>
					<p className="text-muted-foreground leading-relaxed mb-4">{step.instruction}</p>
					<div className="flex flex-wrap items-center gap-2">
						{step.durationMinutes != null && (
							<span className="inline-flex items-center gap-1.5 text-sm font-mono text-muted-foreground px-3 py-1 rounded-full bg-muted">
								<Clock className="w-4 h-4" aria-hidden="true" />
								~{step.durationMinutes} min
							</span>
						)}
						{step.ingredientIds.length > 0 && (
							<div className="flex flex-wrap gap-1.5" aria-label="Ingredients used in this step">
								{step.ingredientIds.map((id) => {
									const ingredient = ingredients.find((ing) => ing.id === id);
									return (
										<Badge key={id} variant="outline" className="text-xs h-6 px-2 border-sage/20 text-sage hover:bg-sage/5">
											{ingredient?.name || id}
										</Badge>
									);
								})}
							</div>
						)}
					</div>
				</div>
			</div>
		</li>
	);
}

function TipsSection({ tips }: { tips: string[] }) {
	return (
		<section aria-labelledby="tips-heading" className="space-y-3 pt-6 border-t">
			<h2 id="tips-heading" className="text-lg font-semibold text-charcoal">Pro tips</h2>
			<ul className="space-y-3" role="list">
				{tips.map((tip, i) => (
					<li key={i} className="p-4 rounded-xl bg-muted/50 border">
						<div className="flex gap-3">
							<div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sage mt-1.5" aria-hidden="true" />
							<p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
						</div>
					</li>
				))}
			</ul>
		</section>
	);
}