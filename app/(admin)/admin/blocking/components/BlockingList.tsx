'use client'

import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Clock, Trash2, X } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
            <Card className="booking-card border-0 shadow-lg sm:border sm:shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-gray-900">Заблокированные слоты</h2>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-5 w-40 rounded" />
                                <div className="space-y-2">
                                    {Array.from({ length: 2 }).map((_, j) => (
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
            <Card className="booking-card border-0 shadow-lg sm:border sm:shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-gray-900">Заблокированные слоты</h2>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Clock className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Нет заблокированных слотов</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card border-0 shadow-lg sm:border sm:shadow-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-bold text-gray-900">Заблокированные слоты</h2>
                    </div>
                    <div className="text-sm text-gray-500">
                        {blockedSlots.length} всего
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {Array.from(slotsByDate.entries())
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, slots]) => (
                            <div key={date} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDeleteAll(date, slots.map(s => s.id))}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {slots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-gray-900">
                                                        {slot.slot_time || 'Весь день'}
                                                    </div>
                                                    {(!slot.slot_time || slot.slot_time.trim() === '') && (
                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                                           Весь день
                                                        </span>
                                                    )}
                                                </div>
                                                {slot.reason && (
                                                    <div className="text-sm text-gray-500 truncate mt-1">
                                                        {slot.reason}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(slot.id)}
                                                className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
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