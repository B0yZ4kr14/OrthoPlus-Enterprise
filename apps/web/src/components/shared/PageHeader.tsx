import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  iconClassName = "",
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className={`p-3 rounded-xl bg-interactive/10 border border-interactive/20 ${iconClassName}`}>
        <Icon className="h-7 w-7 text-interactive" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">{title}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}