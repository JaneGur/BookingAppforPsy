'use client'

import { useState, useEffect, useCallback } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { Client } from '@/types/client'
import { ClientsFilters, ClientsStats, PaginationData } from '../components/types'

export function useClientsData(initialFilters?: Partial<ClientsFilters>) {
    const [clients, setClients] = useState<Client[]>([])
    const [fullStats, setFullStats] = useState<ClientsStats | null>(null)
    const [pagination, setPagination] = useState<PaginationData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [filters, setFilters] = useState<ClientsFilters>({
        searchQuery: '',
        activeOnly: false,
        withTelegram: false,
        withEmail: false,
        dateFrom: '',
        dateTo: '',
        sortField: 'created_at',
        sortDirection: 'desc',
        currentPage: 1,
        ...initialFilters
    })

    const loadClients = useCallback(async (page: number = 1, resetSearch: boolean = false) => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5',
                sort_by: filters.sortField,
                sort_order: filters.sortDirection
            })

            if (filters.searchQuery && !resetSearch) {
                params.append('search', filters.searchQuery)
                params.set('limit', '1000')
            }
            if (filters.activeOnly) {
                params.append('activeOnly', 'true')
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to load clients')
            const result = await res.json()

            setClients(result.data || [])
            setPagination(result.pagination)
            setFilters(prev => ({ ...prev, currentPage: page }))
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filters.searchQuery, filters.activeOnly, filters.sortField, filters.sortDirection])

    const loadFullStats = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                limit: '10000',
                sort_by: filters.sortField,
                sort_order: filters.sortDirection
            })

            if (filters.searchQuery) {
                params.append('search', filters.searchQuery)
            }
            if (filters.activeOnly) {
                params.append('activeOnly', 'true')
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to load full client stats')
            const result = await res.json()

            const allClients: Client[] = result.data || []
            const filteredClients = filterClients(allClients, filters)

            setFullStats({
                total: allClients.length,
                withTelegram: allClients.filter((c: Client) => c.telegram_chat_id).length,
                withEmail: allClients.filter((c: Client) => c.email).length,
                filteredCount: filteredClients.length
            })
        } catch (error) {
            console.error('Error loading full client stats:', error)
        }
    }, [filters])

    const filterClients = useCallback((clientsList: Client[], currentFilters: ClientsFilters) => {
        let result = [...clientsList]

        if (currentFilters.withTelegram) {
            result = result.filter(c => c.telegram_chat_id)
        }

        if (currentFilters.withEmail) {
            result = result.filter(c => c.email)
        }

        if (currentFilters.dateFrom) {
            const from = startOfDay(new Date(currentFilters.dateFrom))
            result = result.filter(c => new Date(c.created_at) >= from)
        }

        if (currentFilters.dateTo) {
            const to = endOfDay(new Date(currentFilters.dateTo))
            result = result.filter(c => new Date(c.created_at) <= to)
        }

        return result
    }, [])

    const updateFilter = useCallback(<K extends keyof ClientsFilters>(key: K, value: ClientsFilters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value, currentPage: 1 }))
    }, [])

    const resetFilters = useCallback(() => {
        setFilters({
            searchQuery: '',
            activeOnly: false,
            withTelegram: false,
            withEmail: false,
            dateFrom: '',
            dateTo: '',
            sortField: 'created_at',
            sortDirection: 'desc',
            currentPage: 1
        })
    }, [])

    const hasFilters = useCallback(() => {
        return !!filters.searchQuery || filters.activeOnly || filters.withTelegram ||
            filters.withEmail || filters.dateFrom || filters.dateTo
    }, [filters])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadClients(1, true)
            loadFullStats()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [filters.searchQuery, filters.activeOnly, filters.sortField, filters.sortDirection])

    return {
        clients,
        fullStats,
        pagination,
        isLoading,
        filters,
        loadClients,
        loadFullStats,
        updateFilter,
        resetFilters,
        hasFilters: hasFilters(),
        filterClients: (clientsList: Client[]) => filterClients(clientsList, filters)
    }
}