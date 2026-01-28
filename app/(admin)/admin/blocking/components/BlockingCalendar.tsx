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
            <CardHeader className="pb-3 sm:pb-6">
                <div className="flex flex-col gap-3">
                    {/* Заголовок и навигация */}
                    <div className="flex items-center justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-xl min-w-0 flex-1">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
                            <span className="truncate">Заблокированные дни</span>
                        </CardTitle>
                        <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePrevMonth}
                                disabled={!canNavigateBack()}
                                className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextMonth}
                                disabled={!canNavigateForward()}
                                className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Месяц и год */}
                    <div className="text-center sm:text-left">
                        <div className="text-sm sm:text-base font-semibold text-gray-700 capitalize">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </div>
                    </div>

                    {/* Информация о доступном периоде */}
                    <div className="text-xs sm:text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-2.5 sm:p-3 text-center">
                        <span className="inline-block mr-1">📅</span>
                        <span className="inline">
                            Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:px-6">
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2">
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
                                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 text-xs sm:text-sm px-4">
                                        В этом месяце нет доступных дат
                                    </p>
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
                                        'aspect-square p-0.5 sm:p-1 md:p-2 rounded-md sm:rounded-lg md:rounded-xl border transition-all flex flex-col items-center justify-center',
                                        'active:scale-95',
                                        !isFullyBlocked && 'hover:border-primary-300 hover:shadow-md cursor-pointer hover:scale-105',
                                        isFullyBlocked && 'bg-red-50 border-red-200 cursor-not-allowed opacity-80',
                                        !isFullyBlocked && 'bg-white border-gray-200'
                                    )}
                                >
                                    <div className="text-center w-full min-w-0">
                                        {/* День недели - скрываем на маленьких экранах */}
                                        <span className={cn(
                                            'hidden sm:block text-[8px] sm:text-[10px] uppercase mb-0.5',
                                            isFullyBlocked ? 'text-red-500' : 'text-gray-500'
                                        )}>
                                            {format(date, 'EEE', { locale: ru })}
                                        </span>

                                        {/* Число дня */}
                                        <div
                                            className={cn(
                                                'text-xs sm:text-sm md:text-lg lg:text-xl font-bold leading-none',
                                                isFullyBlocked ? 'text-red-700' : 'text-gray-900'
                                            )}
                                        >
                                            {format(date, 'd')}
                                        </div>

                                        {/* Индикаторы */}
                                        <div className="space-y-0.5 mt-0.5 sm:mt-1">
                                            {isToday && (
                                                <span className={cn(
                                                    "text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full inline-block leading-tight",
                                                    isFullyBlocked
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-primary-100 text-primary-700"
                                                )}>
                                                    <span className="hidden xs:inline">Сегодня</span>
                                                    <span className="xs:hidden">•</span>
                                                </span>
                                            )}
                                            {isFullyBlocked && (
                                                <div className="text-[8px] sm:text-[10px] text-red-600 truncate px-0.5">
                                                    <span className="hidden xs:inline">
                                                        {daySlots.length} {daySlots.length === 1 ? 'слот' : 'слотов'}
                                                    </span>
                                                    <span className="xs:hidden">🚫</span>
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
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-gray-200 bg-white flex-shrink-0"></div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Доступные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border border-red-200 bg-red-50 flex-shrink-0"></div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Заблокированные</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="text-[10px] sm:text-xs text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded flex-shrink-0">Сегодня</div>
                        <span className="text-[10px] sm:text-xs text-gray-600">Текущая дата</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}