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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        Заблокированные слоты
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 py-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-6 w-48" />
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <Skeleton key={j} className="h-16 rounded-lg" />
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        Заблокированные слоты
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <p className="text-gray-500">Нет заблокированных слотов</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-500" />
                    Заблокированные слоты
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {Array.from(slotsByDate.entries())
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, slots]) => (
                            <div key={date} className="booking-card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteAll(date, slots.map(s => s.id))}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Удалить все
                                    </Button>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {slot.slot_time}
                                                </div>
                                                {slot.reason && (
                                                    <div className="text-xs text-gray-500">{slot.reason}</div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(slot.id)}
                                            >
                                                <X className="h-4 w-4 text-red-500" />
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