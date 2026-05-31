import {
  format as dateFnsFormat,
  parseISO,
  isValid,
  addDays,
  subDays,
  subHours,
  startOfDay,
  endOfDay,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from "@/lib/logger";

export function formatDate(
  date: string | Date,
  formatStr: string = "dd/MM/yyyy",
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "-";
    return dateFnsFormat(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    logger.error("Error formatting date", error as Error);
    return "-";
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, "dd 'de' MMMM 'de' yyyy");
}

export function formatDateWithWeekday(date: string | Date): string {
  return formatDate(date, "EEEE, dd 'de' MMMM 'de' yyyy");
}

export function formatDateCustom(
  date: string | Date,
  formatStr: string,
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "-";
    return dateFnsFormat(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    logger.error("Error formatting date", error as Error);
    return "-";
  }
}

export function getCurrentDate(): string {
  return dateFnsFormat(new Date(), "yyyy-MM-dd", { locale: ptBR });
}

export function isValidDate(dateString: string): boolean {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch {
    return false;
  }
}

export {
  parseISO,
  isValid,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  subMonths,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
  isAfter,
  isBefore,
  isWithinInterval,
  formatDistanceToNow,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachMonthOfInterval,
  subHours,
};

// Re-export format with the same name for drop-in replacement
export { dateFnsFormat as format };
