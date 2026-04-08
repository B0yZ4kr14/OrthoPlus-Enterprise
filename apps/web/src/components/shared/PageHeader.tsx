import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon; // Obrigatório - não mais opcional
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
      <div className={`p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-neon-cyan/10 ${iconClassName} glass`}>
        <Icon className="h-8 w-8 text-primary animate-pulse-soft" />
      </div>
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text neon-glow-cyan">{title}</h1>
        <p className="text-muted-foreground/80 font-medium mt-1">{description}</p>
      </div>
    </div>
  );
}
