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
    // Не показываем ничего во время первоначальной загрузки
    if (isLoading && currentCount === 0) {
        return null
    }

    // Если нет больше данных, показываем информацию о количестве
    if (!hasMore) {
        if (currentCount !== undefined && totalCount !== undefined && totalCount > 0) {
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

    // Показываем кнопку "Показать ещё" если есть еще данные
    return (
        <div className="flex flex-col items-center justify-center mt-6 gap-2">
            <Button
                variant="secondary"
                size="lg"
                onClick={onLoadMore}
                disabled={isLoadingMore || !hasMore}
                className="min-w-[200px] cursor-pointer disabled:cursor-not-allowed"
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
            {currentCount !== undefined && totalCount !== undefined && (
                <div className="text-xs text-gray-500">
                    Показано {currentCount} из {totalCount} клиентов
                </div>
            )}
        </div>
    )
}