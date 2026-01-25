'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { BlockedSlot } from './types'

interface BlockingCalendarProps {
    currentMonth: Date
    setCurrentMonth: (date: Date) => void
    slotsByDate: Map<string, BlockedSlot[]>
    onDateSelect: (date: string) => void
    today: Date
}

export default function BlockingCalendar({
                                             currentMonth,
                                             setCurrentMonth,
                                             slotsByDate,
                                             onDateSelect,
                                             today
                                         }: BlockingCalendarProps) {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)
        setCurrentMonth(newMonth)
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)
        setCurrentMonth(newMonth)
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="truncate">Заблокированные дни</span>
                    </CardTitle>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-sm font-medium text-gray-700 capitalize">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevMonth}
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                        <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 pb-1 sm:pb-2">
                            {day}
                        </div>
                    ))}

                    {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map(
                        (_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        )
                    )}

                    {monthDays.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd')
                        const isPast = date < today
                        const daySlots = slotsByDate.get(dateStr) || []
                        const isFullyBlocked = daySlots.length > 0

                        return (
                            <button
                                key={date.toISOString()}
                                type="button"
                                onClick={() => !isPast && onDateSelect(dateStr)}
                                disabled={isPast}
                                className={cn(
                                    'aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-center',
                                    !isPast && 'hover:border-primary-300 hover:shadow-md cursor-pointer',
                                    isFullyBlocked && 'bg-red-50 border-red-200',
                                    !isFullyBlocked && !isPast && 'bg-white border-gray-200',
                                    isPast && 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                )}
                            >
                                <div className="text-center w-full">
                                    <div
                                        className={cn(
                                            'text-sm sm:text-lg md:text-xl font-bold',
                                            isFullyBlocked ? 'text-red-700' : isPast ? 'text-gray-400' : 'text-gray-900'
                                        )}
                                    >
                                        {format(date, 'd')}
                                    </div>
                                    {isFullyBlocked && (
                                        <div className="text-[9px] sm:text-xs text-red-600 mt-0.5 sm:mt-1 truncate">
                                            {daySlots.length} сл
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}