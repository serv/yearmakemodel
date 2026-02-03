'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Star, X, User, LogOut, Settings, Menu, CarFront } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth-client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type Session = typeof authClient.$Infer.Session;

type Car = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
};

export function TopNav({
  favorites = [],
  session,
}: {
  favorites?: Car[];
  session: Session | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const year = searchParams.get('year');
  const make = searchParams.get('make');
  const model = searchParams.get('model');

  const activeTags = [
    { key: 'year', value: year },
    { key: 'make', value: make },
    { key: 'model', value: model },
  ].filter((tag): tag is { key: string; value: string } => Boolean(tag.value));

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full h-14 border-b bg-background flex items-center px-4 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
        <Link href="/" className="font-bold text-base sm:text-lg flex-shrink-0">
          yearmnm
        </Link>
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          <Filter
            className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"
            aria-label="Active filters"
          />
          {activeTags.length > 0 ? (
            <div className="flex gap-1.5" key="active-tags-container">
              {activeTags.map((tag) => (
                <Badge
                  key={tag.key}
                  variant="secondary"
                  className="text-[10px] sm:text-xs flex items-center gap-1 whitespace-nowrap px-1.5 py-0"
                >
                  {tag.value}
                  <button
                    onClick={() => removeFilter(tag.key)}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="sr-only">Remove {tag.key} filter</span>
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <span
              className="text-[10px] sm:text-sm text-muted-foreground italic whitespace-nowrap"
              key="no-filters"
            >
              All Posts
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-muted-foreground" aria-label="Favorite filters" />
            {favorites.length > 0 ? (
              favorites.map((car) => (
                <Link
                  key={`${car.id}-${car.year}-${car.make}-${car.model}`}
                  href={`/?year=${car.year}&make=${car.make}&model=${car.model}`}
                >
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs">
                    {car.year} {car.make} {car.model}
                  </Badge>
                </Link>
              ))
            ) : (
              <span className="text-xs text-muted-foreground italic">No favorites</span>
            )}
          </div>
          <div className="h-6 w-px bg-border mx-1" />
          <Link href="/garage">
            <Button variant="ghost" size="sm">
              <CarFront className="mr-2 h-4 w-4" />
              My Garage
            </Button>
          </Link>
          <div className="h-6 w-px bg-border mx-1" />
        </div>

        {/* User Account / Sign In */}
        <div className="flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback>{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/user/${session.user.id}`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={async () => {
                    await authClient.signOut();
                    router.refresh();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/sign-in">
              <Button size="sm">Sign In</Button>
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-8">
                  <Link href="/garage" className="flex items-center text-lg font-medium">
                    <CarFront className="mr-2 h-5 w-5" />
                    My Garage
                  </Link>
                  <div className="h-px bg-border" />
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Star className="h-4 w-4" /> Favorites
                    </h4>
                    {favorites.length > 0 ? (
                      <div className="grid gap-2">
                        {favorites.map((car) => (
                          <Link
                            key={`mobile-fav-${car.id}-${car.year}-${car.make}-${car.model}`}
                            href={`/?year=${car.year}&make=${car.make}&model=${car.model}`}
                            className="bg-muted/50 p-2 rounded-md hover:bg-muted transition-colors text-sm"
                          >
                            {car.year} {car.make} {car.model}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No favorites yet</p>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}
