'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaginationData } from './types'

interface ClientPaginationProps {
    pagination: PaginationData | null
    isLoading: boolean
    onPageChange: (page: number) => void
}

export default function ClientPagination({ pagination, isLoading, onPageChange }: ClientPaginationProps) {
    if (!pagination || pagination.totalPages <= 1) return null

    const { currentPage, totalPages, totalCount, limit } = pagination
    const startItem = ((currentPage - 1) * limit) + 1
    const endItem = Math.min(currentPage * limit, totalCount)

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
                Показано {startItem} - {endItem} из {totalCount} клиентов
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Назад
                </Button>

                <span className="text-sm font-medium">
                    Страница {currentPage} из {totalPages}
                </span>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isLoading}
                >
                    Вперед
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}