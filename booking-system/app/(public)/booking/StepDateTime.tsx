'use client'

import {useState} from 'react'
import {addDays, format, parseISO, startOfDay} from 'date-fns'
import {ru} from 'date-fns/locale'
import {Calendar, ChevronLeft, ChevronRight, Clock} from 'lucide-react'
import {useAppDispatch, useAppSelector} from "@/store/hooks";
import {useGetAvailableSlotsQuery} from "@/store/api/slotsApi";
import {nextStep, updateFormData} from "@/store/slices/bookingSlice";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";


export function StepDateTime() {
    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.booking.formData)

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        formData.date ? parseISO(formData.date) : null
    )
    const [selectedTime, setSelectedTime] = useState<string | undefined>(formData.time)
    const [dateOffset, setDateOffset] = useState(0)

    // Генерируем 7 дней, начиная с сегодня
    const availableDates = Array.from({ length: 7 }, (_, i) =>
        addDays(startOfDay(new Date()), i + dateOffset)
    )

    const dateForQuery = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

    const { data: availableSlots, isLoading, error } = useGetAvailableSlotsQuery(
        dateForQuery,
        { skip: !selectedDate }
    )

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)
        setSelectedTime(undefined) // Сбрасываем время при смене даты
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
    }

    const handleNext = () => {
        if (selectedDate && selectedTime) {
            dispatch(
                updateFormData({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    time: selectedTime,
                })
            )
            dispatch(nextStep())
        }
    }

    const canNavigateBack = dateOffset > 0
    const handlePreviousWeek = () => {
        if (canNavigateBack) {
            setDateOffset(dateOffset - 7)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    const handleNextWeek = () => {
        setDateOffset(dateOffset + 7)
        setSelectedDate(null)
        setSelectedTime(undefined)
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Шаг 1: Выберите дату и время
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-sm text-gray-600 mb-4 bg-primary-50/50 p-3 rounded-lg">
                    ⏰ Всё время указано по Москве (МСК)
                </div>

                {/* Выбор даты */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-base font-semibold text-gray-900">
                            Выберите дату
                        </label>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handlePreviousWeek}
                                disabled={!canNavigateBack}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNextWeek}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {availableDates.map((date) => {
                            const isSelected = selectedDate &&
                                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => handleDateSelect(date)}
                                    className={cn(
                                        'flex flex-col items-center justify-center p-3 rounded-xl transition-all border-2',
                                        'hover:border-primary-300 hover:bg-primary-50',
                                        isSelected &&
                                        'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-lg',
                                        !isSelected && 'border-gray-200 bg-white'
                                    )}
                                >
                                    <span className={cn(
                                        'text-xs uppercase mb-1',
                                        isSelected ? 'text-white/90' : 'text-gray-500'
                                    )}>
                                        {format(date, 'EEE', { locale: ru })}
                                    </span>
                                    <span className={cn(
                                        'text-xl font-bold',
                                        isSelected ? 'text-white' : 'text-gray-900'
                                    )}>
                                        {format(date, 'd')}
                                    </span>
                                    <span className={cn(
                                        'text-xs',
                                        isSelected ? 'text-white/90' : 'text-gray-500'
                                    )}>
                                        {format(date, 'MMM', { locale: ru })}
                                    </span>
                                    {isToday && (
                                        <span className={cn(
                                            'text-[10px] mt-1 px-2 py-0.5 rounded-full',
                                            isSelected
                                                ? 'bg-white/20 text-white'
                                                : 'bg-primary-100 text-primary-700'
                                        )}>
                                            Сегодня
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Выбор времени */}
                {selectedDate && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-primary-500" />
                            <label className="text-base font-semibold text-gray-900">
                                Выберите время
                            </label>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                                <p className="mt-3 text-sm text-gray-500">Загрузка слотов...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-500">
                                <p>Ошибка загрузки слотов</p>
                            </div>
                        ) : availableSlots && availableSlots.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4 bg-green-50 border border-green-200 p-3 rounded-lg">
                                    ✅ Доступно {availableSlots.length} {availableSlots.length === 1 ? 'слот' : 'слотов'} на{' '}
                                    {format(selectedDate, 'd MMMM', { locale: ru })}
                                </p>
                                <div className="grid grid-cols-4 gap-3">
                                    {availableSlots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedTime === slot ? 'default' : 'secondary'}
                                            onClick={() => handleTimeSelect(slot)}
                                            className={cn(
                                                'h-14 text-base font-semibold',
                                                selectedTime === slot && 'ring-2 ring-primary-300'
                                            )}
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <p className="text-gray-500 text-base">
                                    😔 На эту дату нет свободных слотов
                                </p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Попробуйте выбрать другую дату
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Кнопка далее */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedDate || !selectedTime}
                        size="lg"
                        className="min-w-[200px]"
                    >
                        Продолжить →
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}