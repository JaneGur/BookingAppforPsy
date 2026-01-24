import { useState, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface InfinityQueryOptions<T> {
    queryKey: string[]
    fetchFn: (page: number, limit: number) => Promise<{
        data: T[]
        hasMore: boolean
        totalCount?: number
    }>
    initialLimit?: number
    limitPerPage?: number
    enabled?: boolean
}

export function useInfinityQuery<T>({
    queryKey,
    fetchFn,
    initialLimit = 5,
    limitPerPage = 5,
    enabled = true
}: InfinityQueryOptions<T>) {
    const [page, setPage] = useState(1)
    const [allData, setAllData] = useState<T[]>([])
    const queryClient = useQueryClient()

    // Стабилизируем queryKey чтобы избежать бесконечных циклов
    const stableQueryKey = useMemo(() => queryKey, [queryKey])

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [...stableQueryKey, page],
        queryFn: () => fetchFn(page, limitPerPage),
        enabled,
        staleTime: 1000 * 60 * 5, // 5 минут
    })

    const loadMore = useCallback(() => {
        if (data?.hasMore && !isLoading) {
            setPage(prev => prev + 1)
        }
    }, [data?.hasMore, isLoading])

    const reset = useCallback(() => {
        setPage(1)
        setAllData([])
        // Инвалидируем только конкретные запросы, не все
        queryClient.invalidateQueries({ queryKey: stableQueryKey })
    }, [stableQueryKey])

    // Обновляем все данные при получении новой страницы
    if (data && data.data) {
        if (page === 1) {
            setAllData(data.data)
        } else {
            setAllData(prev => {
                const newData = [...prev, ...data.data]
                // Удаляем дубликаты по ID если они есть
                const unique = newData.filter((item, index, self) =>
                    index === self.findIndex((t) => (t as any).id === (item as any).id)
                )
                return unique
            })
        }
    }

    return {
        data: allData,
        isLoading,
        error,
        loadMore,
        hasMore: data?.hasMore ?? false,
        totalCount: data?.totalCount,
        reset,
        refetch,
        isInitialLoading: isLoading && page === 1,
        isLoadingMore: isLoading && page > 1
    }
}
