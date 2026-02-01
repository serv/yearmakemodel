import type { MakeModelMap } from "@/types/makes";
import { MAKES, MODELS, YEARS } from "./constants";

export function getMakes(): string[] {
	return MAKES;
}

export function getModels(make: string): string[] {
	return MODELS[make as keyof typeof MODELS] || [];
}

export function getYears(): string[] {
	return YEARS;
}

export function getMakeModelMap(): MakeModelMap {
	return MODELS;
}

export function normalizeModel(model: string): string {
	return model.trim();
}

export function isValidMake(make: string): boolean {
	return MAKES.includes(make);
}

export function isValidModel(make: string, model: string): boolean {
	const models = getModels(make);
	return models.includes(model);
}
