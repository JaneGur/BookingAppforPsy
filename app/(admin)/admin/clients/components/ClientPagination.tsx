'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClientLoadMoreProps {
    hasMore: boolean
    isLoading: boolean
    isLoadingMore: boolean
    onLoadMore: () => void
    currentCount?: number
    totalCount?: number
}

export default function ClientLoadMore({ 
    hasMore, 
    isLoading, 
    isLoadingMore, 
    onLoadMore,
    currentCount,
    totalCount 
}: ClientLoadMoreProps) {
    if (isLoading || !hasMore) {
        // Показываем информацию о количестве только если есть данные
        if (!isLoading && currentCount !== undefined && totalCount !== undefined) {
            return (
                <div className="flex items-center justify-center mt-6">
                    <div className="text-sm text-gray-600">
                        Показано {currentCount} из {totalCount} клиентов
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="flex items-center justify-center mt-6">
            <Button
                variant="secondary"
                size="lg"
                onClick={onLoadMore}
                disabled={isLoadingMore || !hasMore}
                className="min-w-[200px]"
            >
                {isLoadingMore ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Загрузка...
                    </>
                ) : (
                    'Показать ещё'
                )}
            </Button>
        </div>
    )
}