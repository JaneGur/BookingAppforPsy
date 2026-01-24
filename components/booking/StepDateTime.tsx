'use client'

import { useState, useEffect } from 'react'
import { format, addDays, addMonths, startOfMonth, endOfMonth, startOfDay, eachDayOfInterval, isSameMonth, isSameDay, isToday, parse, isBefore, isAfter } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
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
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Шаг 1: Выберите дату и время
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Календарь */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                        </h3>
                        <div className="flex gap-1 sm:gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                                disabled={isSameMonth(currentMonth, today)}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                disabled={!canGoToNextMonth()}
                                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Информация о доступном периоде */}
                    <div className="mb-3 text-xs sm:text-sm text-gray-500 text-center bg-blue-50 border border-blue-100 rounded-lg p-2">
                        📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                    </div>

                    {/* Заголовки дней недели */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                            <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-1 sm:py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Дни месяца */}
                    {visibleDays.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">В этом месяце нет доступных дат</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {/* Пустые ячейки */}
                            {Array.from({ length: emptyCells }).map((_, i) => (
                                <div key={`empty-${i}`} className="p-3" />
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
                                            'flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl transition-all border shadow-sm',
                                            'hover:border-primary-300 hover:bg-primary-50 cursor-pointer',
                                            selected &&
                                                'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-lg',
                                            !selected && 'border-gray-200 bg-white'
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'text-[10px] sm:text-xs uppercase mb-0.5 sm:mb-1',
                                                selected ? 'text-white/90' : 'text-gray-500'
                                            )}
                                        >
                                            {format(day, 'EEE', { locale: ru })}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-lg sm:text-xl font-bold',
                                                selected ? 'text-white' : 'text-gray-900'
                                            )}
                                        >
                                            {format(day, 'd')}
                                        </span>
                                        {today_flag && (
                                            <span
                                                className={cn(
                                                    'text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 px-1.5 sm:px-2 py-0.5 rounded-full',
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
                </div>

                {/* Выбранная дата */}
                <div className="bg-primary-50/50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-gray-600 mb-1">Выбранная дата</div>
                    <div className="text-lg font-semibold text-gray-900">
                        {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                    </div>
                </div>

                {/* Доступные слоты */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        Выберите время
                    </h3>
                    
                    {isLoadingSlots ? (
                        <div className="text-center py-8">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
                            <p className="mt-2 text-sm text-gray-500">Загрузка доступных слотов...</p>
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">На эту дату нет свободных слотов</p>
                            <p className="text-sm text-gray-400 mt-1">Выберите другую дату</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            {availableSlots.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeSelect(time)}
                                    className={cn(
                                        'p-3 text-sm font-medium rounded-lg border transition-all',
                                        'hover:border-primary-300 hover:shadow-md',
                                        selectedTime === time
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                                            : 'bg-white text-gray-700 border-gray-200'
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedTime && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                        <p className="text-sm text-green-800">
                            ✅ Выбрано: <strong>{format(selectedDate, 'd MMMM yyyy', { locale: ru })} в {selectedTime}</strong>
                        </p>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={handleNext} disabled={!isFormValid} size="lg" className="w-full sm:w-auto">
                        Далее
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
