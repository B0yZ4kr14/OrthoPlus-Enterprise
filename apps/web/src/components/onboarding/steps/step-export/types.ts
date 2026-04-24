import type { LucideIcon } from "lucide-react";

export interface NextStep {
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
  badge: string;
}

export interface ResourceItem {
  title: string;
  description: string;
}
