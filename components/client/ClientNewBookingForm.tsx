'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfDay, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isAfter, isBefore, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Calendar, Clock, ChevronLeft, ChevronRight, Package, Info, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { useAvailableSlots } from '@/lib/hooks/useSlots'
import { useProducts } from '@/lib/hooks/useProducts'
import { useCreateBooking } from '@/lib/hooks/useBookings'

export function ClientNewBookingForm() {
    const router = useRouter()
    const { data: session } = useSession()
    const createBooking = useCreateBooking()

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined)
    const [notes, setNotes] = useState('')
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set())
    const [error, setError] = useState<string | null>(null)

    const { data: products = [] } = useProducts()
    const dateForQuery = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined
    const { data: availableSlots, isLoading: isSlotsLoading } = useAvailableSlots(dateForQuery)

    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)
    const monthStart = useMemo(() => startOfMonth(currentMonth), [currentMonth])
    const monthEnd = useMemo(() => endOfMonth(currentMonth), [currentMonth])

    // Получаем дни для отображения - только доступные
    const monthDays = useMemo(() => {
        const rangeStart = isSameMonth(currentMonth, today) ? today : monthStart
        const rangeEnd = isAfter(monthEnd, maxDate) ? maxDate : monthEnd
        return eachDayOfInterval({ start: rangeStart, end: rangeEnd })
    }, [currentMonth, today, monthStart, monthEnd, maxDate])

    // Загружаем заблокированные дни
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
    }, [monthStart, monthEnd])

    // Функция для перехода к предыдущему месяцу
    const handlePreviousMonth = () => {
        const prevMonth = addMonths(currentMonth, -1)
        // Проверяем, что предыдущий месяц не раньше текущего месяца
        if (!isBefore(startOfMonth(prevMonth), startOfMonth(today))) {
            setCurrentMonth(prevMonth)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    // Функция для перехода к следующему месяцу
    const handleNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1)
        // Проверяем, что следующий месяц не позже максимальной даты
        if (!isAfter(startOfMonth(nextMonth), startOfMonth(maxDate))) {
            setCurrentMonth(nextMonth)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    // Проверяем, можно ли перейти к предыдущему месяцу
    const canNavigateBack = () => {
        const prevMonth = addMonths(currentMonth, -1)
        return !isBefore(startOfMonth(prevMonth), startOfMonth(today))
    }

    // Проверяем, можно ли перейти к следующему месяцу
    const canNavigateForward = () => {
        const nextMonth = addMonths(currentMonth, 1)
        return !isAfter(startOfMonth(nextMonth), startOfMonth(maxDate))
    }

    // Добавляем пустые ячейки только для видимых дней
    const getEmptyCells = () => {
        if (monthDays.length === 0) return 0
        const firstVisibleDay = monthDays[0]
        const dayOfWeek = firstVisibleDay.getDay()
        return dayOfWeek === 0 ? 6 : dayOfWeek - 1
    }

    const emptyCells = getEmptyCells()

    const handleCreateBooking = async () => {
        if (!selectedDate || !selectedTime || !selectedProductId) {
            setError('Пожалуйста, заполните все обязательные поля')
            return
        }

        if (!session?.user?.phone) {
            setError('Необходима авторизация')
            return
        }

        setError(null)

        try {
            const profileRes = await fetch('/api/profile')
            const profile = profileRes.ok ? await profileRes.json() : null

            const booking = await createBooking.mutateAsync({
                booking_date: format(selectedDate, 'yyyy-MM-dd'),
                booking_time: selectedTime,
                client_name: profile?.name || session.user.email || session.user.phone || '',
                client_phone: session.user.phone,
                client_email: session.user.email || profile?.email,
                client_telegram: profile?.telegram,
                notes: notes || undefined,
                product_id: selectedProductId,
                status: 'pending_payment',
            })

            // Перенаправляем на страницу оплаты
            router.push(`/payment/${booking.id}`)
        } catch (err: any) {
            setError(err?.message || 'Не удалось создать запись')
        }
    }

    return (
        <div className="space-y-6">
            {/* Выбор даты */}
            <Card className="booking-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Выберите дату и время
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-sm text-gray-600 mb-4 bg-primary-50/50 p-3 rounded-lg">
                        ⏰ Всё время указано по Москве (МСК)
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-base font-semibold text-gray-900">Выберите дату</label>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-gray-700">
                                    {format(currentMonth, 'MMMM yyyy', { locale: ru })}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handlePreviousMonth}
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
                        </div>

                        {/* Информация о доступном периоде */}
                        <div className="mb-3 text-xs sm:text-sm text-gray-500 text-center bg-blue-50 border border-blue-100 rounded-lg p-2">
                            📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {monthDays.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500 text-sm">В этом месяце нет доступных дат</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-7 gap-2">
                                {/* Пустые ячейки */}
                                {Array.from({ length: emptyCells }).map((_, i) => (
                                    <div key={`empty-${i}`} className="p-3" />
                                ))}

                                {monthDays.map((date) => {
                                    const dateStr = format(date, 'yyyy-MM-dd')
                                    const isSelected = selectedDate && dateStr === format(selectedDate, 'yyyy-MM-dd')
                                    const isToday = dateStr === format(today, 'yyyy-MM-dd')
                                    const isBlocked = blockedDays.has(dateStr)
                                    const isAvailable = !isBlocked

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => isAvailable && setSelectedDate(date)}
                                            disabled={!isAvailable}
                                            className={cn(
                                                'flex flex-col items-center justify-center p-3 rounded-xl transition-all border shadow-sm',
                                                isAvailable && 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer',
                                                !isAvailable && 'opacity-40 cursor-not-allowed border-red-200 bg-red-50',
                                                isSelected &&
                                                'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-lg',
                                                !isSelected && isAvailable && 'border-gray-200 bg-white'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'text-xs uppercase mb-1',
                                                    isSelected ? 'text-white/90' : isAvailable ? 'text-gray-500' : 'text-gray-400'
                                                )}
                                            >
                                                {format(date, 'EEE', { locale: ru })}
                                            </span>
                                            <span
                                                className={cn(
                                                    'text-xl font-bold',
                                                    isSelected ? 'text-white' : isAvailable ? 'text-gray-900' : 'text-gray-400'
                                                )}
                                            >
                                                {format(date, 'd')}
                                            </span>
                                            {isToday && (
                                                <span
                                                    className={cn(
                                                        'text-[10px] mt-1 px-2 py-0.5 rounded-full',
                                                        isSelected
                                                            ? 'bg-white/20 text-white'
                                                            : 'bg-primary-100 text-primary-700'
                                                    )}
                                                >
                                                    Сегодня
                                                </span>
                                            )}
                                            {isBlocked && !isSelected && (
                                                <span className="text-[10px] mt-1 text-red-600">🚫</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Выбранная дата */}
                    {selectedDate && (
                        <div className="bg-primary-50/50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Выбранная дата</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                            </div>
                        </div>
                    )}

                    {/* Выбор времени */}
                    {selectedDate && (
                        <div className="animate-fadeIn">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-primary-500" />
                                <label className="text-base font-semibold text-gray-900">Выберите время</label>
                            </div>

                            {isSlotsLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                                    <p className="mt-3 text-sm text-gray-500">Загрузка слотов...</p>
                                </div>
                            ) : availableSlots && availableSlots.length > 0 ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-4 bg-green-50 border border-green-200 p-3 rounded-lg">
                                        ✅ Доступно {availableSlots.length}{' '}
                                        {availableSlots.length === 1 ? 'слот' : 'слотов'} на{' '}
                                        {format(selectedDate, 'd MMMM', { locale: ru })}
                                    </p>
                                    <div className="grid grid-cols-4 gap-3">
                                        {availableSlots.map((slot) => (
                                            <Button
                                                key={slot}
                                                variant={selectedTime === slot ? 'default' : 'secondary'}
                                                onClick={() => setSelectedTime(slot)}
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
                                    <p className="text-gray-500 text-base">😔 На эту дату нет свободных слотов</p>
                                    <p className="text-sm text-gray-400 mt-2">Попробуйте выбрать другую дату</p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedTime && (
                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                            <p className="text-sm text-green-800">
                                ✅ Выбрано: <strong>{format(selectedDate!, 'd MMMM yyyy', { locale: ru })} в {selectedTime}</strong>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Выбор продукта */}
            <Card className="booking-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary-500" />
                        Выберите продукт
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {products.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500">Нет доступных продуктов</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {products.map((product) => {
                                const isSelected = selectedProductId === product.id
                                return (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => setSelectedProductId(product.id)}
                                        className={cn(
                                            'relative p-4 rounded-xl border transition-all text-left shadow-sm',
                                            'hover:border-primary-300 hover:shadow-md',
                                            isSelected
                                                ? 'border-primary-500 bg-primary-50 shadow-md'
                                                : 'border-gray-200 bg-white'
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                                                    <Check className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="font-semibold text-gray-900 mb-1 pr-8">{product.name}</div>
                                        {product.description && (
                                            <div className="text-sm text-gray-600 mb-2">{product.description}</div>
                                        )}
                                        <div className="text-xl font-bold text-primary-600">
                                            {product.price_rub.toLocaleString('ru-RU')} ₽
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {selectedProductId && (
                        <div className="mt-4 rounded-xl bg-gradient-to-r from-green-50 to-primary-50 border border-green-200/50 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">💰 К оплате</div>
                                    <div className="text-2xl font-bold text-primary-600">
                                        {products.find((p) => p.id === selectedProductId)?.price_rub.toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Описание консультации */}
            <Card className="booking-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary-500" />
                        Описание консультации (необязательно)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Опишите ваш запрос или вопросы, которые хотите обсудить..."
                        className="flex min-h-[100px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                    />
                </CardContent>
            </Card>

            {/* Ошибка */}
            {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Кнопка создания */}
            <div className="flex justify-end">
                <Button
                    onClick={handleCreateBooking}
                    disabled={!selectedDate || !selectedTime || !selectedProductId || createBooking.isPending}
                    size="lg"
                    className="min-w-[200px]"
                >
                    {createBooking.isPending ? 'Создаём запись…' : '✅ Создать запись'}
                </Button>
            </div>
        </div>
    )
}