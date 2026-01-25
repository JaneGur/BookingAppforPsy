'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { startOfDay, endOfDay } from 'date-fns'
import { Client } from '@/types/client'
import { ClientsFilters, ClientsStats, PaginationData, SortField, SortDirection } from '../components/types'

const CLIENTS_PER_PAGE = 10

export function useClientsData(initialFilters?: Partial<ClientsFilters>) {
    const [clients, setClients] = useState<Client[]>([])
    const [fullStats, setFullStats] = useState<ClientsStats | null>(null)
    const [pagination, setPagination] = useState<PaginationData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const currentPageRef = useRef(1)
    const filtersRef = useRef<ClientsFilters>({
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
    const [filters, setFilters] = useState<ClientsFilters>(filtersRef.current)

    const loadClients = useCallback(async (page: number = 1, append: boolean = false) => {
        if (append) {
            setIsLoadingMore(true)
        } else {
            setIsLoading(true)
        }
        
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: CLIENTS_PER_PAGE.toString(),
                sort_by: filters.sortField,
                sort_order: filters.sortDirection
            })

            if (filters.searchQuery) {
                params.append('search', filters.searchQuery)
            }
            if (filters.activeOnly) {
                params.append('activeOnly', 'true')
            }
            if (filters.withTelegram) {
                params.append('withTelegram', 'true')
            }
            if (filters.withEmail) {
                params.append('withEmail', 'true')
            }
            if (filters.dateFrom) {
                params.append('dateFrom', filters.dateFrom)
            }
            if (filters.dateTo) {
                params.append('dateTo', filters.dateTo)
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to load clients')
            const result = await res.json()

            const newClients = result.data || []
            
            if (append) {
                // Добавляем новые клиенты к существующим, избегая дубликатов
                setClients(prev => {
                    const existingIds = new Set(prev.map(c => c.id))
                    const uniqueNewClients = newClients.filter((c: Client) => !existingIds.has(c.id))
                    return [...prev, ...uniqueNewClients]
                })
            } else {
                // Заменяем всех клиентов при первой загрузке или смене фильтров
                setClients(newClients)
            }
            
            setPagination(result.pagination)
            setHasMore(result.pagination?.hasMore || false)
            currentPageRef.current = page
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [
        filters.searchQuery,
        filters.activeOnly,
        filters.withTelegram,
        filters.withEmail,
        filters.dateFrom,
        filters.dateTo,
        filters.sortField,
        filters.sortDirection
    ])

    const loadMore = useCallback(() => {
        if (hasMore && !isLoading && !isLoadingMore) {
            loadClients(currentPageRef.current + 1, true)
        }
    }, [hasMore, isLoading, isLoadingMore, loadClients])

    const filterClients = useCallback((clientsList: Client[], currentFilters: ClientsFilters) => {
        let result = [...clientsList]

        if (currentFilters.withTelegram) {
            result = result.filter(c => c.telegram_chat_id || c.telegram)
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
            if (filters.withTelegram) {
                params.append('withTelegram', 'true')
            }
            if (filters.withEmail) {
                params.append('withEmail', 'true')
            }
            if (filters.dateFrom) {
                params.append('dateFrom', filters.dateFrom)
            }
            if (filters.dateTo) {
                params.append('dateTo', filters.dateTo)
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
    }, [
        filters.searchQuery,
        filters.activeOnly,
        filters.withTelegram,
        filters.withEmail,
        filters.dateFrom,
        filters.dateTo,
        filters.sortField,
        filters.sortDirection,
        filterClients
    ])


    const updateFilter = useCallback(<K extends keyof ClientsFilters>(key: K, value: ClientsFilters[K]) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value, currentPage: 1 }
            filtersRef.current = newFilters
            // Сбрасываем накопленные данные при изменении фильтров
            currentPageRef.current = 1
            setClients([])
            setHasMore(false)
            return newFilters
        })
    }, [])

    const resetFilters = useCallback(() => {
        const resetFilters = {
            searchQuery: '',
            activeOnly: false,
            withTelegram: false,
            withEmail: false,
            dateFrom: '',
            dateTo: '',
            sortField: 'created_at' as SortField,
            sortDirection: 'desc' as SortDirection,
            currentPage: 1
        }
        filtersRef.current = resetFilters
        currentPageRef.current = 1
        setClients([])
        setHasMore(false)
        setFilters(resetFilters)
    }, [])

    const hasFilters = useCallback(() => {
        return !!filters.searchQuery || filters.activeOnly || filters.withTelegram ||
            filters.withEmail || filters.dateFrom || filters.dateTo
    }, [filters])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            currentPageRef.current = 1
            loadClients(1, false)
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [
        filters.searchQuery,
        filters.activeOnly,
        filters.withTelegram,
        filters.withEmail,
        filters.dateFrom,
        filters.dateTo,
        filters.sortField,
        filters.sortDirection,
        loadClients
    ])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadFullStats()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [
        filters.searchQuery,
        filters.activeOnly,
        filters.withTelegram,
        filters.withEmail,
        filters.dateFrom,
        filters.dateTo,
        filters.sortField,
        filters.sortDirection,
        loadFullStats
    ])

    return {
        clients,
        fullStats,
        pagination,
        isLoading,
        isLoadingMore,
        hasMore,
        filters,
        loadClients,
        loadMore,
        loadFullStats,
        updateFilter,
        resetFilters,
        hasFilters: hasFilters(),
        filterClients: (clientsList: Client[]) => filterClients(clientsList, filters)
    }
}