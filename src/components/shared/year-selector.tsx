"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { END_YEAR, START_YEAR } from "@/lib/constants";

interface YearSelectorProps {
  value: string | number | undefined;
  onValueChange: (value: string) => void;
  startYear?: number;
  endYear?: number;
  mode?: "strict" | "filter";
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  years?: (string | number)[]; // Allow passing explicit list of years
}

export function YearSelector({
  value,
  onValueChange,
  startYear = START_YEAR,
  endYear = END_YEAR,
  mode = "strict",
  label = "Year",
  placeholder = "Select Year",
  required = false,
  className = "",
  years: providedYears,
}: YearSelectorProps) {
  const isFilterMode = mode === "filter";

  let years: (string | number)[] = [];

  if (providedYears) {
    years = providedYears;
  } else {
    for (let y = endYear; y >= startYear; y--) {
      years.push(y);
    }
  }

  // Ensure value is string for Select
  // If value is null/undefined, default to empty string
  // If value is "all", it matches the filter mode option
  const strValue =
    value === null || value === undefined ? "" : value.toString();

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="year-selector">
        {label} {required && "*"}
      </Label>
      <Select
        name="year"
        value={strValue}
        onValueChange={onValueChange}
        required={required}
      >
        <SelectTrigger id="year-selector">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {isFilterMode && <SelectItem value="all">All Years</SelectItem>}
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
