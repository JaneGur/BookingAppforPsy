import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking } from '@/types/booking'

// Получить все записи клиента
export function useClientBookings(phone: string | undefined) {
    return useQuery({
        queryKey: ['bookings', 'client', phone].filter((item): item is string => Boolean(item)),
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

// Создать запись (с optimistic update)
export function useCreateBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (booking: Partial<Booking>) => {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to create booking')
            }
            return res.json() as Promise<Booking>
        },
        onMutate: async (newBooking) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey: ['bookings'] })

            // Сохраняем предыдущее состояние для rollback
            const previousBookings = queryClient.getQueryData(['bookings'])

            // Оптимистично добавляем новую запись
            const tempBooking: Booking = {
                id: Date.now(), // временный ID
                ...newBooking,
                status: newBooking.status || 'pending_payment',
                created_at: new Date().toISOString(),
            } as Booking

            queryClient.setQueryData(['bookings'], (old: Booking[] = []) => [tempBooking, ...old])

            return { previousBookings }
        },
        onError: (err, newBooking, context) => {
            // Откатываем изменения
            if (context?.previousBookings) {
                queryClient.setQueryData(['bookings'], context.previousBookings)
            }
        },
        onSettled: () => {
            // Обновляем данные с сервера
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}

// Обновить статус записи (с optimistic update) ⚡
export function useUpdateBookingStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status, paid_at }: { id: number; status: Booking['status']; paid_at?: string }) => {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, paid_at }),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update status')
            }
            return res.json() as Promise<Booking>
        },
        onMutate: async ({ id, status }) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey: ['bookings'] })

            // Сохраняем предыдущие данные
            const previousBookings = queryClient.getQueryData(['bookings'])

            // 🎯 OPTIMISTIC UPDATE - мгновенно обновляем UI
            queryClient.setQueriesData({ queryKey: ['bookings'] }, (old: any) => {
                if (Array.isArray(old)) {
                    return old.map((booking: Booking) =>
                        booking.id === id ? { ...booking, status } : booking
                    )
                }
                return old
            })

            return { previousBookings }
        },
        onError: (err, variables, context) => {
            // ❌ При ошибке - откатываем изменения
            if (context?.previousBookings) {
                queryClient.setQueryData(['bookings'], context.previousBookings)
            }
            console.error('Failed to update booking status:', err)
        },
        onSettled: () => {
            // ✅ Обновляем данные с сервера для синхронизации
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}

// Удалить запись (с optimistic update) ⚡
export function useDeleteBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to delete booking')
            }
            return id
        },
        onMutate: async (id) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey: ['bookings'] })

            // Сохраняем предыдущие данные
            const previousBookings = queryClient.getQueryData(['bookings'])

            // 🎯 OPTIMISTIC UPDATE - мгновенно удаляем из UI
            queryClient.setQueriesData({ queryKey: ['bookings'] }, (old: any) => {
                if (Array.isArray(old)) {
                    return old.filter((booking: Booking) => booking.id !== id)
                }
                return old
            })

            return { previousBookings }
        },
        onError: (err, id, context) => {
            // ❌ При ошибке - откатываем изменения
            if (context?.previousBookings) {
                queryClient.setQueryData(['bookings'], context.previousBookings)
            }
            console.error('Failed to delete booking:', err)
        },
        onSettled: () => {
            // ✅ Обновляем данные с сервера
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}