import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Format date string in Russian locale (e.g., "15 января 2024")
 */
export function formatDateRu(date: string): string {
  return format(parseISO(date), 'd MMMM yyyy', { locale: ru })
}

/**
 * Format time slot for display (e.g., "14:00")
 */
export function formatTimeSlot(time: string): string {
  return time.slice(0, 5) // Extract HH:MM from HH:MM:SS
}

/**
 * Format date and time together in Russian locale
 */
export function formatDateTimeRu(date: string, time: string): string {
  const formattedDate = formatDateRu(date)
  const formattedTime = formatTimeSlot(time)
  return `${formattedDate} в ${formattedTime}`
}
