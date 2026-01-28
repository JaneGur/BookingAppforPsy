'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isAfter, isBefore, startOfDay, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    const maxDate = addDays(today, 30)

    const monthDays = eachDayOfInterval({
        start: isSameMonth(currentMonth, today) ? today : monthStart,
        end: isAfter(monthEnd, maxDate) ? maxDate : monthEnd
    })

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)
        const prevMonthStart = startOfMonth(newMonth)
        if (!isBefore(prevMonthStart, startOfMonth(today))) {
            setCurrentMonth(newMonth)
        }
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)
        const nextMonthStart = startOfMonth(newMonth)
        if (!isAfter(nextMonthStart, startOfMonth(maxDate))) {
            setCurrentMonth(newMonth)
        }
    }

    const canNavigateBack = () => {
        const prevMonth = new Date(currentMonth)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const prevMonthStart = startOfMonth(prevMonth)
        return !isBefore(prevMonthStart, startOfMonth(today))
    }

    const canNavigateForward = () => {
        const nextMonth = new Date(currentMonth)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const nextMonthStart = startOfMonth(nextMonth)
        return !isAfter(nextMonthStart, startOfMonth(maxDate))
    }

    const getEmptyCells = () => {
        if (monthDays.length === 0) return 0
        const firstVisibleDay = monthDays[0]
        const dayOfWeek = firstVisibleDay.getDay()
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1
    }

    const emptyCells = getEmptyCells()

    return (
        <Card className="booking-card border-0 shadow-lg sm:border sm:shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-base font-bold text-gray-900 truncate">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            disabled={!canNavigateBack()}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            disabled={!canNavigateForward()}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-3 text-center">
                    📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1">
                    {/* Заголовки дней недели */}
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-gray-600 pb-2">
                            {day}
                        </div>
                    ))}

                    {/* Пустые ячейки */}
                    {Array.from({ length: emptyCells }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {monthDays.length === 0 ? (
                        <>
                            {Array.from({ length: 7 - emptyCells }).slice(0, 7).map((_, i) => (
                                <div key={`empty-days-${i}`} className="aspect-square" />
                            ))}
                            <div className="col-span-7 aspect-auto">
                                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">В этом месяце нет доступных дат</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        monthDays.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const isToday = dateStr === format(today, 'yyyy-MM-dd')
                            const daySlots = slotsByDate.get(dateStr) || []
                            const isFullyBlocked = daySlots.length > 0

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    onClick={() => onDateSelect(dateStr)}
                                    disabled={isFullyBlocked}
                                    className={cn(
                                        'aspect-square p-1 rounded-lg border transition-all flex flex-col items-center justify-center min-h-[60px]',
                                        !isFullyBlocked && 'hover:border-primary-300 active:scale-95 cursor-pointer',
                                        isFullyBlocked && 'bg-red-50 border-red-200 cursor-not-allowed',
                                        !isFullyBlocked && 'bg-white border-gray-200'
                                    )}
                                >
                                    <div className="text-center w-full">
                                        <span className={cn(
                                            'text-[10px] uppercase mb-1 block',
                                            isFullyBlocked ? 'text-red-500' : 'text-gray-500'
                                        )}>
                                            {format(date, 'EEE', { locale: ru }).slice(0, 2)}
                                        </span>

                                        <div
                                            className={cn(
                                                'text-lg font-bold',
                                                isFullyBlocked ? 'text-red-700' : 'text-gray-900'
                                            )}
                                        >
                                            {format(date, 'd')}
                                        </div>

                                        <div className="space-y-0.5 mt-1">
                                            {isToday && (
                                                <span className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded-full",
                                                    isFullyBlocked
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-primary-100 text-primary-700"
                                                )}>
                                                    С
                                                </span>
                                            )}
                                            {isFullyBlocked && (
                                                <div className="text-[10px] text-red-600 truncate">
                                                    {daySlots.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>

                {/* Легенда (упрощенная для мобильных) */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border border-gray-200 bg-white"></div>
                        <span className="text-xs text-gray-600">Доступно</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded border border-red-200 bg-red-50"></div>
                        <span className="text-xs text-gray-600">Занято</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}