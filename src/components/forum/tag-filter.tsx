"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MakeModelSelector } from "@/components/shared/make-model-selector";

interface TagFilterProps {
  availableYears: string[];
  availableMakes: string[];
  availableModels: string[];
  makeModelMap: Record<string, string[]>;
}

export function TagFilter({
  availableYears,
  availableMakes,
  availableModels,
  makeModelMap,
}: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [year, setYear] = useState(searchParams.get("year") || "");
  const [make, setMake] = useState(searchParams.get("make") || "");
  const [model, setModel] = useState(searchParams.get("model") || "");

  // Update state when URL changes
  useEffect(() => {
    setYear(searchParams.get("year") || "");
    setMake(searchParams.get("make") || "");
    setModel(searchParams.get("model") || "");
  }, [searchParams]);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (year && year !== "all") params.set("year", year);
    if (make && make !== "all") params.set("make", make);
    if (model && model !== "all") params.set("model", model);

    router.push(`/?${params.toString()}`);
  }, [year, make, model, router]);

  return (
    <div className="p-4 space-y-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Filters</h3>

      <div className="space-y-2">
        <Label>Year</Label>
        <Select
          value={year}
          onValueChange={(val) => {
            setYear(val);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MakeModelSelector
        makeValue={make}
        modelValue={model}
        onMakeChange={setMake}
        onModelChange={setModel}
        makes={availableMakes}
        makeModelMap={makeModelMap}
        mode="filter"
        layout="vertical"
      />

      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
      {(year || make || model) && (
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="w-full mt-2"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
