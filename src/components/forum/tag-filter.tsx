'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface TagFilterProps {
  availableYears: string[];
  availableMakes: string[];
}

export function TagFilter({ availableYears, availableMakes }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [year, setYear] = useState(searchParams.get('year') || '');
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');

  // Update state when URL changes
  useEffect(() => {
    setYear(searchParams.get('year') || '');
    setMake(searchParams.get('make') || '');
    setModel(searchParams.get('model') || '');
  }, [searchParams]);

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (year) params.set('year', year);
    if (make) params.set('make', make);
    if (model) params.set('model', model);

    router.push(`/forum?${params.toString()}`);
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

      <div className="space-y-2">
        <Label>Make</Label>
        <Select
          value={make}
          onValueChange={(val) => {
            setMake(val);
          }}
        >
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
        {/* Simple input for Model as we don't have all models in frontend constant */}
        <input
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Type model..."
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
      </div>

      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
      {(year || make || model) && (
        <Button variant="outline" onClick={() => router.push('/forum')} className="w-full mt-2">
          Clear
        </Button>
      )}
    </div>
  );
}
