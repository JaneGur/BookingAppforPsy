import { Client } from '@/types/client'

export type SortField = 'name' | 'created_at' | 'bookings_count' | 'last_booking'
export type SortDirection = 'asc' | 'desc'

export interface ClientsFilters {
    searchQuery: string
    activeOnly: boolean
    withTelegram: boolean
    withEmail: boolean
    dateFrom: string
    dateTo: string
    sortField: SortField
    sortDirection: SortDirection
    currentPage: number
}

export interface ClientsStats {
    total: number
    withTelegram: number
    withEmail: number
    filteredCount: number
}

export interface PaginationData {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
}