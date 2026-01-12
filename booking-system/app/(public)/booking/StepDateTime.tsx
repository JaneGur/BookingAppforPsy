'use client'

import { useState, useEffect, useMemo } from 'react'
import { addDays, format, parseISO, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetAvailableSlotsQuery } from "@/store/api/slotsApi";
import { nextStep, updateFormData } from "@/store/slices/bookingSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";


export function StepDateTime() {
    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.booking.formData)

    const [selectedDate, setSelectedDate] = useState<Date | null>(
        formData.date ? parseISO(formData.date) : null
    )
    const [selectedTime, setSelectedTime] = useState<string | undefined>(formData.time)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set())

    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30) // До 30 дней вперед

    // Генерируем все дни месяца, но показываем только доступные (сегодня + 30 дней)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Фильтруем дни: только те, что в диапазоне сегодня + 30 дней
    const availableDates = monthDays.filter((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const dateTime = date.getTime()
        return dateTime >= today.getTime() && dateTime <= maxDate.getTime()
    })

    // Загружаем заблокированные дни для текущего месяца
    useEffect(() => {
        async function loadBlockedDays() {
            const startDate = format(monthStart, 'yyyy-MM-dd')
            const endDate = format(monthEnd, 'yyyy-MM-dd')

            try {
                const res = await fetch(`/api/blocked-days?start_date=${startDate}&end_date=${endDate}`)
                if (!res.ok) {
                    return
                }
                const data = (await res.json().catch(() => [])) as string[] | { error?: string }
                // Проверяем, что это массив, а не объект с ошибкой
                if (Array.isArray(data)) {
                    setBlockedDays(new Set(data))
                } else {
                    setBlockedDays(new Set())
                }
            } catch (error) {
                console.error('Failed to load blocked days:', error)
                setBlockedDays(new Set())
            }
        }

        loadBlockedDays()
    }, [currentMonth, monthStart, monthEnd])

    const dateForQuery = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

    const { data: availableSlots, isLoading, error } = useGetAvailableSlotsQuery(
        dateForQuery,
        { skip: !selectedDate }
    )

    const slotsErrorMessage = useMemo(() => {
        if (!error) return null
        if (typeof error === 'object' && error && 'data' in error) {
            const maybeData = (error as { data?: unknown }).data
            if (
                maybeData &&
                typeof maybeData === 'object' &&
                'error' in maybeData &&
                typeof (maybeData as { error?: unknown }).error === 'string'
            ) {
                return (maybeData as { error: string }).error
            }
        }
        return 'Ошибка загрузки слотов'
    }, [error])

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

    const handlePreviousMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() - 1)
        if (newMonth >= startOfMonth(today)) {
            setCurrentMonth(newMonth)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + 1)
        if (newMonth <= startOfMonth(maxDate)) {
            setCurrentMonth(newMonth)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    const canNavigateBack = currentMonth > startOfMonth(today)
    const canNavigateForward = currentMonth < startOfMonth(maxDate)

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
                        <div className="flex items-center gap-4">
                            <div className="text-sm font-medium text-gray-700">
                                {format(currentMonth, 'MMMM yyyy', { locale: ru })}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePreviousMonth}
                                    disabled={!canNavigateBack}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNextMonth}
                                    disabled={!canNavigateForward}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Дни недели (заголовки) */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Календарь с днями */}
                    <div className="grid grid-cols-7 gap-2">
                        {/* Пустые ячейки в начале месяца */}
                        {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-3" />
                        ))}

                        {monthDays.map((date) => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const isSelected = selectedDate && dateStr === format(selectedDate, 'yyyy-MM-dd')
                            const isToday = dateStr === format(today, 'yyyy-MM-dd')
                            const isBlocked = blockedDays.has(dateStr)
                            const isPast = date < today
                            const isFuture = date > maxDate
                            const isAvailable = !isPast && !isFuture && !isBlocked && dateStr >= format(today, 'yyyy-MM-dd')

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => isAvailable && handleDateSelect(date)}
                                    disabled={!isAvailable}
                                    className={cn(
                                        'flex flex-col items-center justify-center p-3 rounded-xl transition-all border shadow-sm',
                                        isAvailable && 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer',
                                        !isAvailable && 'opacity-40 cursor-not-allowed',
                                        isSelected &&
                                        'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-lg',
                                        !isSelected && isAvailable && 'border-gray-200 bg-white',
                                        !isSelected && !isAvailable && 'border-gray-100 bg-gray-50',
                                        isBlocked && 'border-red-200 bg-red-50'
                                    )}
                                    title={isBlocked ? 'День заблокирован' : isPast ? 'Прошедшая дата' : isFuture ? 'Дата вне диапазона' : ''}
                                >
                                    <span className={cn(
                                        'text-xs uppercase mb-1',
                                        isSelected ? 'text-white/90' : isAvailable ? 'text-gray-500' : 'text-gray-400'
                                    )}>
                                        {format(date, 'EEE', { locale: ru })}
                                    </span>
                                    <span className={cn(
                                        'text-xl font-bold',
                                        isSelected ? 'text-white' : isAvailable ? 'text-gray-900' : 'text-gray-400'
                                    )}>
                                        {format(date, 'd')}
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
                                    {isBlocked && !isSelected && (
                                        <span className="text-[10px] mt-1 text-red-600">
                                            🚫
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
                                <p>{slotsErrorMessage}</p>
                                {process.env.NODE_ENV !== 'production' && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        Если ты ещё не подключал базу, это ожидаемо. В dev-режиме API может отдавать мок-слоты,
                                        проверь, что dev-сервер перезапущен.
                                    </p>
                                )}
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
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
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
                        title={(!selectedDate || !selectedTime) ? "Выберите дату и время для продолжения" : "Перейти к следующему шагу"}
                    >
                        Продолжить →
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}