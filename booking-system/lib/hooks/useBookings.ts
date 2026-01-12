import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking } from '@/types/booking'

// Получить все записи клиента
export function useClientBookings(phone: string | undefined) {
    return useQuery({
        queryKey: ['bookings', 'client', phone],
        queryFn: async () => {
            const res = await fetch(`/api/bookings?phone=${phone}`)
            if (!res.ok) throw new Error('Failed to fetch bookings')
            return res.json() as Promise<Booking[]>
        },
        enabled: !!phone,
    })
}

// Получить ближайшую запись
export function useUpcomingBooking(phone: string | undefined) {
    return useQuery({
        queryKey: ['bookings', 'upcoming', phone],
        queryFn: async () => {
            const res = await fetch(`/api/bookings/upcoming?phone=${phone}`)
            if (!res.ok) return null
            return res.json() as Promise<Booking | null>
        },
        enabled: !!phone,
    })
}

// Получить заказ в ожидании оплаты
export function usePendingBooking(phone: string | undefined) {
    return useQuery({
        queryKey: ['bookings', 'pending', phone],
        queryFn: async () => {
            const res = await fetch(`/api/bookings/pending?phone=${phone}`)
            if (!res.ok) return null
            return res.json() as Promise<Booking | null>
        },
        enabled: !!phone,
    })
}

// Создать запись
export function useCreateBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (booking: Partial<Booking>) => {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking),
            })
            if (!res.ok) throw new Error('Failed to create booking')
            return res.json() as Promise<Booking>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}

// Отменить запись
export function useCancelBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, phone }: { id: number; phone: string }) => {
            const res = await fetch(`/api/bookings/${id}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            })
            if (!res.ok) throw new Error('Failed to cancel booking')
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}
