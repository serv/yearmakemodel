"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MakeModelSelector } from "@/components/shared/make-model-selector";
import { YearSelector } from "@/components/shared/year-selector";
import { Button } from "@/components/ui/button";

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
        <YearSelector
          value={year}
          onValueChange={setYear}
          years={availableYears}
          mode="filter"
        />
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
