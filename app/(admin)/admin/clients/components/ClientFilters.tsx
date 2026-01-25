'use client'

import { Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientsFilters } from './types'

interface ClientFiltersProps {
    filters: ClientsFilters
    hasFilters: string | boolean
    onFilterChange: <K extends keyof ClientsFilters>(key: K, value: ClientsFilters[K]) => void
    onReset: () => void
    onRefresh: () => void
}

export default function ClientFilters({
                                          filters,
                                          hasFilters,
                                          onFilterChange,
                                          onReset,
                                          onRefresh
                                      }: ClientFiltersProps) {
    const checkboxFilters = [
        { key: 'activeOnly' as const, label: 'Активные' },
        { key: 'withTelegram' as const, label: 'С Telegram' },
        { key: 'withEmail' as const, label: 'С Email' }
    ]

    return (
        <Card className="booking-card border-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Поиск и фильтры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Поиск */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                        value={filters.searchQuery}
                        onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                        placeholder="Поиск по имени, телефону, email..."
                        className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                    />
                </div>

                {/* Чекбоксы фильтров */}
                {/*<div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">*/}
                {/*    {checkboxFilters.map(({ key, label }) => (*/}
                {/*        <label key={key} className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">*/}
                {/*            <input*/}
                {/*                type="checkbox"*/}
                {/*                checked={filters[key]}*/}
                {/*                onChange={(e) => onFilterChange(key, e.target.checked)}*/}
                {/*                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"*/}
                {/*            />*/}
                {/*            <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>*/}
                {/*        </label>*/}
                {/*    ))}*/}
                {/*</div>*/}

                {/* Дата регистрации */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">От даты</label>
                        <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                            className="h-10 sm:h-11"
                        />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">До даты</label>
                        <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => onFilterChange('dateTo', e.target.value)}
                            className="h-10 sm:h-11"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={onRefresh}>
                        Обновить
                    </Button>
                    {hasFilters && (
                        <Button variant="ghost" size="sm" onClick={onReset}>
                            Сбросить все
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}