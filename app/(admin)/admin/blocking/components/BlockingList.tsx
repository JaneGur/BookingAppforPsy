'use client'

import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Clock, Trash2 } from 'lucide-react'
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
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                        📋 Заблокированные слоты
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-2 sm:space-y-3">
                            <Skeleton className="h-6 sm:h-7 w-40 sm:w-48 bg-slate-200/70" />
                            <div className="space-y-2">
                                {Array.from({ length: 2 }).map((_, j) => (
                                    <Skeleton
                                        key={j}
                                        className="h-16 sm:h-20 w-full rounded-lg sm:rounded-xl bg-slate-200/70"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (blockedSlots.length === 0) {
        return (
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                        📋 Заблокированные слоты
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                        <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 opacity-50">📭</div>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">
                            Нет заблокированных слотов
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                            Создайте первую блокировку
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                    📋 Заблокированные слоты
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
                {Array.from(slotsByDate.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([date, slots]) => (
                        <div key={date} className="space-y-2 sm:space-y-3">
                            {/* Заголовок даты */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b-2 border-slate-100">
                                <h3 className="text-sm sm:text-base font-bold text-slate-800 capitalize">
                                    {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                </h3>
                                <Button
                                    onClick={() => onDeleteAll(date, slots.map(s => s.id))}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                                    <span className="hidden xs:inline">Удалить все</span>
                                    <span className="xs:hidden">Все</span>
                                </Button>
                            </div>

                            {/* Список слотов */}
                            <div className="space-y-2">
                                {slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="group relative bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all hover:shadow-md hover:border-slate-300"
                                    >
                                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                                            {/* Информация о слоте */}
                                            <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                                                {/* Время */}
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 flex-shrink-0" />
                                                    <span className="text-sm sm:text-base font-bold text-slate-900">
                            {slot.slot_time}
                          </span>
                                                </div>

                                                {/* Причина */}
                                                {slot.reason && (
                                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed break-words pl-6 sm:pl-6.5">
                                                        {slot.reason}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Кнопка удаления */}
                                            <Button
                                                onClick={() => onDelete(slot.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                                            </Button>
                                        </div>

                                        {/* Декоративная полоска */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l-lg sm:rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
            </CardContent>
        </Card>
    )
}