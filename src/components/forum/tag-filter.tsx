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

  // Derived models based on selected make
  const filteredModels =
    make && make !== "all" && makeModelMap[make]
      ? makeModelMap[make]
      : availableModels;

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

    router.push(`/forum?${params.toString()}`);
  }, [year, make, model, router]);

  const handleMakeChange = (val: string) => {
    setMake(val);
    // Reset model when make changes if the current model doesn't belong to the new make
    if (
      val !== "all" &&
      model &&
      makeModelMap[val] &&
      !makeModelMap[val].includes(model)
    ) {
      setModel("");
    } else if (val === "all") {
      // Keep model if 'all' is selected (shows all models), or maybe reset?
      // Usually clearing make allows any model, but if a specific model was selected, it's still valid in the global list.
      // However, for better UX, we might want to keep it or let user decide.
      // Let's keep it for now unless it conflicts logic, but since we show availableModels (all) when make is all, it's fine.
    }
  };

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

      <div className="space-y-2">
        <Label>Make</Label>
        <Select value={make} onValueChange={handleMakeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Make" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Makes</SelectItem>
            {availableMakes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Model</Label>
        <Select
          value={model}
          onValueChange={(val) => {
            setModel(val);
          }}
          // Model selection is always enabled now.
          // If a make is selected, the list is filtered.
          // If no make is selected, the list contains all models.
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            {filteredModels.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
      {(year || make || model) && (
        <Button
          variant="outline"
          onClick={() => router.push("/forum")}
          className="w-full mt-2"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
