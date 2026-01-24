// lib/utils/booking-validations.ts
import { supabase } from '@/lib/db'
import {
    differenceInHours,
    differenceInMinutes,
    parseISO,
    isBefore,
    isAfter,
    addHours,
    format as dateFnsFormat,
    startOfDay,
    isToday,
    isTomorrow
} from 'date-fns'
import { ru } from 'date-fns/locale'

// === Типы ============================================================

export interface ClientRescheduleCheck {
    canReschedule: boolean
    hoursUntilBooking: number
    reason: string | null
    deadlineDate: Date
    isPastDeadline: boolean
    deadlineFormatted: string
}

export interface SlotAvailabilityResult {
    available: boolean
    reason: string | null
    conflictingBooking?: {
        id: number
        client_name: string
        status: string
    }
}

export interface RescheduleValidationResult {
    valid: boolean
    errors: string[] | null
    warnings: string[] | null
    dateTime: Date | null
    formatted: {
        date: string
        time: string
        full: string
        iso: string
    } | null
}

export interface MinRescheduleDateTime {
    date: string  // YYYY-MM-DD
    time: string  // HH:MM
    minDateTime: Date
    formatted: {
        date: string
        time: string
        full: string
    }
}

export interface RescheduleDeadline {
    deadline: Date
    formatted: string
    hoursLeft: number
    isPastDeadline: boolean
    urgencyLevel: 'normal' | 'soon' | 'urgent' | 'too_late'
}

// === Основные функции валидации ======================================

/**
 * Проверяет, может ли клиент перенести запись (должно быть > 24 часов до начала)
 */
export function canClientReschedule(
    bookingDate: string,  // YYYY-MM-DD
    bookingTime: string   // HH:MM
): ClientRescheduleCheck {
    const now = new Date()
    const bookingDateTime = parseISO(`${bookingDate}T${bookingTime}`)
    const hoursUntilBooking = Math.max(0, differenceInHours(bookingDateTime, now))
    const minutesUntilBooking = Math.max(0, differenceInMinutes(bookingDateTime, now))

    // Вычисляем дедлайн (за 24 часа до консультации)
    const deadlineDate = addHours(bookingDateTime, -24)
    const isPastDeadline = isBefore(deadlineDate, now)

    // Форматируем дедлайн для отображения
    let deadlineFormatted = ''
    if (isToday(deadlineDate)) {
        deadlineFormatted = `сегодня до ${dateFnsFormat(deadlineDate, 'HH:mm')}`
    } else if (isTomorrow(deadlineDate)) {
        deadlineFormatted = `завтра до ${dateFnsFormat(deadlineDate, 'HH:mm')}`
    } else {
        deadlineFormatted = dateFnsFormat(deadlineDate, 'd MMMM yyyy, HH:mm', { locale: ru })
    }

    // Определяем причину, если нельзя перенести
    let reason: string | null = null
    if (minutesUntilBooking === 0) {
        reason = 'Консультация уже началась'
    } else if (hoursUntilBooking < 24) {
        const hours = Math.floor(hoursUntilBooking)
        const minutes = minutesUntilBooking % 60

        if (hours > 0) {
            reason = `Осталось ${hours} час${hours === 1 ? '' : hours < 5 ? 'а' : 'ов'} ${minutes > 0 ? `${minutes} минут` : ''}. Перенос возможен только за 24 часа.`
        } else {
            reason = `Осталось ${minutes} минут. Перенос возможен только за 24 часа.`
        }
    }

    return {
        canReschedule: hoursUntilBooking >= 24 && !isPastDeadline,
        hoursUntilBooking,
        reason,
        deadlineDate,
        isPastDeadline,
        deadlineFormatted
    }
}

/**
 * Проверяет доступность временного слота
 * @param date YYYY-MM-DD
 * @param time HH:MM
 * @param excludeBookingId ID записи, которую исключаем из проверки (при переносе)
 */
export async function isSlotAvailable(
    date: string,
    time: string,
    excludeBookingId?: number
): Promise<SlotAvailabilityResult> {
    try {
        const slotDateTime = parseISO(`${date}T${time}`)
        const now = new Date()

        // 1. Проверяем, что слот не в прошлом
        if (isBefore(slotDateTime, now)) {
            return {
                available: false,
                reason: 'Нельзя выбрать время в прошлом'
            }
        }

        // 2. Проверяем, что день не заблокирован
        const { data: blockedDay, error: blockedError } = await supabase
            .from('blocked_days')
            .select('id, date, reason')
            .eq('date', date)
            .maybeSingle()

        if (blockedError) {
            console.error('Ошибка при проверке заблокированных дней:', blockedError)
            return {
                available: false,
                reason: 'Ошибка проверки доступности дня'
            }
        }

        if (blockedDay) {
            const dateFormatted = dateFnsFormat(parseISO(blockedDay.date), 'd MMMM yyyy', { locale: ru })
            const reasonText = blockedDay.reason ? ` (${blockedDay.reason})` : ''
            return {
                available: false,
                reason: `${dateFormatted} - выходной день${reasonText}`
            }
        }

        // 3. Проверяем, что слот не занят другой активной записью
        let query = supabase
            .from('bookings')
            .select('id, client_name, status, booking_time, client_phone')
            .eq('booking_date', date)
            .eq('booking_time', time)
            .neq('status', 'cancelled')

        if (excludeBookingId) {
            query = query.neq('id', excludeBookingId)
        }

        const { data: existingBookings, error: bookingsError } = await query

        if (bookingsError) {
            console.error('Ошибка при проверке занятых слотов:', bookingsError)
            return {
                available: false,
                reason: 'Ошибка проверки занятости времени'
            }
        }

        if (existingBookings && existingBookings.length > 0) {
            const booking = existingBookings[0]
            return {
                available: false,
                reason: `Время ${time} занято${booking.client_name ? ` (${booking.client_name})` : ''}`,
                conflictingBooking: {
                    id: booking.id,
                    client_name: booking.client_name || 'Неизвестный клиент',
                    status: booking.status
                }
            }
        }

        // 4. Проверяем, что время рабочее (9:00 - 21:00, например)
        const hour = parseInt(time.split(':')[0])
        if (hour < 9 || hour > 21) {
            return {
                available: false,
                reason: 'Рабочие часы с 9:00 до 21:00'
            }
        }

        // 5. Проверяем, что это не слишком короткий интервал (минимум 1 час от сейчас)
        const oneHourFromNow = addHours(now, 1)
        if (isBefore(slotDateTime, oneHourFromNow)) {
            return {
                available: false,
                reason: 'Нельзя записаться менее чем за 1 час'
            }
        }

        return {
            available: true,
            reason: null
        }

    } catch (error) {
        console.error('Непредвиденная ошибка при проверке слота:', error)
        return {
            available: false,
            reason: 'Внутренняя ошибка при проверке доступности'
        }
    }
}

/**
 * Комплексная валидация новой даты для переноса
 */
export async function validateRescheduleDate(
    date: string,
    time: string,
    isAdmin: boolean = false,
    originalBookingDate?: string,
    originalBookingTime?: string,
    bookingId?: number
): Promise<RescheduleValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    let dateTime: Date | null = null
    let formatted: RescheduleValidationResult['formatted'] | null = null

    // 1. Базовые проверки формата
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const timeRegex = /^\d{2}:\d{2}$/

    if (!dateRegex.test(date)) {
        errors.push('Неверный формат даты. Используйте ГГГГ-ММ-ДД')
    }

    if (!timeRegex.test(time)) {
        errors.push('Неверный формат времени. Используйте ЧЧ:ММ (24-часовой формат)')
    }

    // Если есть ошибки формата - останавливаемся
    if (errors.length > 0) {
        return { valid: false, errors, warnings: null, dateTime: null, formatted: null }
    }

    // 2. Парсим дату-время
    try {
        dateTime = parseISO(`${date}T${time}`)
        const now = new Date()

        // 3. Проверяем, что не в прошлом
        if (isBefore(dateTime, now)) {
            errors.push('Нельзя выбрать время в прошлом')
        }

        // 4. Для клиентов: проверяем минимальное время (24 часа от сейчас)
        if (!isAdmin) {
            const minDateTime = addHours(now, 24)
            if (isBefore(dateTime, minDateTime)) {
                errors.push('Для переноса необходимо выбрать время не раньше чем через 24 часа от текущего момента')
            }
        } else {
            // Для админов: минимум 1 час от сейчас
            const minDateTime = addHours(now, 1)
            if (isBefore(dateTime, minDateTime)) {
                errors.push('Нельзя выбрать время менее чем за 1 час')
            }
        }

        // 5. Для клиентов: проверяем, что оригинальную запись можно перенести
        if (!isAdmin && originalBookingDate && originalBookingTime) {
            const clientCheck = canClientReschedule(originalBookingDate, originalBookingTime)
            if (!clientCheck.canReschedule) {
                errors.push(clientCheck.reason || 'Нельзя перенести запись')
            }
        }

        // 6. Проверяем доступность слота
        const slotAvailable = await isSlotAvailable(date, time, bookingId)
        if (!slotAvailable.available) {
            errors.push(slotAvailable.reason || 'Время недоступно')
        }

        // 7. Предупреждения
        if (originalBookingDate && originalBookingTime) {
            const originalDateTime = parseISO(`${originalBookingDate}T${originalBookingTime}`)
            const hoursDifference = Math.abs(differenceInHours(dateTime, originalDateTime))

            if (hoursDifference < 2) {
                warnings.push('Вы переносите запись менее чем на 2 часа')
            }

            if (hoursDifference > 168) { // 7 дней
                warnings.push('Вы переносите запись более чем на неделю')
            }

            // Если перенос на более раннее время
            if (isBefore(dateTime, originalDateTime)) {
                warnings.push('Вы переносите запись на более раннее время')
            }
        }

        // 8. Форматируем для отображения
        if (errors.length === 0) {
            formatted = {
                date: dateFnsFormat(dateTime, 'd MMMM yyyy', { locale: ru }),
                time: dateFnsFormat(dateTime, 'HH:mm'),
                full: dateFnsFormat(dateTime, 'd MMMM yyyy, HH:mm', { locale: ru }),
                iso: dateTime.toISOString()
            }
        }

    } catch (error) {
        console.error('Ошибка при валидации даты:', error)
        errors.push('Ошибка при обработке даты и времени')
    }

    return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : null,
        warnings: warnings.length > 0 ? warnings : null,
        dateTime,
        formatted
    }
}

/**
 * Получает минимальную дату и время для переноса в зависимости от роли
 */
export function getMinRescheduleDateTime(isAdmin: boolean = false): MinRescheduleDateTime {
    const now = new Date()
    let minDateTime: Date

    if (isAdmin) {
        // Админ: минимум через 1 час
        minDateTime = addHours(now, 1)
    } else {
        // Клиент: минимум через 24 часа
        minDateTime = addHours(now, 24)
    }

    const date = dateFnsFormat(minDateTime, 'yyyy-MM-dd')
    const time = dateFnsFormat(minDateTime, 'HH:mm')

    return {
        date,
        time,
        minDateTime,
        formatted: {
            date: dateFnsFormat(minDateTime, 'd MMMM yyyy', { locale: ru }),
            time: dateFnsFormat(minDateTime, 'HH:mm'),
            full: dateFnsFormat(minDateTime, 'd MMMM yyyy, HH:mm', { locale: ru })
        }
    }
}

/**
 * Рассчитывает крайний срок для переноса (только для клиентов)
 */
export function calculateRescheduleDeadline(
    bookingDate: string,
    bookingTime: string
): RescheduleDeadline {
    const bookingDateTime = parseISO(`${bookingDate}T${bookingTime}`)
    const deadline = addHours(bookingDateTime, -24) // За 24 часа до консультации
    const now = new Date()
    const hoursLeft = Math.max(0, differenceInHours(deadline, now))
    const isPastDeadline = isBefore(deadline, now)

    // Определяем уровень срочности
    let urgencyLevel: RescheduleDeadline['urgencyLevel'] = 'normal'
    if (hoursLeft < 1) {
        urgencyLevel = 'too_late'
    } else if (hoursLeft < 6) {
        urgencyLevel = 'urgent'
    } else if (hoursLeft < 24) {
        urgencyLevel = 'soon'
    }

    // Форматируем дедлайн
    let formatted = ''
    if (isToday(deadline)) {
        formatted = `сегодня до ${dateFnsFormat(deadline, 'HH:mm')}`
    } else if (isTomorrow(deadline)) {
        formatted = `завтра до ${dateFnsFormat(deadline, 'HH:mm')}`
    } else {
        formatted = dateFnsFormat(deadline, 'd MMMM yyyy, HH:mm', { locale: ru })
    }

    return {
        deadline,
        formatted,
        hoursLeft,
        isPastDeadline,
        urgencyLevel
    }
}

/**
 * Проверяет, можно ли создать запись на указанную дату/время
 * (более простая версия, без проверки блокировок дня)
 */
export async function canCreateBooking(
    date: string,
    time: string
): Promise<{ canCreate: boolean; reason?: string }> {
    try {
        const slotAvailable = await isSlotAvailable(date, time)

        if (!slotAvailable.available) {
            return {
                canCreate: false,
                reason: slotAvailable.reason || 'Время недоступно'
            }
        }

        return { canCreate: true }
    } catch (error) {
        console.error('Ошибка при проверке возможности создания записи:', error)
        return {
            canCreate: false,
            reason: 'Ошибка проверки доступности'
        }
    }
}

/**
 * Получает список доступных дат для переноса (ближайшие 30 дней)
 */
export async function getAvailableRescheduleDates(
    excludeDate?: string,
    excludeBookingId?: number
): Promise<{ date: string; formatted: string; isToday: boolean; isTomorrow: boolean }[]> {
    try {
        const now = new Date()
        const today = dateFnsFormat(now, 'yyyy-MM-dd')

        // Получаем ближайшие 30 дней
        const dates: { date: string; formatted: string; isToday: boolean; isTomorrow: boolean }[] = []

        for (let i = 0; i < 30; i++) {
            const date = new Date(now)
            date.setDate(date.getDate() + i)
            const dateStr = dateFnsFormat(date, 'yyyy-MM-dd')

            // Пропускаем исключенную дату
            if (excludeDate === dateStr) {
                continue
            }

            // Проверяем, не заблокирован ли день
            const { data: blockedDay } = await supabase
                .from('blocked_days')
                .select('id')
                .eq('date', dateStr)
                .maybeSingle()

            if (!blockedDay) {
                dates.push({
                    date: dateStr,
                    formatted: dateFnsFormat(date, 'd MMMM yyyy', { locale: ru }),
                    isToday: i === 0,
                    isTomorrow: i === 1
                })
            }
        }

        return dates
    } catch (error) {
        console.error('Ошибка при получении доступных дат:', error)
        return []
    }
}

/**
 * Форматирует интервал времени для отображения
 */
export function formatTimeInterval(date: string, time: string): {
    full: string
    dateOnly: string
    timeOnly: string
    relative: string
} {
    const dateTime = parseISO(`${date}T${time}`)
    const now = new Date()
    const hoursUntil = Math.max(0, differenceInHours(dateTime, now))

    let relative = ''
    if (hoursUntil < 1) {
        const minutes = Math.max(0, differenceInMinutes(dateTime, now))
        relative = `через ${minutes} мин`
    } else if (hoursUntil < 24) {
        relative = `через ${hoursUntil} час${hoursUntil === 1 ? '' : hoursUntil < 5 ? 'а' : 'ов'}`
    } else if (hoursUntil < 48) {
        relative = 'завтра'
    } else {
        const days = Math.floor(hoursUntil / 24)
        relative = `через ${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}`
    }

    return {
        full: dateFnsFormat(dateTime, 'd MMMM yyyy, HH:mm', { locale: ru }),
        dateOnly: dateFnsFormat(dateTime, 'd MMMM yyyy', { locale: ru }),
        timeOnly: dateFnsFormat(dateTime, 'HH:mm'),
        relative
    }
}