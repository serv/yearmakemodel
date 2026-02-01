"use client";

import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface MakeSelectProps {
	makes: string[];
	models: Record<string, string[]>;
	selectedMake: string;
	selectedModel: string;
	onMakeChange: (make: string) => void;
	onModelChange: (model: string) => void;
	disabled?: boolean;
	makeLabel?: string;
	modelLabel?: string;
	isLoading?: boolean;
}

export function MakeSelect({
	makes,
	models,
	selectedMake,
	selectedModel,
	onMakeChange,
	onModelChange,
	disabled = false,
	makeLabel = "Make",
	modelLabel = "Model",
	isLoading = false,
}: MakeSelectProps) {
	const availableModels = selectedMake ? models[selectedMake] || [] : [];

	const handleMakeChange = (value: string) => {
		onMakeChange(value);
		onModelChange("");
	};

	return (
		<>
			<div className="space-y-2">
				<Label htmlFor="make">{makeLabel} *</Label>
				<Select
					name="make"
					value={selectedMake}
					onValueChange={handleMakeChange}
					disabled={disabled || isLoading}
				>
					<SelectTrigger id="make">
						<SelectValue placeholder="Select Make" />
					</SelectTrigger>
					<SelectContent>
						{makes.map((make) => (
							<SelectItem key={make} value={make}>
								{make}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label htmlFor="model">{modelLabel} *</Label>
				<Select
					name="model"
					value={selectedModel}
					onValueChange={onModelChange}
					disabled={!selectedMake || disabled || isLoading}
				>
					<SelectTrigger id="model">
						<SelectValue
							placeholder={selectedMake ? "Select Model" : "Select Make First"}
						/>
					</SelectTrigger>
					<SelectContent>
						{availableModels.map((model) => (
							<SelectItem key={model} value={model}>
								{model}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</>
	);
}
