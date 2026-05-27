export function getTextColorClass(bgColor: string): string {
  if (bgColor.includes("red")) return "text-destructive dark:text-destructive";
  if (bgColor.includes("orange")) return "text-warning dark:text-orange-400";
  if (bgColor.includes("yellow")) return "text-warning dark:text-warning";
  if (bgColor.includes("lime")) return "text-lime-600 dark:text-lime-400";
  if (bgColor.includes("green")) return "text-success dark:text-success";
  return "text-muted-foreground";
}
