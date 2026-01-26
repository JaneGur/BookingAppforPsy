'use client'

import {RefreshCw, Search, X} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {ClientsFilters} from './types'

interface ClientFiltersProps {
    filters: ClientsFilters
    hasFilters: string | boolean
    onFilterChange: <K extends keyof ClientsFilters>(key: K, value: ClientsFilters[K]) => void
    onReset: () => void
    onRefresh: () => void
    isMobile?: boolean
}

export default function ClientFilters({
                                          filters,
                                          hasFilters,
                                          onFilterChange,
                                          onReset,
                                          onRefresh,
                                          isMobile = false
                                      }: ClientFiltersProps) {
    const checkboxFilters = [
        { key: 'activeOnly' as const, label: 'Активные', mobileLabel: 'Акт.' },
        { key: 'withTelegram' as const, label: 'С Telegram', mobileLabel: 'TG' },
        { key: 'withEmail' as const, label: 'С Email', mobileLabel: 'Email' }
    ]

    if (isMobile) {
        return (
            <div className="space-y-4">
                {/* Поиск */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        value={filters.searchQuery}
                        onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                        placeholder="Поиск клиентов..."
                        className="pl-10 h-10 text-sm"
                    />
                </div>

                {/* Быстрые фильтры */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Быстрые фильтры</p>
                    <div className="flex flex-wrap gap-1.5">
                        {checkboxFilters.map(({ key, label, mobileLabel }) => (
                            <button
                                key={key}
                                onClick={() => onFilterChange(key, !filters[key])}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${filters[key]
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                }`}
                            >
                                <span className={filters[key] ? 'opacity-90' : 'opacity-60'}>
                                    {mobileLabel}
                                </span>
                                {filters[key] && ' ✓'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Дата */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Дата регистрации</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">От</label>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">До</label>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                                className="h-9 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onReset}
                        className="flex-1 text-xs"
                        disabled={!hasFilters}
                    >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Сбросить
                    </Button>
                    <Button
                        onClick={onRefresh}
                        className="flex-1 text-xs"
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                        Обновить
                    </Button>
                </div>
            </div>
        )
    }

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

                {/*/!* Чекбоксы фильтров *!/*/}
                {/*<div className="flex flex-wrap gap-2 sm:gap-3">*/}
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