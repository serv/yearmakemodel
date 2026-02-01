"use client";

import { CarForm } from "@/components/garage/car-form";
import { addCar } from "@/app/actions/cars";
import { carSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { z } from "zod";

interface AddCarClientProps {
	makes: string[];
	models: Record<string, string[]>;
}

export function AddCarClient({ makes, models }: AddCarClientProps) {
	const router = useRouter();

	async function onSubmit(data: z.infer<typeof carSchema>) {
		await addCar(data);
		router.push("/garage");
	}

	return (
		<CarForm
			onSubmit={onSubmit}
			submitLabel="Add Car"
			makes={makes}
			models={models}
		/>
	);
}
