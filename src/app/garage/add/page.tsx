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
import { addCar } from "@/app/actions/cars";
import { useRouter } from "next/navigation";
import { MAKES, MODELS } from "@/lib/constants";

export default function AddCarPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const availableModels = selectedMake ? MODELS[selectedMake] || [] : [];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    const formData = new FormData(event.currentTarget);

    try {
      await addCar("00000000-0000-0000-0000-000000000000", {
        // Mock user ID
        year: parseInt(formData.get("year") as string),
        make: formData.get("make") as string,
        model: formData.get("model") as string,
        trim: (formData.get("trim") as string) || undefined,
        color: (formData.get("color") as string) || undefined,
        drivetrain: (formData.get("drivetrain") as string) || undefined,
        transmission: (formData.get("transmission") as string) || undefined,
      });
      router.push("/garage");
    } catch (error) {
      console.error(error);
      alert("Failed to add car");
    } finally {
      setIsPending(false);
    }
  }

  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel("");
  };

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Add a Car</h1>
      <form onSubmit={onSubmit} className="space-y-4 border p-6 rounded-lg">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Select name="make" value={selectedMake} onValueChange={handleMakeChange} required>
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
              <SelectValue placeholder={selectedMake ? "Select Model" : "Select Make First"} />
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
          <Input id="trim" name="trim" placeholder="LE, XSE, etc." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" placeholder="Midnight Black" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select name="transmission">
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
            <Select name="drivetrain">
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
            {isPending ? "Adding..." : "Add Car"}
          </Button>
        </div>
      </form>
    </div>
  );
}
