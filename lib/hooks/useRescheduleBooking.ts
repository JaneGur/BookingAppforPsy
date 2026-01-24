import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Booking } from '@/types/booking'

export interface RescheduleInfoResponse {
  canReschedule: boolean
  reasons: string[] | null
  warnings: string[] | null
  minRescheduleDate: string | null
  minRescheduleTime: string | null
  booking?: {
    id: number
    booking_date: string
    booking_time: string
    status: Booking['status']
    client_name: string
    product_name?: string
    amount?: number
    hours_until_booking: number
    is_admin: boolean
    can_reschedule_until: string | null
  }
}

export function useRescheduleInfo(bookingId: number | undefined) {
  return useQuery({
    queryKey: ['bookings', bookingId, 'reschedule-info'],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, { method: 'GET' })
      if (!res.ok) {
        const err = await res.json().catch(() => null) as any
        throw new Error(err?.error || 'Failed to fetch reschedule info')
      }
      return res.json() as Promise<RescheduleInfoResponse>
    },
    enabled: typeof bookingId === 'number' && Number.isFinite(bookingId),
  })
}

export function useRescheduleBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { bookingId: number; newDate: string; newTime: string }) => {
      const res = await fetch(`/api/bookings/${params.bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_date: params.newDate, new_time: params.newTime }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null) as any
        throw new Error(err?.error || 'Не удалось перенести запись')
      }
      return res.json() as Promise<{ success: true; booking: Booking }>
    },
    onSuccess: (_data, variables) => {
      // Обновляем все списки/карточки записей
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings', variables.bookingId, 'reschedule-info'] })
    },
  })
}

