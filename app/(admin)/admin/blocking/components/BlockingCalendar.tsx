'use client'

import {addDays, eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isSameMonth, startOfMonth} from 'date-fns'
import {ru} from 'date-fns/locale'
import {ChevronLeft, ChevronRight} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {cn} from '@/lib/utils/cn'
import {BlockedSlot} from './types'

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
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                        📅 Заблокированные дни
                    </CardTitle>
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                            onClick={handlePrevMonth}
                            disabled={!canNavigateBack()}
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                        <div className="min-w-[120px] sm:min-w-[140px] text-center">
              <span className="text-sm sm:text-base font-semibold text-slate-700 capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </span>
                        </div>
                        <Button
                            onClick={handleNextMonth}
                            disabled={!canNavigateForward()}
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-all"
                        >
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 sm:space-y-4">
                {/* Информация о доступном периоде */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-900 font-medium">
                        📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по{' '}
                        {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                    </p>
                </div>

                {/* Календарная сетка */}
                <div className="space-y-2">
                    {/* Заголовки дней недели */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs sm:text-sm font-bold text-slate-600 py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Дни месяца */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {/* Пустые ячейки */}
                        {Array.from({ length: emptyCells }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {monthDays.length === 0 ? (
                            <>
                                {Array.from({ length: 7 - emptyCells })
                                    .slice(0, 7)
                                    .map((_, i) => (
                                        <div key={`empty-end-${i}`} className="aspect-square" />
                                    ))}
                                <div className="col-span-7 text-center py-8 text-slate-500 text-sm">
                                    В этом месяце нет доступных дат
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
                                        key={dateStr}
                                        onClick={() => !isFullyBlocked && onDateSelect(dateStr)}
                                        disabled={isFullyBlocked}
                                        className={cn(
                                            'aspect-square rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center justify-center p-1 relative overflow-hidden',
                                            'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                                            !isFullyBlocked &&
                                            'hover:border-blue-400 hover:shadow-md hover:scale-105 cursor-pointer bg-white',
                                            isFullyBlocked &&
                                            'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 cursor-not-allowed opacity-90',
                                            !isFullyBlocked && 'border-slate-200',
                                            isToday && 'ring-2 ring-blue-500/30'
                                        )}
                                    >
                                        {/* Фон для сегодняшнего дня */}
                                        {isToday && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
                                        )}

                                        {/* Контент */}
                                        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
                                            {/* День недели - только на мобильных */}
                                            <span className="text-[9px] sm:hidden font-medium text-slate-400 uppercase">
                        {format(date, 'EEE', { locale: ru })}
                      </span>

                                            {/* Число дня */}
                                            <div
                                                className={cn(
                                                    'text-sm sm:text-base lg:text-lg font-bold',
                                                    isFullyBlocked ? 'text-red-600' : 'text-slate-700',
                                                    isToday && 'text-blue-600'
                                                )}
                                            >
                                                {format(date, 'd')}
                                            </div>

                                            {/* Индикаторы */}
                                            {isToday && !isFullyBlocked && (
                                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                                            )}

                                            {isFullyBlocked && (
                                                <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] sm:text-[9px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                                    {daySlots.length}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Легенда */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-slate-200 bg-white" />
                        <span className="text-slate-600 font-medium">Доступные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200" />
                        <span className="text-slate-600 font-medium">Заблокированные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2 border-blue-500 bg-white" />
                        <span className="text-slate-600 font-medium">Сегодня</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}