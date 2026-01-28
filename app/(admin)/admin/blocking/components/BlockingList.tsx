'use client'

import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Clock, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BlockedSlot } from './types'

interface BlockingListProps {
    isLoading: boolean
    blockedSlots: BlockedSlot[]
    onDelete: (id: number) => Promise<void>
    onDeleteAll: (date: string, slotIds: number[]) => void
    slotsByDate: Map<string, BlockedSlot[]>
}

export default function BlockingList({
                                         isLoading,
                                         blockedSlots,
                                         onDelete,
                                         onDeleteAll,
                                         slotsByDate
                                     }: BlockingListProps) {
    if (isLoading) {
        return (
            <Card className="booking-card">
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                        <span>Заблокированные слоты</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-2 sm:space-y-3">
                                <Skeleton className="h-5 sm:h-6 w-36 sm:w-48" />
                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <Skeleton key={j} className="h-14 sm:h-16 rounded-lg" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (blockedSlots.length === 0) {
        return (
            <Card className="booking-card">
                <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                        <span>Заблокированные слоты</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 sm:py-12 px-4">
                        <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">📭</div>
                        <p className="text-sm sm:text-base text-gray-500">Нет заблокированных слотов</p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-2">
                            Добавьте блокировку, чтобы заблокировать день или время
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card">
            <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                    <span>Заблокированные слоты</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 sm:space-y-4">
                    {Array.from(slotsByDate.entries())
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, slots]) => (
                            <div key={date} className="booking-card p-3 sm:p-4">
                                {/* Заголовок даты */}
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-3">
                                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 min-w-0">
                                        <span className="block xs:hidden">
                                            {format(parseISO(date), 'd MMM yyyy', { locale: ru })}
                                        </span>
                                        <span className="hidden xs:block">
                                            {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                        </span>
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteAll(date, slots.map(s => s.id))}
                                        className="self-start xs:self-auto flex-shrink-0 h-8 text-xs sm:text-sm"
                                    >
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                        <span className="hidden xs:inline">Удалить все</span>
                                        <span className="xs:hidden">Все</span>
                                    </Button>
                                </div>

                                {/* Список слотов */}
                                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                    {slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex-1 min-w-0 mr-2">
                                                <div className="font-medium text-sm sm:text-base text-gray-900 truncate">
                                                    {slot.slot_time}
                                                </div>
                                                {slot.reason && (
                                                    <div className="text-xs text-gray-500 truncate mt-0.5" title={slot.reason}>
                                                        {slot.reason}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(slot.id)}
                                                className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 hover:bg-red-50"
                                            >
                                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                {/* Счетчик слотов */}
                                <div className="text-xs text-gray-500 mt-2 text-right">
                                    Всего: {slots.length} {slots.length === 1 ? 'слот' : slots.length < 5 ? 'слота' : 'слотов'}
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    )
}