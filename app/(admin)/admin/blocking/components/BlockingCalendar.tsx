'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isAfter, isBefore, startOfDay, addDays } from 'date-fns'
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
                                disabled={!canNavigateBack()}
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                disabled={!canNavigateForward()}
                                className="h-8 w-8 flex-shrink-0"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Информация о доступном периоде */}
                <div className="text-xs sm:text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-3 text-center">
                    📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
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

                    {monthDays.length === 0 ? (
                        // Если в месяце нет доступных дней
                        <>
                            {Array.from({ length: 7 - emptyCells }).slice(0, 7).map((_, i) => (
                                <div key={`empty-days-${i}`} className="aspect-square" />
                            ))}
                            <div className="col-span-7 aspect-auto">
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-sm">В этом месяце нет доступных дат</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Отображаем доступные дни
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
                                        'aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-center',
                                        !isFullyBlocked && 'hover:border-primary-300 hover:shadow-md cursor-pointer',
                                        isFullyBlocked && 'bg-red-50 border-red-200 cursor-not-allowed opacity-80',
                                        !isFullyBlocked && 'bg-white border-gray-200'
                                    )}
                                >
                                    <div className="text-center w-full">
                                        {/* День недели */}
                                        <span className={cn(
                                            'text-[8px] sm:text-[10px] uppercase mb-0.5 block',
                                            isFullyBlocked ? 'text-red-500' : 'text-gray-500'
                                        )}>
                                            {format(date, 'EEE', { locale: ru })}
                                        </span>

                                        {/* Число дня */}
                                        <div
                                            className={cn(
                                                'text-sm sm:text-lg md:text-xl font-bold',
                                                isFullyBlocked ? 'text-red-700' : 'text-gray-900'
                                            )}
                                        >
                                            {format(date, 'd')}
                                        </div>

                                        {/* Индикаторы */}
                                        <div className="space-y-0.5 mt-0.5 sm:mt-1">
                                            {isToday && (
                                                <span className={cn(
                                                    "text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full",
                                                    isFullyBlocked
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-primary-100 text-primary-700"
                                                )}>
                                                    Сегодня
                                                </span>
                                            )}
                                            {isFullyBlocked && (
                                                <div className="text-[8px] sm:text-xs text-red-600 truncate">
                                                    {daySlots.length} {daySlots.length === 1 ? 'слот' : 'слотов'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            )
                        })
                    )}
                </div>

                {/* Легенда */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-gray-200 bg-white"></div>
                        <span className="text-xs text-gray-600">Доступные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded border border-red-200 bg-red-50"></div>
                        <span className="text-xs text-gray-600">Заблокированные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="text-xs text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded">Сегодня</div>
                        <span className="text-xs text-gray-600">Текущая дата</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}