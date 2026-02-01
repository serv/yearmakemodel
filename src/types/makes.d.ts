export type Make = string;
export type Model = string;
export type MakeModelMap = Record<Make, Model[]>;
export type TagType = "year" | "make" | "model";

export interface Tag {
	id: string;
	name: string;
	type: TagType;
}

export interface CarMakeModelYear {
	year: string;
	make: Make;
	model: Model;
}

export interface MakesResponse {
	makes: string[];
}

export interface ModelsResponse {
	models: string[];
}

export interface MakeModelMapResponse {
	map: Record<string, string[]>;
}
