import { useInfinityQuery } from './useInfinityQuery'

interface AdminBooking {
    id: number
    booking_date: string
    booking_time: string
    client_name: string
    client_phone: string
    client_email?: string
    client_telegram?: string
    status: string
    amount: number
    product_id: number
    created_at: string
    client?: {
        id: string
        name: string
        phone: string
        email?: string
        telegram?: string
        telegram_chat_id?: string
        created_at: string
        updated_at?: string
    }
    products?: {
        name: string
        price_rub: number
    }
}

interface UseInfinityAdminBookingsOptions {
    status?: string
    search?: string
    startDate?: string
    endDate?: string
    clientId?: string
    sortBy?: string
    sortOrder?: string
    initialLimit?: number
}

export function useInfinityAdminBookings(options: UseInfinityAdminBookingsOptions = {}) {
    const {
        status,
        search,
        startDate,
        endDate,
        clientId,
        sortBy = 'booking_date',
        sortOrder = 'desc',
        initialLimit = 5
    } = options

    return useInfinityQuery<AdminBooking>({
        queryKey: ['admin-bookings', status, search, startDate, endDate, clientId, sortBy, sortOrder].filter((item): item is string => Boolean(item)),
        fetchFn: async (page: number, limit: number) => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by: sortBy || 'booking_date',
                sort_order: sortOrder || 'desc'
            })

            if (status) {
                params.append('status', status)
            }

            if (search) {
                params.append('search', search)
            }

            if (startDate) {
                params.append('start_date', startDate)
            }

            if (endDate) {
                params.append('end_date', endDate)
            }

            if (clientId) {
                params.append('client_id', clientId)
            }

            const response = await fetch(`/api/admin/bookings?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch admin bookings')
            }

            const result = await response.json()

            return {
                data: result.data || [],
                hasMore: result.pagination?.hasMore || false,
                totalCount: result.pagination?.totalCount || 0
            }
        },
        initialLimit
    })
}
