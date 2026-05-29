import {
  format as dateFnsFormat,
  parseISO,
  isValid,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDate(
  date: string | Date,
  formatStr: string = "dd/MM/yyyy",
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "-";
    return dateFnsFormat(dateObj, formatStr, { locale: ptBR });
  } catch (error) {
    console.error("Error formatting date:", error);
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
    console.error("Error formatting date:", error);
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

export { parseISO, isValid, addDays, subDays, startOfDay, endOfDay, subMonths };
