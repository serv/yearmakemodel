"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { getCarMakeIcon } from "@/lib/car-make-icons";

interface MakeModelSelectorProps {
  // Values
  makeValue?: string;
  modelValue?: string;

  // Callbacks
  onMakeChange: (value: string) => void;
  onModelChange: (value: string) => void;

  // Mode
  mode?: "strict" | "filter"; // strict = required, filter = optional with "all"

  // Data source
  makes: string[];
  makeModelMap: Record<string, string[]>;

  // Customization
  makeLabel?: string;
  modelLabel?: string;
  makePlaceholder?: string;
  modelPlaceholder?: string;
  required?: boolean;

  // Layout
  layout?: "horizontal" | "vertical"; // side-by-side or stacked
  className?: string;
}

export function MakeModelSelector({
  makeValue = "",
  modelValue = "",
  onMakeChange,
  onModelChange,
  mode = "strict",
  makes,
  makeModelMap,
  makeLabel = "Make",
  modelLabel = "Model",
  makePlaceholder = "Select Make",
  modelPlaceholder = "Select Model",
  required = false,
  layout = "horizontal",
  className = "",
}: MakeModelSelectorProps) {
  const isFilterMode = mode === "filter";

  // Calculate available models based on selected make
  const availableModels =
    makeValue && makeValue !== "all" && makeModelMap[makeValue]
      ? makeModelMap[makeValue]
      : isFilterMode
      ? Object.values(makeModelMap).flat()
      : [];

  // Handle make change with model reset logic
  const handleMakeChange = (value: string) => {
    onMakeChange(value);

    // Reset model if it doesn't belong to the new make
    if (value === "all") {
      // In filter mode, keep the model selection when "all" is selected
      if (!isFilterMode) {
        onModelChange("");
      }
    } else if (
      modelValue &&
      makeModelMap[value] &&
      !makeModelMap[value].includes(modelValue)
    ) {
      onModelChange("");
    } else if (!makeModelMap[value]) {
      // If make doesn't have models in the map, reset
      onModelChange("");
    }
  };

  // Determine if model select should be disabled
  const isModelDisabled = !makeValue || (makeValue === "all" && !isFilterMode);

  // Container class based on layout
  const containerClass =
    layout === "horizontal"
      ? "grid grid-cols-2 gap-4"
      : "space-y-4";

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Make Select */}
      <div className="space-y-2">
        <Label htmlFor="make-selector">
          {makeLabel} {required && "*"}
        </Label>
        <Select
          name="make"
          value={makeValue}
          onValueChange={handleMakeChange}
          required={required}
        >
          <SelectTrigger id="make-selector">
            <SelectValue placeholder={makePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {isFilterMode && <SelectItem value="all">All Makes</SelectItem>}
            {makes.map((make) => {
              const MakeIcon = getCarMakeIcon(make);
              return (
                <SelectItem key={make} value={make}>
                  <div className="flex items-center gap-2">
                    {MakeIcon && (
                      <MakeIcon
                        className="h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{make}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Model Select */}
      <div className="space-y-2">
        <Label htmlFor="model-selector">
          {modelLabel} {required && "*"}
        </Label>
        <Select
          name="model"
          value={modelValue}
          onValueChange={onModelChange}
          disabled={isModelDisabled}
          required={required}
        >
          <SelectTrigger id="model-selector">
            <SelectValue
              placeholder={
                isModelDisabled
                  ? "Select Make First"
                  : modelPlaceholder
              }
            />
          </SelectTrigger>
          <SelectContent>
            {isFilterMode && <SelectItem value="all">All Models</SelectItem>}
            {availableModels.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
