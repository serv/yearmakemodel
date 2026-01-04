"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAKES, MODELS } from "@/lib/constants";
import { carSchema } from "@/lib/validations";
import { z } from "zod";

type CarData = z.infer<typeof carSchema>;

interface CarFormProps {
  initialData?: CarData;
  onSubmit: (data: CarData) => Promise<void>;
  submitLabel: string;
}

export function CarForm({ initialData, onSubmit, submitLabel }: CarFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [selectedMake, setSelectedMake] = useState(initialData?.make || "");
  const [selectedModel, setSelectedModel] = useState(initialData?.model || "");

  const availableModels = selectedMake
    ? MODELS[selectedMake as keyof typeof MODELS] || []
    : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    const yearStr = formData.get("year");

    try {
      const data: CarData = {
        year: yearStr ? parseInt(yearStr as string) : new Date().getFullYear(),
        make: formData.get("make") as string,
        model: formData.get("model") as string,
        trim: (formData.get("trim") as string) || undefined,
        color: (formData.get("color") as string) || undefined,
        drivetrain: (formData.get("drivetrain") as string) || undefined,
        transmission: (formData.get("transmission") as string) || undefined,
      };

      await onSubmit(data);
    } catch (error) {
      console.error(error);
      alert("Failed to save car");
    } finally {
      setIsPending(false);
    }
  }

  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min="1900"
            max="2026"
            required
            placeholder="2023"
            defaultValue={initialData?.year}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Select
            name="make"
            value={selectedMake}
            onValueChange={handleMakeChange}
            required
          >
            <SelectTrigger id="make">
              <SelectValue placeholder="Select Make" />
            </SelectTrigger>
            <SelectContent>
              {MAKES.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model *</Label>
        <Select
          name="model"
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={!selectedMake}
          required
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

      <div className="space-y-2">
        <Label htmlFor="trim">Trim</Label>
        <Input
          id="trim"
          name="trim"
          placeholder="LE, XSE, etc."
          defaultValue={initialData?.trim}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <Input
          id="color"
          name="color"
          placeholder="Midnight Black"
          defaultValue={initialData?.color}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select name="transmission" defaultValue={initialData?.transmission}>
            <SelectTrigger id="transmission">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Automatic">Automatic</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="drivetrain">Drivetrain</Label>
          <Select name="drivetrain" defaultValue={initialData?.drivetrain}>
            <SelectTrigger id="drivetrain">
              <SelectValue placeholder="Select Drivetrain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FWD">FWD</SelectItem>
              <SelectItem value="RWD">RWD</SelectItem>
              <SelectItem value="AWD">AWD</SelectItem>
              <SelectItem value="4WD">4WD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
