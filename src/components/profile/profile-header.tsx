import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    username: string | null;
    image: string | null;
    createdAt: Date;
    karma: number;
    emailVerified: boolean;
  };
  isOwner?: boolean;
}

export function ProfileHeader({ user, isOwner = false }: ProfileHeaderProps) {
  const displayName = user.username || user.name;
  const initials = user.username 
    ? user.username.slice(0, 2).toUpperCase() 
    : user.name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 bg-card rounded-lg border shadow-sm">
      <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary">
        <AvatarImage src={user.image || ""} alt={displayName} />
        <AvatarFallback className="text-4xl">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-bold">{displayName}</h1>
        {isOwner && user.username && (
          <p className="text-sm text-muted-foreground">Full name: {user.name}</p>
        )}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-foreground">{user.karma}</span> Karma
          </div>
          <div className="flex items-center gap-1">
            <span>Joined {format(new Date(user.createdAt), "MMMM d, yyyy")}</span>
          </div>
        </div>
        {user.emailVerified && (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Verified Email
          </div>
        )}
      </div>
    </div>
  );
}
