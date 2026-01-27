'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    addDays,
    addMonths,
    eachDayOfInterval,
    endOfMonth,
    format,
    isAfter,
    isBefore,
    isSameMonth,
    startOfDay,
    startOfMonth
} from 'date-fns'
import { ru } from 'date-fns/locale'
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Mail,
    MessageSquare,
    Package,
    Phone,
    User,
    X,
    Calendar,
    ArrowLeft,
    Check,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {Button} from '@/components/ui/button'
import { useAvailableSlots } from '@/lib/hooks/useSlots'
import { useProducts } from '@/lib/hooks/useProducts'

interface CreateBookingModalProps {
    onClose: () => void
    onSuccess: () => void
    clientPreset?: {
        name: string
        phone: string
        email?: string
        telegram?: string
    }
    hideClientStep?: boolean
    open?: boolean
    clientId?: string
    clientPhone?: string
}

export function CreateBookingModal({ onClose, onSuccess, clientPreset, hideClientStep }: CreateBookingModalProps) {
    const [step, setStep] = useState<'date' | 'client' | 'product'>('date')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientEmail, setClientEmail] = useState('')
    const [clientTelegram, setClientTelegram] = useState('')
    const [notes, setNotes] = useState('')
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [blockedDays, setBlockedDays] = useState<Set<string>>(new Set())
    const showClientStep = !hideClientStep

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
                if (!res.ok) return
                const data = (await res.json().catch(() => [])) as string[] | { error?: string }
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

    useEffect(() => {
        if (!clientPreset) return
        setClientName(clientPreset.name || '')
        setClientPhone(clientPreset.phone || '')
        setClientEmail(clientPreset.email || '')
        setClientTelegram(clientPreset.telegram || '')
    }, [clientPreset])

    // Функция для перехода к предыдущему месяцу
    const handlePreviousMonth = () => {
        const prevMonth = addMonths(currentMonth, -1)
        if (!isBefore(startOfMonth(prevMonth), startOfMonth(today))) {
            setCurrentMonth(prevMonth)
            setSelectedDate(null)
            setSelectedTime(undefined)
        }
    }

    // Функция для перехода к следующему месяцу
    const handleNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1)
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

    const handleCreate = async () => {
        if (!selectedDate || !selectedTime || !clientName || !clientPhone || !selectedProductId) {
            setError('Заполните все обязательные поля')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    booking_date: format(selectedDate, 'yyyy-MM-dd'),
                    booking_time: selectedTime,
                    client_name: clientName,
                    client_phone: clientPhone,
                    client_email: clientEmail || undefined,
                    client_telegram: clientTelegram || undefined,
                    notes: notes || undefined,
                    product_id: selectedProductId,
                    status: 'pending_payment',
                }),
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Не удалось создать запись')
            }

            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Не удалось создать запись')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Мобильное модальное окно
    return (
        <div className="fixed inset-0 z-50">
            {/* Бэкдроп с блюром - как в образце */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Модальное окно - мобильная адаптация */}
            <div className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-4xl md:w-full md:max-h-[90vh]">
                <div className="flex flex-col h-full bg-white md:rounded-3xl md:shadow-2xl md:border md:border-gray-200 overflow-hidden">
                    {/* Хедер - мобильный */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-white via-white to-gray-50 border-b border-gray-200 px-4 md:px-8 py-3 md:py-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 md:gap-4">
                                <button
                                    onClick={() => {
                                        if (step === 'product') {
                                            setStep(showClientStep ? 'client' : 'date')
                                        } else if (step === 'client') {
                                            setStep('date')
                                        } else {
                                            onClose()
                                        }
                                    }}
                                    className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md md:shadow-lg flex-shrink-0"
                                >
                                    {step === 'date' ? (
                                        <X className="h-5 w-5 md:h-7 md:w-7 text-white" />
                                    ) : (
                                        <ArrowLeft className="h-5 w-5 md:h-7 md:w-7 text-white" />
                                    )}
                                </button>
                                <div className="max-w-[calc(100%-100px)]">
                                    <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                                        {step === 'date' && 'Выбор даты'}
                                        {step === 'client' && 'Данные клиента'}
                                        {step === 'product' && 'Выбор услуги'}
                                    </h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1 md:gap-2">
                                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                                        <span className="truncate">
                                            {step === 'date' && 'Выберите удобное время'}
                                            {step === 'client' && 'Заполните контактные данные'}
                                            {step === 'product' && 'Выберите услугу из списка'}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Индикатор шагов для мобильных */}
                            <div className="flex md:hidden items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    step === 'date' ? "bg-primary-500" : "bg-gray-300"
                                )} />
                                {showClientStep && (
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        step === 'client' ? "bg-primary-500" :
                                            selectedDate && selectedTime ? "bg-primary-300" : "bg-gray-300"
                                    )} />
                                )}
                                <div className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    step === 'product' ? "bg-primary-500" :
                                        (showClientStep ? (clientName && clientPhone) : (selectedDate && selectedTime)) ? "bg-primary-300" : "bg-gray-300"
                                )} />
                            </div>
                        </div>

                        {/* Шаги для десктопа */}
                        <div className="hidden md:flex items-center gap-2 mt-4">
                            <button
                                onClick={() => setStep('date')}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    step === 'date'
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                )}
                            >
                                1. Дата и время
                            </button>
                            {showClientStep && (
                                <button
                                    onClick={() => selectedDate && selectedTime && setStep('client')}
                                    disabled={!selectedDate || !selectedTime}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                        step === 'client'
                                            ? 'bg-primary-500 text-white shadow-md'
                                            : selectedDate && selectedTime
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    )}
                                >
                                    2. Клиент
                                </button>
                            )}
                            <button
                                onClick={() =>
                                    (showClientStep ? (clientName && clientPhone) : (selectedDate && selectedTime)) && setStep('product')
                                }
                                disabled={showClientStep ? (!clientName || !clientPhone) : (!selectedDate || !selectedTime)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    step === 'product'
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : (showClientStep ? (clientName && clientPhone) : (selectedDate && selectedTime))
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                )}
                            >
                                {showClientStep ? '3. Услуга' : '2. Услуга'}
                            </button>
                        </div>
                    </div>

                    {/* Контент - мобильный */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 bg-gradient-to-b from-white to-gray-50/50">
                        {error && (
                            <div className="mb-4 md:mb-6 bg-red-50 border border-red-200 p-4 rounded-xl">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Шаг 1: Дата и время */}
                        {step === 'date' && (
                            <div className="space-y-4 md:space-y-6">
                                <div className="text-xs md:text-sm text-gray-600 mb-4 bg-primary-50/50 p-3 rounded-lg border border-primary-100">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary-500" />
                                        <span>⏰ Всё время указано по Москве (МСК)</span>
                                    </div>
                                </div>

                                {/* Навигация месяца - мобильная */}
                                <div className="sticky top-0 bg-white py-2 mb-4 border-b border-gray-100 z-10">
                                    <div className="flex items-center justify-between">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handlePreviousMonth}
                                            disabled={!canNavigateBack()}
                                            className="h-8 w-8 md:h-10 md:w-10 p-0 rounded-xl hover:bg-gray-100"
                                        >
                                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                                        </Button>

                                        <div className="text-sm md:text-base font-bold text-gray-900 text-center px-4 py-1.5 bg-gray-100 rounded-xl">
                                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleNextMonth}
                                            disabled={!canNavigateForward()}
                                            className="h-8 w-8 md:h-10 md:w-10 p-0 rounded-xl hover:bg-gray-100"
                                        >
                                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Информация о доступном периоде */}
                                <div className="text-xs md:text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span>
                                            📅 Доступны даты с {format(today, 'd MMMM', { locale: ru })} по {format(maxDate, 'd MMMM yyyy', { locale: ru })}
                                        </span>
                                    </div>
                                </div>

                                {/* Календарь */}
                                <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                                    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3">
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
                                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                                            {Array.from({ length: emptyCells }).map((_, i) => (
                                                <div key={`empty-${i}`} className="p-1" />
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
                                                            'flex flex-col items-center justify-center p-2 md:p-3 rounded-lg md:rounded-xl transition-all border shadow-sm h-14 md:h-16',
                                                            isAvailable && 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer active:scale-95',
                                                            !isAvailable && 'opacity-40 cursor-not-allowed border-red-200 bg-red-50',
                                                            isSelected &&
                                                            'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-lg shadow-primary-200',
                                                            !isSelected && isAvailable && 'border-gray-200 bg-white'
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                'text-[10px] md:text-xs uppercase mb-1',
                                                                isSelected ? 'text-white/90' : isAvailable ? 'text-gray-500' : 'text-gray-400'
                                                            )}
                                                        >
                                                            {format(date, 'EEEEEE', { locale: ru })}
                                                        </span>
                                                        <span
                                                            className={cn(
                                                                'text-sm md:text-xl font-bold',
                                                                isSelected ? 'text-white' : isAvailable ? 'text-gray-900' : 'text-gray-400'
                                                            )}
                                                        >
                                                            {format(date, 'd')}
                                                        </span>
                                                        {isToday && !isSelected && (
                                                            <span className="text-[8px] md:text-[10px] mt-1 px-1.5 md:px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                                                                Сегодня
                                                            </span>
                                                        )}
                                                        {isBlocked && !isSelected && (
                                                            <span className="text-[8px] md:text-[10px] mt-1 text-red-600">🚫</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Выбранная дата */}
                                {selectedDate && (
                                    <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 border border-primary-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                                                <Calendar className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-xs md:text-sm font-medium text-primary-600">Выбранная дата</div>
                                                <div className="text-base md:text-lg font-bold text-gray-900">
                                                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Выбор времени */}
                                {selectedDate && (
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-base md:text-lg font-bold text-gray-900">Выберите время</div>
                                                <div className="text-xs md:text-sm text-gray-600">Доступные слоты</div>
                                            </div>
                                        </div>

                                        {isSlotsLoading ? (
                                            <div className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin text-primary-500 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500">Загрузка доступного времени...</p>
                                            </div>
                                        ) : availableSlots && availableSlots.length > 0 ? (
                                            <>
                                                <div className="mb-4 text-xs md:text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg">
                                                    ✅ Доступно {availableSlots.length} {availableSlots.length === 1 ? 'слот' : 'слотов'} на{' '}
                                                    {format(selectedDate, 'd MMMM', { locale: ru })}
                                                </div>
                                                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                                                    {availableSlots.map((slot) => (
                                                        <button
                                                            key={slot}
                                                            onClick={() => setSelectedTime(slot)}
                                                            className={cn(
                                                                'h-12 md:h-14 rounded-lg md:rounded-xl border transition-all font-medium',
                                                                'active:scale-95',
                                                                selectedTime === slot
                                                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-primary-600 shadow-md'
                                                                    : 'bg-white border-gray-300 text-gray-900 hover:border-primary-400 hover:bg-primary-50'
                                                            )}
                                                        >
                                                            {slot}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-500">На эту дату нет свободных слотов</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Кнопка продолжения */}
                                {selectedDate && selectedTime && (
                                    <button
                                        onClick={() => setStep(showClientStep ? 'client' : 'product')}
                                        className="w-full h-12 md:h-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Продолжить</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Шаг 2: Данные клиента */}
                        {showClientStep && step === 'client' && (
                            <div className="space-y-4 md:space-y-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary-500" />
                                                Имя *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    value={clientName}
                                                    onChange={(e) => setClientName(e.target.value)}
                                                    placeholder="Имя клиента"
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary-500" />
                                                Телефон *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    value={clientPhone}
                                                    onChange={(e) => setClientPhone(e.target.value)}
                                                    placeholder="+7 (999) 999-99-99"
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-primary-500" />
                                                Email
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={clientEmail}
                                                    onChange={(e) => setClientEmail(e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4 text-primary-500" />
                                                Telegram
                                            </label>
                                            <div className="relative">
                                                <input
                                                    value={clientTelegram}
                                                    onChange={(e) => setClientTelegram(e.target.value)}
                                                    placeholder="@username"
                                                    className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Заметки */}
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <label className="text-sm font-medium text-gray-700 mb-3 block">Примечания</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Дополнительная информация..."
                                        className="w-full min-h-[120px] p-4 rounded-xl border border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Кнопки навигации */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep('date')}
                                        className="flex-1 h-12 bg-gray-100 text-gray-900 font-medium rounded-xl border border-gray-300 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Назад
                                    </button>
                                    <button
                                        onClick={() => setStep('product')}
                                        disabled={!clientName || !clientPhone}
                                        className={cn(
                                            "flex-1 h-12 font-medium rounded-xl transition-all flex items-center justify-center gap-2",
                                            clientName && clientPhone
                                                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl active:scale-95"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        <span>Продолжить</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Шаг 3: Продукт */}
                        {step === 'product' && (
                            <div className="space-y-4 md:space-y-6">
                                <div className="bg-white rounded-xl border border-gray-200 p-4">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-base md:text-lg font-bold text-gray-900">Выберите услугу</div>
                                            <div className="text-xs md:text-sm text-gray-600">* Обязательное поле</div>
                                        </div>
                                    </div>

                                    {products.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500">Нет доступных услуг</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {products.map((product) => {
                                                const isSelected = selectedProductId === product.id
                                                return (
                                                    <button
                                                        key={product.id}
                                                        type="button"
                                                        onClick={() => setSelectedProductId(product.id)}
                                                        className={cn(
                                                            'relative p-4 rounded-xl border transition-all text-left w-full group',
                                                            'active:scale-[0.98]',
                                                            isSelected
                                                                ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-primary-100/50 shadow-md'
                                                                : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                                                        )}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                                                                <Check className="h-3 w-3 text-white" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-start gap-3">
                                                            <div className={cn(
                                                                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                                                                isSelected ? "bg-primary-500" : "bg-gray-100"
                                                            )}>
                                                                <Package className={cn(
                                                                    "h-5 w-5",
                                                                    isSelected ? "text-white" : "text-gray-400"
                                                                )} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-900 mb-1 pr-8">{product.name}</div>
                                                                {product.description && (
                                                                    <div className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</div>
                                                                )}
                                                                <div className="text-xl font-bold text-primary-600">
                                                                    {product.price_rub.toLocaleString('ru-RU')} ₽
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Выбранные данные */}
                                {(selectedDate && selectedTime) && (
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl p-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">Дата и время:</div>
                                                <div className="text-sm font-bold text-gray-900">
                                                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })} в {selectedTime}
                                                </div>
                                            </div>
                                            {showClientStep && clientName && (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">Клиент:</div>
                                                    <div className="text-sm font-bold text-gray-900">{clientName}</div>
                                                </div>
                                            )}
                                            {selectedProductId && (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">Услуга:</div>
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {products.find(p => p.id === selectedProductId)?.name}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Кнопки навигации */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(showClientStep ? 'client' : 'date')}
                                        className="flex-1 h-12 bg-gray-100 text-gray-900 font-medium rounded-xl border border-gray-300 hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Назад
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!selectedProductId || isSubmitting}
                                        className={cn(
                                            "flex-1 h-12 font-medium rounded-xl transition-all flex items-center justify-center gap-2",
                                            selectedProductId && !isSubmitting
                                                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl active:scale-95"
                                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Создание...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                Создать запись
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Футер - мобильный */}
                    <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-4 md:px-8 py-3 md:py-4 backdrop-blur-sm">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                            <div className="text-xs md:text-sm text-gray-500 text-center md:text-left">
                                {step === 'date' && 'Выберите дату и время'}
                                {step === 'client' && 'Заполните данные клиента'}
                                {step === 'product' && 'Подтвердите создание записи'}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm border border-gray-300 rounded-xl hover:bg-gray-50 active:scale-95 transition-all flex-1 font-medium"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}