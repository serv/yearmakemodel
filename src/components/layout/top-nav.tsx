'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Star } from 'lucide-react';

export function TopNav() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year');
  const make = searchParams.get('make');
  const model = searchParams.get('model');

  const activeTags = [year, make, model].filter(Boolean);

  return (
    <div className="w-full h-14 border-b bg-background flex items-center px-4 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="font-bold text-lg mr-4">
          CarForum
        </Link>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-label="Active filters" />
          {activeTags.length > 0 ? (
            activeTags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">All Posts</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-muted-foreground" aria-label="Favorite filters" />
          {/* This would ideally come from user profile/garage */}
          <Link href="/forum?year=2023&make=Toyota&model=Supra">
            <Badge variant="outline" className="cursor-pointer hover:bg-accent">
              My Supra
            </Badge>
          </Link>
        </div>
        <div className="h-6 w-px bg-border mx-2" />
        <Link href="/garage">
          <Button variant="ghost" size="sm">
            My Garage
          </Button>
        </Link>
      </div>
    </div>
  );
}
