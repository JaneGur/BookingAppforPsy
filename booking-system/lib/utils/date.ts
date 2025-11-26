import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(date: string | Date, pattern = "dd.MM.yyyy"): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern, { locale: ru });
}

export function formatDateRelative(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;

    if (isToday(d)) return `Сегодня`;
    if (isTomorrow(d)) return `Завтра`;

    return formatDate(d, "d MMMM");
}

export function formatTimeUntil(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { locale: ru, addSuffix: true });
}