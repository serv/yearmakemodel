import { getUserCars, deleteCar } from '@/app/actions/cars';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getCarMakeIcon } from '@/lib/car-make-icons';
import { Trash2, Pencil, CarFront, ArrowUpDown } from 'lucide-react';

export default async function GaragePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  const cars = await getUserCars(session.user.id);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Garage</h1>
          <p className="text-muted-foreground mt-1">Manage your collection of vehicles</p>
        </div>
        <Link href="/garage/add">
          <Button>+ Add Car</Button>
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/5">
          <div className="p-4 bg-muted rounded-full mb-4">
            <CarFront className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No cars yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Add your first car to start tracking your vehicle history and modifications.
          </p>
          <Link href="/garage/add">
            <Button>Add Your First Car</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => {
            const MakeIcon = getCarMakeIcon(car.make);

            return (
              <Card key={car.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 bg-muted/30 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      {MakeIcon ? (
                        <div className="p-2 bg-background rounded-lg border shadow-sm">
                          <MakeIcon className="h-12 w-12" />
                        </div>
                      ) : (
                        <div className="p-2 bg-background rounded-lg border shadow-sm">
                          <CarFront className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {car.year} {car.make} {car.model}
                        </CardTitle>
                        {car.trim && (
                          <Badge variant="secondary" className="mt-1 font-normal text-xs">
                            {car.trim}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 -mr-2 -mt-1">
                      <Link href={`/garage/edit/${car.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit car</span>
                        </Button>
                      </Link>
                      <form action={deleteCar.bind(null, car.id)}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete car</span>
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-y-2 text-sm">
                  {car.color && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                        Color
                      </span>
                      <span className="font-medium">{car.color}</span>
                    </div>
                  )}
                  {car.transmission && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                        Transmission
                      </span>
                      <span className="font-medium flex items-center gap-1">
                        {car.transmission === 'Manual' && <ArrowUpDown className="h-3 w-3" />}
                        {car.transmission}
                      </span>
                    </div>
                  )}
                  {car.drivetrain && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-muted-foreground block text-xs uppercase tracking-wider">
                        Drivetrain
                      </span>
                      <span className="font-medium">{car.drivetrain}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
