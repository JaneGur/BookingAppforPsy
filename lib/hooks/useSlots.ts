import { useQuery } from '@tanstack/react-query'

// Получить доступные слоты для даты
export function useAvailableSlots(date: string | undefined) {
    return useQuery({
        queryKey: ['slots', 'available', date],
        queryFn: async () => {
            const res = await fetch(`/api/slots/available?date=${date}`)
            if (!res.ok) throw new Error('Failed to fetch slots')
            return res.json() as Promise<string[]>
        },
        enabled: !!date,
    })
}

/**
 * Доступные слоты для переноса:
 * - берем публичные слоты
 * - если пользователь смотрит исходную дату записи, добавляем исходное время (оно может быть "занято" самим собой)
 */
export function useAvailableSlotsForReschedule(args: {
    date: string | undefined
    originalDate: string
    originalTime: string
}) {
    const { date, originalDate, originalTime } = args

    return useQuery({
        queryKey: ['slots', 'available', 'reschedule', date, originalDate, originalTime],
        queryFn: async () => {
            if (!date) return [] as string[]
            const res = await fetch(`/api/slots/available?date=${date}`)
            if (!res.ok) throw new Error('Failed to fetch slots')
            const slots = (await res.json()) as string[]
            if (date === originalDate && originalTime) {
                const t = String(originalTime).slice(0, 5)
                if (!slots.includes(t)) return [t, ...slots].sort()
            }
            return slots
        },
        enabled: !!date,
    })
}