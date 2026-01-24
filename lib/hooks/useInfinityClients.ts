import { useInfinityQuery } from './useInfinityQuery'

interface Client {
    id: string
    name: string
    email?: string
    phone: string
    telegram?: string
    role: string
    created_at: string
    updated_at?: string
}

interface UseInfinityClientsOptions {
    search?: string
    activeOnly?: boolean
    sortBy?: string
    sortOrder?: string
    initialLimit?: number
}

export function useInfinityClients(options: UseInfinityClientsOptions = {}) {
    const {
        search,
        activeOnly = false,
        sortBy = 'created_at',
        sortOrder = 'desc',
        initialLimit = 5
    } = options

    return useInfinityQuery<Client>({
        queryKey: ['clients', search, activeOnly?.toString(), sortBy, sortOrder].filter((item): item is string => Boolean(item)),
        fetchFn: async (page: number, limit: number) => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort_by: sortBy || 'created_at',
                sort_order: sortOrder || 'desc'
            })

            if (search) {
                params.append('search', search)
            }

            if (activeOnly) {
                params.append('active_only', 'true')
            }

            const response = await fetch(`/api/admin/clients?${params}`)

            if (!response.ok) {
                throw new Error('Failed to fetch clients')
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
