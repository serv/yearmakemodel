"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface MakeFilterProps {
	years: string[];
	makes: string[];
	models: Record<string, string[]>;
	selectedYear?: string;
	selectedMake?: string;
	selectedModel?: string;
	onYearChange?: (year: string) => void;
	onMakeChange?: (make: string) => void;
	onModelChange?: (model: string) => void;
	onClear?: () => void;
	isLoading?: boolean;
}

export function MakeFilter({
	years,
	makes,
	models,
	selectedYear = "",
	selectedMake = "",
	selectedModel = "",
	onYearChange,
	onMakeChange,
	onModelChange,
	onClear,
	isLoading = false,
}: MakeFilterProps) {
	const filteredModels =
		selectedMake && selectedMake !== "all" ? models[selectedMake] || [] : [];

	const handleMakeChange = (value: string) => {
		onMakeChange?.(value);
		if (
			selectedModel &&
			value !== "all" &&
			models[value] &&
			!models[value].includes(selectedModel)
		) {
			onModelChange?.("");
		}
	};

	const hasFilters = selectedYear || selectedMake || selectedModel;

	return (
		<div className="p-4 space-y-4 border rounded-lg">
			<h3 className="font-semibold mb-2">Filters</h3>

			<div className="space-y-2">
				<Label htmlFor="filter-year">Year</Label>
				<Select
					value={selectedYear}
					onValueChange={onYearChange}
					disabled={isLoading}
				>
					<SelectTrigger id="filter-year">
						<SelectValue placeholder="Select Year" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All Years</SelectItem>
						{years.map((y) => (
							<SelectItem key={y} value={y}>
								{y}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="filter-make">Make</Label>
				<Select
					value={selectedMake}
					onValueChange={handleMakeChange}
					disabled={isLoading}
				>
					<SelectTrigger id="filter-make">
						<SelectValue placeholder="Select Make" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All Makes</SelectItem>
						{makes.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="filter-model">Model</Label>
				<Select
					value={selectedModel}
					onValueChange={onModelChange}
					disabled={isLoading}
				>
					<SelectTrigger id="filter-model">
						<SelectValue placeholder="Select Model" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="">All Models</SelectItem>
						{filteredModels.map((m) => (
							<SelectItem key={m} value={m}>
								{m}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button
				onClick={() => onClear?.()}
				disabled={!hasFilters || isLoading}
				variant="outline"
				className="w-full"
			>
				Clear Filters
			</Button>
		</div>
	);
}
