'use client'

import { ArrowUpDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SortField, SortDirection } from './types'

interface ClientSortingProps {
    sortField: SortField
    sortDirection: SortDirection
    onSort: (field: SortField) => void
}

export default function ClientSorting({ sortField, sortDirection, onSort }: ClientSortingProps) {
    const sortOptions = [
        { field: 'name' as SortField, label: 'По имени' },
        { field: 'created_at' as SortField, label: 'По дате регистрации' },
    ]

    return (
        <Card className="booking-card border-2">
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
    )
}