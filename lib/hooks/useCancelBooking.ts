// lib/hooks/useCancelBooking.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Booking } from '@/types/booking'
import { toast } from 'sonner'

export function useCancelBooking() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            console.log(`🔄 Начинаем отмену записи ${id}...`)

            try {
                const res = await fetch(`/api/bookings/${id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                console.log(`📡 Ответ от сервера: статус ${res.status}`)

                let data
                try {
                    data = await res.json()
                } catch (jsonError) {
                    console.error('❌ Ошибка парсинга JSON:', jsonError)
                    const text = await res.text()
                    console.error('📦 Сырой ответ:', text)
                    throw new Error(`Сервер вернул некорректный ответ: ${text.substring(0, 100)}`)
                }

                console.log(`📊 Данные ответа:`, data)

                if (!res.ok) {
                    console.error(`❌ Ошибка ${res.status}:`, data.error || 'Неизвестная ошибка')
                    throw new Error(data.error || `Ошибка сервера: ${res.status}`)
                }

                console.log(`✅ Запись ${id} успешно отменена`)
                return data
            } catch (error) {
                console.error(`🔥 Критическая ошибка при отмене ${id}:`, error)
                throw error
            }
        },
        onMutate: async (id) => {
            console.log(`⚡ Оптимистичное обновление записи ${id}`)

            await queryClient.cancelQueries({ queryKey: ['bookings'] })

            const previousBookings = queryClient.getQueryData(['bookings'])

            // Оптимистичное обновление статуса на cancelled
            queryClient.setQueryData(['bookings'], (old: any) => {
                if (Array.isArray(old)) {
                    return old.map((booking: Booking) =>
                        booking.id === id ? { ...booking, status: 'cancelled' } : booking
                    )
                }
                return old
            })

            return { previousBookings }
        },
        onError: (err, id, context) => {
            console.error(`❌ Ошибка при отмене записи ${id}:`, err.message)

            // Показываем пользователю понятное сообщение
            const errorMessage = err.message.includes('Сервер вернул некорректный ответ')
                ? 'Ошибка сервера. Попробуйте позже.'
                : err.message

            toast.error(`Не удалось отменить запись: ${errorMessage}`)

            if (context?.previousBookings) {
                console.log(`↩️ Откатываем оптимистичное обновление для записи ${id}`)
                queryClient.setQueryData(['bookings'], context.previousBookings)
            }
        },
        onSuccess: (data, id) => {
            console.log(`🎉 Запись ${id} успешно отменена:`, data.message)
            toast.success(data.message || 'Запись успешно отменена')
        },
        onSettled: () => {
            console.log('🔄 Инвалидируем кэш записей')
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
    })
}