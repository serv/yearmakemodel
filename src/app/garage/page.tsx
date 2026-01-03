import { getUserCars, deleteCar } from "@/app/actions/cars";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Trash2, Pencil } from "lucide-react";

export default async function GaragePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const cars = await getUserCars(session.user.id);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Garage</h1>
        <Link href="/garage/add">
          <Button>+ Add Car</Button>
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">
            You haven't added any cars to your garage yet.
          </p>
          <Link href="/garage/add">
            <Button variant="outline">Add Your First Car</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <Card key={car.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>
                    {car.year} {car.make} {car.model}
                  </CardTitle>
                  {car.trim && <Badge variant="outline">{car.trim}</Badge>}
                </div>

                <div className="flex gap-2">
                  <Link href={`/garage/edit/${car.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit car</span>
                    </Button>
                  </Link>
                  <form action={deleteCar.bind(null, car.id)}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete car</span>
                    </Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {car.color && <p>Color: {car.color}</p>}
                {car.transmission && <p>Transmission: {car.transmission}</p>}
                {car.drivetrain && <p>Drivetrain: {car.drivetrain}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
