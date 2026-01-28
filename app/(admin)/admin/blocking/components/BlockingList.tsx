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
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                        <span className="text-sm sm:text-base">Заблокированные слоты</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4 py-2 sm:py-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-5 w-32 sm:h-6 sm:w-48" />
                                <div className="grid gap-2">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-12 sm:h-16 rounded-lg" />
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
                <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                        <span className="text-sm sm:text-base">Заблокированные слоты</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="text-center py-8 sm:py-12">
                        <p className="text-gray-500 text-sm">Нет заблокированных слотов</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                    <span className="text-sm sm:text-base">Заблокированные слоты</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-3 sm:space-y-4">
                    {Array.from(slotsByDate.entries())
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, slots]) => (
                            <div key={date} className="booking-card p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 sm:mb-3">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                                        {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteAll(date, slots.map(s => s.id))}
                                        className="h-8 text-xs sm:text-sm"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                        Удалить все
                                    </Button>
                                </div>
                                <div className="space-y-2 sm:space-y-2">
                                    {slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                                    {slot.slot_time || 'Весь день'}
                                                </div>
                                                {slot.reason && (
                                                    <div className="text-xs text-gray-500 truncate">{slot.reason}</div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(slot.id)}
                                                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                                            >
                                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    )
}