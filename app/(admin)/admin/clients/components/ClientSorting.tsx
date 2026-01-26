'use client'

import { ArrowUpDown, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SortField, SortDirection } from './types'

interface ClientSortingProps {
    sortField: SortField
    sortDirection: SortDirection
    onSort: (field: SortField) => void
    onOpenMobileFilters?: () => void
}

export default function ClientSorting({
                                          sortField,
                                          sortDirection,
                                          onSort,
                                          onOpenMobileFilters
                                      }: ClientSortingProps) {
    const sortOptions = [
        { field: 'name' as SortField, label: 'По имени', mobileLabel: 'Имя' },
        { field: 'created_at' as SortField, label: 'По дате регистрации', mobileLabel: 'Дата' },
    ]

    return (
        <>
            {/* Мобильная версия */}
            <Card className="md:hidden border-2 border-gray-200 bg-white shadow-sm">
                <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onOpenMobileFilters}
                            className="flex-1"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Фильтры и сортировка
                        </Button>
                        <div className="text-xs text-gray-600">
                            {sortField === 'name' ? 'По имени' : 'По дате'}
                            {sortDirection === 'desc' ? ' ↓' : ' ↑'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Десктоп версия */}
            <Card className="hidden md:block booking-card border-2">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 mr-2">Сортировка:</span>
                        {sortOptions.map(({ field, label }) => (
                            <button
                                key={field}
                                onClick={() => onSort(field)}
                                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${sortField === field
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {label}
                                {sortField === field && (
                                    <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </>
    )
}