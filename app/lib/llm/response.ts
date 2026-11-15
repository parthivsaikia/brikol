import * as z from "zod";
import { UNITS } from "./schema";

const UnitSchema = z.enum(UNITS);

const SwapSchema = z.object({
	name: z.string().min(1),
	quantity: z.number().nullable(),
	unit: UnitSchema.nullable(),
	note: z.string(),
});

const IngredientSchema = z.object({
	id: z.string().regex(/^i\d+$/),
	name: z.string().min(1),
	quantity: z.number().nullable(),
	unit: UnitSchema.nullable(),
	inFridge: z.boolean(),
	note: z.string(),
	swaps: z.array(SwapSchema),
});

const StepSchema = z.object({
	id: z.string().regex(/^s\d+$/),
	title: z.string().min(1),
	instruction: z.string().min(1),
	durationMinutes: z.number().int().nonnegative().nullable(),
	ingredientIds: z.array(z.string().regex(/^i\d+$/)),
});

const RecipeSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	servings: z.number().int().positive(),
	prepMinutes: z.number().int().nonnegative(),
	cookMinutes: z.number().int().nonnegative(),
	difficulty: z.enum(["easy", "medium", "hard"]),
	ingredients: z.array(IngredientSchema).min(2).max(25),
	steps: z.array(StepSchema).min(3).max(10),
	tips: z.array(z.string()).max(3),
});

export const OkResponseSchema = z.object({
	status: z.literal("ok"),
	recipe: RecipeSchema,
});

export const CannotMakeResponseSchema = z.object({
	status: z.literal("cannot_make"),
	reason: z.string().min(1),
	suggestions: z.array(z.string()).max(4),
});

export const RecipeResponseSchema = z.union([OkResponseSchema, CannotMakeResponseSchema]);

export type OkResponse = z.infer<typeof OkResponseSchema>;
export type CannotMakeResponse = z.infer<typeof CannotMakeResponseSchema>;
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;

export function validateResponse(data: unknown): RecipeResponse {
	return RecipeResponseSchema.parse(data);
}

export function isOkResponse(response: RecipeResponse): response is OkResponse {
	return response.status === "ok";
}