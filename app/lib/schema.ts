import * as z from "zod";

export const RecipeIngredientSchema = z.object({
	name: z.string().min(1),
	amount: z.string().min(1),
	unit: z.string().optional(),
	notes: z.string().optional(),
});

export const RecipeStepSchema = z.object({
	order: z.number().int().positive(),
	instruction: z.string().min(1),
	durationMinutes: z.number().int().nonnegative().optional(),
	tips: z.string().optional(),
});

export const RecipeSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	servings: z.number().int().positive().default(4),
	prepTimeMinutes: z.number().int().nonnegative().optional(),
	cookTimeMinutes: z.number().int().nonnegative().optional(),
	ingredients: z.array(RecipeIngredientSchema).min(1),
	steps: z.array(RecipeStepSchema).min(1),
	tags: z.array(z.string()).optional(),
	notes: z.string().optional(),
});

export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;
export type RecipeStep = z.infer<typeof RecipeStepSchema>;
export type Recipe = z.infer<typeof RecipeSchema>;

export const RecipeResponseSchema = z.object({
	recipe: RecipeSchema,
	alternatives: z
		.array(
			z.object({
				originalIngredient: z.string(),
				substitutes: z.array(z.string()),
			}),
		)
		.optional(),
});

export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
