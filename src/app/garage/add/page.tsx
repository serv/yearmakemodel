'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addCar } from "@/app/actions/cars";
import { useRouter } from "next/navigation";
// In real app, import toast from sonner

export default function AddCarPage() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        const formData = new FormData(event.currentTarget);
        
        try {
            await addCar("00000000-0000-0000-0000-000000000000", { // Mock user ID
                year: parseInt(formData.get('year') as string),
                make: formData.get('make') as string,
                model: formData.get('model') as string,
                trim: formData.get('trim') as string || undefined,
                color: formData.get('color') as string || undefined,
                drivetrain: formData.get('drivetrain') as string || undefined,
                transmission: formData.get('transmission') as string || undefined,
            });
            router.push('/garage');
        } catch (error) {
            console.error(error);
            alert("Failed to add car");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="container mx-auto py-8 max-w-md">
            <h1 className="text-2xl font-bold mb-6">Add a Car</h1>
            <form onSubmit={onSubmit} className="space-y-4 border p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="year">Year *</Label>
                        <Input id="year" name="year" type="number" min="1900" max="2026" required placeholder="2023" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="make">Make *</Label>
                        <Input id="make" name="make" required placeholder="Toyota" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input id="model" name="model" required placeholder="Camry" />
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
                        <Input id="transmission" name="transmission" placeholder="Automatic" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="drivetrain">Drivetrain</Label>
                        <Input id="drivetrain" name="drivetrain" placeholder="FWD, AWD" />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Adding...' : 'Add Car'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
