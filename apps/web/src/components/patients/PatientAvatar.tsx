import { cn } from "@/lib/utils";

interface PatientAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

export function PatientAvatar({ name, size = "md", className }: PatientAvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-interactive/10 text-interactive font-semibold shrink-0",
        sizeClasses[size],
        className
      )}
      aria-label={`Avatar de ${name}`}
    >
      {initials}
    </div>
  );
}
