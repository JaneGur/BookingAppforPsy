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
