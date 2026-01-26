'use client'

import { useState, useEffect } from 'react'
import { format, addDays, addMonths, startOfMonth, endOfMonth, startOfDay, eachDayOfInterval, isSameMonth, isSameDay, isToday, parse, isBefore, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useBookingForm } from '@/lib/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAvailableSlots } from '@/lib/hooks/useSlots'
import { cn } from '@/lib/utils/cn'

export function StepDateTime() {
    const { formData, nextStep, updateFormData } = useBookingForm()

    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)

    // Начинаем с сегодняшнего дня или с уже выбранной даты
    const initialDate = formData.date
        ? parse(formData.date, 'yyyy-MM-dd', new Date())
        : today

    const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
    const [selectedTime, setSelectedTime] = useState<string>(formData.time || '')
    const [currentMonth, setCurrentMonth] = useState<Date>(initialDate)
    const [isCalendarExpanded, setIsCalendarExpanded] = useState(false)

    // Форматируем выбранную дату для API
    const formattedDate = format(selectedDate, 'yyyy-MM-dd')

    // Загружаем доступные слоты для выбранной даты
    const { data: availableSlots = [], isLoading: isLoadingSlots } = useAvailableSlots(formattedDate)

    // Обновляем выбранное время, если оно недоступно
    useEffect(() => {
        if (availableSlots.length > 0 && !availableSlots.includes(selectedTime)) {
            setSelectedTime('')
        }
    }, [availableSlots, selectedTime])

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedTime('')
        // На мобильных сворачиваем календарь после выбора даты
        if (window.innerWidth < 768) {
            setIsCalendarExpanded(false)
        }
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
    }

    const handleNext = () => {
        updateFormData({
            date: formattedDate,
            time: selectedTime,
        })
        nextStep()
    }

    // Получаем дни для отображения в календаре
    const getVisibleDays = () => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)

        // Для текущего месяца начинаем с сегодняшнего дня
        const rangeStart = isSameMonth(currentMonth, today) ? today : monthStart

        // Ограничиваем максимальной датой
        const rangeEnd = isAfter(monthEnd, maxDate) ? maxDate : monthEnd

        return eachDayOfInterval({ start: rangeStart, end: rangeEnd })
    }

    const visibleDays = getVisibleDays()

    // Добавляем пустые ячейки только для видимых дней
    const getEmptyCells = () => {
        if (visibleDays.length === 0) return 0
        const firstVisibleDay = visibleDays[0]
        const dayOfWeek = firstVisibleDay.getDay()
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1
    }

    const emptyCells = getEmptyCells()

    // Проверяем, можно ли перейти к следующему месяцу
    const canGoToNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1)
        return isBefore(startOfMonth(nextMonth), maxDate)
    }

    const isFormValid = selectedTime !== ''

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                    Шаг 1: Выберите дату и время
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
                {/* Быстрый выбор даты на мобильных */}
                {!isCalendarExpanded && (
                    <div className="md:hidden">
                        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Выбранная дата:</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsCalendarExpanded(true)}
                                    className="h-8 px-2 text-primary-600 hover:text-primary-700"
                                >
                                    Изменить
                                </Button>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Календарь */}
                <div className={cn(
                    "space-y-4",
                    !isCalendarExpanded && "hidden md:block"
                )}>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 capitalize">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                                disabled={isSameMonth(currentMonth, today)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 min-w-0"
                            >
                                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                disabled={!canGoToNextMonth()}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 min-w-0"
                            >
                                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            {!isCalendarExpanded && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsCalendarExpanded(false)}
                                    className="h-7 w-7 p-0 ml-2 text-gray-500"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Информация о доступном периоде */}
                    <div className="mb-3 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-2 sm:p-3">
                        📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                    </div>

                    {/* Заголовки дней недели - скрываем на очень маленьких экранах */}
                    <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                            <div
                                key={day}
                                className="text-center text-[9px] sm:text-xs font-medium text-gray-500 py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Дни месяца */}
                    {visibleDays.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">В этом месяце нет доступных дат</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {/* Пустые ячейки */}
                            {Array.from({ length: emptyCells }).map((_, i) => (
                                <div key={`empty-${i}`} className="p-1 sm:p-2" />
                            ))}

                            {/* Дни */}
                            {visibleDays.map((day) => {
                                const selected = isSameDay(day, selectedDate)
                                const today_flag = isToday(day)

                                return (
                                    <button
                                        key={day.toString()}
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={cn(
                                            'flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all border min-h-[48px] sm:min-h-0',
                                            'active:scale-95 active:border-primary-300',
                                            'hover:border-primary-300 hover:bg-primary-50 cursor-pointer',
                                            selected &&
                                            'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-md',
                                            !selected && 'border-gray-200 bg-white'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'text-[8px] sm:text-[10px] uppercase mb-0.5',
                                                selected ? 'text-white/90' : 'text-gray-500'
                                            )}
                                        >
                                            {format(day, 'EEE', { locale: ru }).charAt(0)}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-base sm:text-lg font-bold',
                                                selected ? 'text-white' : 'text-gray-900'
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {today_flag && (
                                            <span
                                                className={cn(
                                                    'text-[6px] sm:text-[8px] mt-0.5 px-1 py-0.5 rounded-full truncate max-w-full',
                                                    selected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-primary-100 text-primary-700'
                                                )}
                                            >
                                                Сегодня
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Кнопка сворачивания календаря на мобильных */}
                    <div className="md:hidden pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCalendarExpanded(false)}
                            className="w-full text-primary-600 hover:text-primary-700 border border-primary-200"
                        >
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Свернуть календарь
                        </Button>
                    </div>
                </div>

                {/* Кнопка развернуть календарь на мобильных */}
                {!isCalendarExpanded && (
                    <div className="md:hidden">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsCalendarExpanded(true)}
                            className="w-full text-primary-600 hover:text-primary-700 border-primary-200"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Выбрать другую дату
                        </Button>
                    </div>
                )}

                {/* Доступные слоты */}
                <div className="pt-2 sm:pt-4 border-t border-gray-100">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        {isCalendarExpanded ? 'Сначала выберите дату' : 'Выберите время'}
                    </h3>

                    {isCalendarExpanded ? (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">Выберите дату, чтобы увидеть доступное время</p>
                        </div>
                    ) : isLoadingSlots ? (
                        <div className="text-center py-6">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-primary-600 border-r-transparent"></div>
                            <p className="mt-2 text-sm text-gray-500">Загрузка доступного времени...</p>
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">На эту дату нет свободных слотов</p>
                            <p className="text-sm text-gray-400 mt-1">Выберите другую дату</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
                                {availableSlots.map((time) => (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => handleTimeSelect(time)}
                                        className={cn(
                                            'p-2.5 sm:p-3 text-sm font-medium rounded-lg border transition-all',
                                            'active:scale-95 active:border-primary-300',
                                            'hover:border-primary-300 hover:shadow-sm',
                                            selectedTime === time
                                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                                : 'bg-white text-gray-700 border-gray-200'
                                        )}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>

                            {selectedTime && (
                                <div className="bg-green-50 border border-green-200 p-3 sm:p-4 rounded-xl mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <p className="text-sm text-green-800 font-medium">
                                            Выбрано: <span className="font-semibold">{selectedTime}</span>
                                        </p>
                                    </div>
                                    <p className="text-xs text-green-700 mt-1">
                                        {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button
                        onClick={handleNext}
                        disabled={!isFormValid}
                        size="lg"
                        className="w-full sm:w-auto min-h-[44px] text-base"
                    >
                        Далее
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}