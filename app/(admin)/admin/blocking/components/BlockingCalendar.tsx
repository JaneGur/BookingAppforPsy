'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isAfter, isBefore, startOfDay, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { BlockedSlot } from './types'
import { useState } from 'react'

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
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    // Максимальная дата для отображения (например, +30 дней от сегодня)
    const maxDate = addDays(today, 30)

    // Получаем дни для отображения - только доступные (не прошедшие и в пределах maxDate)
    const monthDays = eachDayOfInterval({
        start: isSameMonth(currentMonth, today) ? today : monthStart,
        end: isAfter(monthEnd, maxDate) ? maxDate : monthEnd
    })

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)

        // Проверяем, что предыдущий месяц не раньше текущего месяца
        const prevMonthStart = startOfMonth(newMonth)
        if (!isBefore(prevMonthStart, startOfMonth(today))) {
            setCurrentMonth(newMonth)
        }
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)

        // Проверяем, что следующий месяц не позже максимальной даты
        const nextMonthStart = startOfMonth(newMonth)
        if (!isAfter(nextMonthStart, startOfMonth(maxDate))) {
            setCurrentMonth(newMonth)
        }
    }

    // Проверяем, можно ли перейти к предыдущему месяцу
    const canNavigateBack = () => {
        const prevMonth = new Date(currentMonth)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        const prevMonthStart = startOfMonth(prevMonth)
        return !isBefore(prevMonthStart, startOfMonth(today))
    }

    // Проверяем, можно ли перейти к следующему месяцу
    const canNavigateForward = () => {
        const nextMonth = new Date(currentMonth)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const nextMonthStart = startOfMonth(nextMonth)
        return !isAfter(nextMonthStart, startOfMonth(maxDate))
    }

    // Получаем пустые ячейки для первого видимого дня
    const getEmptyCells = () => {
        if (monthDays.length === 0) return 0
        const firstVisibleDay = monthDays[0]
        const dayOfWeek = firstVisibleDay.getDay()
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1
    }

    const emptyCells = getEmptyCells()

    // Ограничиваем количество отображаемых дней на мобильных
    const displayedDays = isCalendarExpanded || window.innerWidth >= 640
        ? monthDays
        : monthDays.slice(0, 14)

    return (
        <Card className="booking-card overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                        <span className="truncate text-sm sm:text-base">Заблокированные дни</span>
                    </CardTitle>
                    <div className="flex items-center justify-between">
                        <div className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevMonth}
                                disabled={!canNavigateBack()}
                                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                disabled={!canNavigateForward()}
                                className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                            >
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Информация о доступном периоде */}
                <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-2 text-center">
                    📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                </div>
            </CardHeader>

            <CardContent className="p-3 sm:p-6">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-2">
                    {/* Заголовки дней недели */}
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                        <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 pb-1 sm:pb-2">
                            {day}
                        </div>
                    ))}

                    {/* Пустые ячейки перед первым днем месяца */}
                    {Array.from({ length: emptyCells }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {displayedDays.map((date) => {
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
                                    'aspect-square p-1 rounded-md sm:rounded-lg border transition-all flex flex-col items-center justify-center',
                                    'min-h-[44px] sm:min-h-[60px]', // Минимальная высота для тач-целей
                                    !isFullyBlocked && 'active:scale-95 active:border-primary-300 cursor-pointer',
                                    isFullyBlocked && 'bg-red-50 border-red-200 cursor-not-allowed',
                                    !isFullyBlocked && 'bg-white border-gray-200 hover:border-primary-300',
                                    isToday && 'ring-2 ring-offset-1 ring-primary-300'
                                )}
                            >
                                <div className="text-center w-full">
                                    {/* День недели - только на мобильных */}
                                    <span className={cn(
                                        'block text-[9px] sm:text-[10px] uppercase mb-0.5',
                                        isFullyBlocked ? 'text-red-500' : 'text-gray-500',
                                        'sm:hidden' // Показываем только на мобильных
                                    )}>
                                        {format(date, 'EEEEEE', { locale: ru })}
                                    </span>

                                    {/* Число дня */}
                                    <div
                                        className={cn(
                                            'text-sm sm:text-base font-semibold',
                                            isFullyBlocked ? 'text-red-700' : 'text-gray-900',
                                            isToday && 'text-primary-700'
                                        )}
                                    >
                                        {format(date, 'd')}
                                    </div>

                                    {/* Индикаторы */}
                                    <div className="mt-0.5 sm:mt-1 space-y-0.5">
                                        {isToday && (
                                            <span className={cn(
                                                "text-[8px] sm:text-[10px] px-1 py-0.5 rounded-full inline-block",
                                                isFullyBlocked
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-primary-100 text-primary-700"
                                            )}>
                                                {window.innerWidth < 640 ? 'С' : 'Сегодня'}
                                            </span>
                                        )}
                                        {isFullyBlocked && (
                                            <div className={cn(
                                                "text-[8px] sm:text-[10px]",
                                                isToday ? 'text-red-800' : 'text-red-600',
                                                'truncate px-0.5'
                                            )}>
                                                {daySlots.length} {window.innerWidth < 640 ? '' : 'сл.'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Кнопка "Показать больше/меньше" для мобильных */}
                {monthDays.length > 14 && window.innerWidth < 640 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCalendarExpanded(!isCalendarExpanded)}
                        className="w-full mt-3"
                    >
                        {isCalendarExpanded ? (
                            <>
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Скрыть
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4 mr-2" />
                                Показать еще {monthDays.length - 14} дней
                            </>
                        )}
                    </Button>
                )}

                {/* Легенда - адаптированная для мобильных */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-gray-200 bg-white"></div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Доступные</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-red-200 bg-red-50"></div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Заблокированные</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="text-[10px] sm:text-xs text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded">Сегодня</div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Текущая дата</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}