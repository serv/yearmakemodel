import { getMakeModelMap, getMakes, getModels, getYears } from "./makes";

export async function fetchMakesForUI(useDb = false): Promise<string[]> {
	if (useDb) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/makes`,
			{ next: { revalidate: 3600, tags: ["makes"] } },
		);
		if (!response.ok) return getMakes();
		const data: { makes: string[] } = await response.json();
		return data.makes;
	}
	return getMakes();
}

export async function fetchModelsForUI(
	make: string,
	useDb = false,
): Promise<string[]> {
	if (useDb) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/makes?make=${encodeURIComponent(make)}`,
			{ next: { revalidate: 3600, tags: ["makes"] } },
		);
		if (!response.ok) return getModels(make);
		const data: { models: string[] } = await response.json();
		return data.models;
	}
	return getModels(make);
}

export async function fetchYearsForUI(useDb = false): Promise<string[]> {
	if (useDb) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/makes/years`,
			{ next: { revalidate: 3600, tags: ["makes"] } },
		);
		if (!response.ok) return getYears();
		const data: { years: string[] } = await response.json();
		return data.years;
	}
	return getYears();
}

export async function fetchMakesMapForUI(
	useDb = false,
): Promise<Record<string, string[]>> {
	if (useDb) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/makes/map`,
			{ next: { revalidate: 3600, tags: ["makes"] } },
		);
		if (!response.ok) return getMakeModelMap();
		const data: { map: Record<string, string[]> } = await response.json();
		return data.map;
	}
	return getMakeModelMap();
}
