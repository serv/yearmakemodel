"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutList, MessageSquare, Bookmark, EyeOff } from "lucide-react";

interface ProfileTabsProps {
  userId: string;
  isOwner: boolean;
}

export function ProfileTabs({ userId, isOwner }: ProfileTabsProps) {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "posts";

  const tabs = [
    {
      id: "posts",
      label: "Posts",
      icon: LayoutList,
      href: `/user/${userId}?view=posts`,
    },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      href: `/user/${userId}?view=comments`,
    },
  ];

  if (isOwner) {
    tabs.push(
      {
        id: "saved",
        label: "Saved",
        icon: Bookmark,
        href: `/user/${userId}?view=saved`,
      },
      {
        id: "hidden",
        label: "Hidden",
        icon: EyeOff,
        href: `/user/${userId}?view=hidden`,
      }
    );
  }

  return (
    <div className="flex border-b w-full overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        const Icon = tab.icon;
        
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
