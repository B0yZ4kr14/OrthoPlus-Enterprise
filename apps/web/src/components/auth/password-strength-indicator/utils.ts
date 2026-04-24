export function getTextColorClass(bgColor: string): string {
  if (bgColor.includes("red")) return "text-red-600 dark:text-red-400";
  if (bgColor.includes("orange")) return "text-orange-600 dark:text-orange-400";
  if (bgColor.includes("yellow")) return "text-yellow-600 dark:text-yellow-400";
  if (bgColor.includes("lime")) return "text-lime-600 dark:text-lime-400";
  if (bgColor.includes("green")) return "text-green-600 dark:text-green-400";
  return "text-muted-foreground";
}
