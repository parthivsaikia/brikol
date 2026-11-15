import type { LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

export type ProviderName = "google" | "openrouter";

export interface ProviderConfig {
	name: ProviderName;
	apiKeyEnv: string;
	defaultModel: string;
	createModel: (apiKey: string, modelName?: string) => LanguageModel;
}

function createOpenRouterModel(apiKey: string, modelName?: string): LanguageModel {
	return createOpenAI({
		apiKey,
		baseURL: "https://openrouter.ai/api/v1",
	})(modelName || "openai/gpt-4o-mini");
}

const providers: Record<ProviderName, ProviderConfig> = {
	google: {
		name: "google",
		apiKeyEnv: "GOOGLE_GENERATIVE_AI_API_KEY",
		defaultModel: "gemini-2.5-pro",
		createModel: (apiKey, modelName) =>
			createGoogleGenerativeAI({ apiKey })(modelName || "gemini-2.5-pro"),
	},
	openrouter: {
		name: "openrouter",
		apiKeyEnv: "OPENROUTER_API_KEY",
		defaultModel: "openai/gpt-4o-mini",
		createModel: createOpenRouterModel,
	},
};

export function getProvider(name: ProviderName): ProviderConfig {
	return providers[name];
}

export function getProviderFromEnv(): ProviderConfig {
	const providerName = (process.env.LLM_PROVIDER as ProviderName) || "openrouter";
	return providers[providerName];
}

export function createModelFromEnv(provider?: ProviderConfig): LanguageModel {
	const p = provider || getProviderFromEnv();
	const apiKey = process.env[p.apiKeyEnv];
	if (!apiKey) {
		throw new Error(`Missing API key for ${p.name}: set ${p.apiKeyEnv}`);
	}
	const modelName = process.env.LLM_MODEL;
	return p.createModel(apiKey, modelName);
}

export function listProviders(): ProviderConfig[] {
	return Object.values(providers);
}