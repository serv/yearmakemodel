import { CarForm } from "@/components/garage/car-form";
import { AddCarClient } from "./add-car-client";
import { fetchMakesForUI, fetchMakesMapForUI } from "@/lib/makes-fetcher";

export default async function AddCarPage() {
	const makes = await fetchMakesForUI();
	const makesMap = await fetchMakesMapForUI();

	return (
		<div className="container mx-auto py-8 max-w-md">
			<h1 className="text-2xl font-bold mb-6">Add a Car</h1>
			<AddCarClient makes={makes} models={makesMap} />
		</div>
	);
}
