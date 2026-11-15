// Suppress AI SDK deprecation warnings
if (typeof process !== "undefined") {
	process.env.AI_SDK_LOG_WARNINGS = "false";
}

import { generateText } from "ai";
import { SYSTEM_PROMPT, buildUserPrompt, buildRepairPrompt } from "./prompt";
import {
	RecipeResponseSchema,
	type RecipeResponse,
	type OkResponse,
	type CannotMakeResponse,
} from "./response";
import type { RecipeInput } from "./input";
import { createModelFromEnv, getProviderFromEnv } from "./providers";
import { classifyError, type AIError, type AIErrorCode } from "./errors";

const model = createModelFromEnv();

const MAX_RETRIES = 1;
const BASE_DELAY_MS = 1500;
const MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS) || 2000;

export async function generateRecipe(
	input: RecipeInput,
): Promise<RecipeResponse> {
	const userPrompt = buildUserPrompt(input);

	let lastError: string | null = null;
	let lastCannotMake: CannotMakeResponse | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		if (attempt > 0) {
			const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1) + Math.random() * 500;
			console.log(`[LLM Attempt ${attempt + 1}] Waiting ${Math.round(delay)}ms before retry...`);
			await new Promise((r) => setTimeout(r, delay));
		}

		try {
			const { text } = await generateText({
				model,
				system: SYSTEM_PROMPT,
				prompt: attempt === 0 ? userPrompt : buildRepairPrompt(lastError!),
				temperature: 0.1,
				maxOutputTokens: MAX_TOKENS,
			});

			console.log(`[LLM Attempt ${attempt + 1}] Raw response length:`, text?.length || 0);

			if (!text || text.trim().length === 0) {
				throw new Error("Empty response from model");
			}

			// Extract JSON from response (handle potential markdown)
			const jsonText = extractJSON(text);
			const parsed = JSON.parse(jsonText);
			const validated = RecipeResponseSchema.parse(parsed);

			if (isOkResponse(validated)) {
				if (validated.recipe.servings !== input.servings) {
					throw new Error(
						`Recipe servings (${validated.recipe.servings}) must equal requested servings (${input.servings})`,
					);
				}
				return validated;
			}

			lastCannotMake = validated;
			const shouldRetry = attempt < MAX_RETRIES && looksLikeTransientFailure(validated, input);

			if (shouldRetry) {
				lastError = `Model returned "cannot_make" but input has ingredients: ${input.items}. Reason: ${validated.reason}. Retrying...`;
				console.log(`[LLM Attempt ${attempt + 1}] Transient cannot_make, retrying:`, lastError);
				continue;
			}

			return validated;
		} catch (error) {
			lastError = error instanceof Error ? error.message : String(error);
			console.log(`[LLM Attempt ${attempt + 1}] Error:`, lastError);

			const aiError = classifyError(error, lastError);

			if (!aiError.retryable && attempt === MAX_RETRIES) {
				if (lastCannotMake) return lastCannotMake;
				return buildFallbackError(aiError);
			}

			if (aiError.code === "RATE_LIMITED" || aiError.code === "NETWORK_ERROR") {
				continue;
			}

			if (attempt === MAX_RETRIES) {
				if (lastCannotMake) return lastCannotMake;
				return buildFallbackError(aiError);
			}
		}
	}

	if (lastCannotMake) return lastCannotMake;
	return {
		status: "cannot_make",
		reason: "Failed to generate a valid recipe after multiple attempts.",
		suggestions: [
			"Try with a simpler list of ingredients.",
			"Check that your ingredient list contains food items.",
		],
	};
}

function extractJSON(text: string): string {
	// Try to find JSON object in the response
	const trimmed = text.trim();

	// If it starts with {, it's likely already JSON
	if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
		return trimmed;
	}

	// Try to extract JSON from markdown code blocks
	const codeBlockMatch = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
	if (codeBlockMatch) {
		return codeBlockMatch[1].trim();
	}

	// Try to find first { and last }
	const firstBrace = trimmed.indexOf("{");
	const lastBrace = trimmed.lastIndexOf("}");
	if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
		return trimmed.slice(firstBrace, lastBrace + 1);
	}

	return trimmed; // fallback
}

function isOkResponse(response: RecipeResponse): response is OkResponse {
	return response.status === "ok";
}

function looksLikeTransientFailure(response: CannotMakeResponse, input: RecipeInput): boolean {
	const reason = response.reason.toLowerCase();
	const items = input.items.toLowerCase();

	const noIngredientsPhrases = [
		"couldn't find any",
		"no ingredients",
		"no food",
		"nothing to cook",
		"empty",
		"not.*ingredients?",
	];

	const hasNoIngredientsPhrase = noIngredientsPhrases.some((phrase) =>
		new RegExp(phrase, "i").test(reason)
	);

	const userHasItems = items.trim().length > 0 && items.split(/[,;\n]/).some(
		(item) => item.trim().length > 1
	);

	return hasNoIngredientsPhrase && userHasItems;
}

function buildFallbackError(aiError: AIError): CannotMakeResponse {
	const messages: Record<AIErrorCode, { reason: string; suggestions: string[] }> = {
		RATE_LIMITED: {
			reason: "The AI service is rate limited. Please wait a moment and try again.",
			suggestions: ["Wait 30 seconds before trying again.", "Try with fewer ingredients."],
		},
		NETWORK_ERROR: {
			reason: "Network error contacting the AI service.",
			suggestions: ["Check your internet connection.", "Try again in a moment."],
		},
		TIMEOUT: {
			reason: "The AI request timed out.",
			suggestions: ["Try with a simpler ingredient list.", "Try again later."],
		},
		MODEL_UNAVAILABLE: {
			reason: "The AI model is temporarily unavailable.",
			suggestions: ["Try again in a few minutes."],
		},
		AUTH_ERROR: {
			reason: "AI service authentication failed. Please check your API key.",
			suggestions: ["Verify your OPENROUTER_API_KEY is correct."],
		},
		PARSE_ERROR: {
			reason: "The AI returned an invalid response format.",
			suggestions: ["Try again with a simpler request."],
		},
		VALIDATION_ERROR: {
			reason: "The AI response didn't match the expected format.",
			suggestions: ["Try again with a simpler ingredient list."],
		},
		SERVINGS_MISMATCH: {
			reason: "The generated recipe has incorrect serving count.",
			suggestions: ["Try again."],
		},
		UNKNOWN_ERROR: {
			reason: "An unexpected error occurred while generating the recipe.",
			suggestions: ["Try again.", "Check the logs for details."],
		},
	};

	const msg = messages[aiError.code] || messages.UNKNOWN_ERROR;
	return {
		status: "cannot_make",
		reason: msg.reason,
		suggestions: msg.suggestions,
	};
}

export type { RecipeResponse, OkResponse } from "./response";
export type { RecipeInput } from "./input";
export { getProviderFromEnv, createModelFromEnv } from "./providers";