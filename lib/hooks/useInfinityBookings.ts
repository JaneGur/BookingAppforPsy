import { useInfinityQuery } from './useInfinityQuery'

interface Booking {
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
    products?: {
        name: string
        price_rub: number
    }
    clients?: {
        name: string
        email: string
        phone: string
    }
}

interface UseInfinityBookingsOptions {
    clientId?: string
    status?: string
    sortBy?: string
    sortOrder?: string
    initialLimit?: number
}

export function useInfinityBookings(options: UseInfinityBookingsOptions = {}) {
    const {
        clientId,
        status,
        sortBy = 'created_at',
        sortOrder = 'desc',
        initialLimit = 5
    } = options

    return useInfinityQuery<Booking>({
        queryKey: ['bookings', clientId, status, sortBy, sortOrder],
        fetchFn: async (page: number, limit: number) => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by: sortBy || 'created_at',
                sort_order: sortOrder || 'desc'
            })

            if (clientId) {
                params.append('client_id', clientId)
            }

            if (status) {
                params.append('status', status)
            }

            const response = await fetch(`/api/bookings?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch bookings')
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
