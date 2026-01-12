'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { ru } from 'date-fns/locale'
import { X, Calendar, Clock, User, Phone, Mail, MessageSquare, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { useGetAvailableSlotsQuery } from '@/store/api/slotsApi'
import { useGetProductsQuery } from '@/store/api/productsApi'

interface CreateBookingModalProps {
    onClose: () => void
    onSuccess: () => void
}

export function CreateBookingModal({ onClose, onSuccess }: CreateBookingModalProps) {
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

    const { data: products = [] } = useGetProductsQuery()
    const dateForQuery = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    const { data: availableSlots, isLoading: isSlotsLoading } = useGetAvailableSlotsQuery(
        dateForQuery,
        { skip: !selectedDate }
    )

    const today = startOfDay(new Date())
    const maxDate = addDays(today, 30)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

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
    }, [currentMonth, monthStart, monthEnd])

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

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="booking-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Создать новую запись</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Шаги */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setStep('date')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                step === 'date'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            )}
                        >
                            1. Дата и время
                        </button>
                        <button
                            onClick={() => selectedDate && selectedTime && setStep('client')}
                            disabled={!selectedDate || !selectedTime}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                step === 'client'
                                    ? 'bg-primary-500 text-white'
                                    : selectedDate && selectedTime
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            2. Клиент
                        </button>
                        <button
                            onClick={() => clientName && clientPhone && setStep('product')}
                            disabled={!clientName || !clientPhone}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                step === 'product'
                                    ? 'bg-primary-500 text-white'
                                    : clientName && clientPhone
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            )}
                        >
                            3. Продукт
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Шаг 1: Дата и время */}
                    {step === 'date' && (
                        <div className="space-y-4">
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
                                                onClick={() => {
                                                    const newMonth = new Date(currentMonth)
                                                    newMonth.setMonth(newMonth.getMonth() - 1)
                                                    if (newMonth >= startOfMonth(today)) {
                                                        setCurrentMonth(newMonth)
                                                    }
                                                }}
                                                disabled={currentMonth <= startOfMonth(today)}
                                                className="h-8 w-8"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newMonth = new Date(currentMonth)
                                                    newMonth.setMonth(newMonth.getMonth() + 1)
                                                    if (newMonth <= startOfMonth(maxDate)) {
                                                        setCurrentMonth(newMonth)
                                                    }
                                                }}
                                                disabled={currentMonth >= startOfMonth(maxDate)}
                                                className="h-8 w-8"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map(
                                        (_, i) => (
                                            <div key={`empty-${i}`} className="p-3" />
                                        )
                                    )}

                                    {monthDays.map((date) => {
                                        const dateStr = format(date, 'yyyy-MM-dd')
                                        const isSelected = selectedDate && dateStr === format(selectedDate, 'yyyy-MM-dd')
                                        const isToday = dateStr === format(today, 'yyyy-MM-dd')
                                        const isPast = date < today
                                        const isFuture = date > maxDate
                                        const isBlocked = blockedDays.has(dateStr)
                                        const isAvailable = !isPast && !isFuture && !isBlocked && dateStr >= format(today, 'yyyy-MM-dd')

                                        return (
                                            <button
                                                key={date.toISOString()}
                                                onClick={() => isAvailable && setSelectedDate(date)}
                                                disabled={!isAvailable}
                                                className={cn(
                                                    'flex flex-col items-center justify-center p-3 rounded-xl transition-all border shadow-sm',
                                                    isAvailable && 'hover:border-primary-300 hover:bg-primary-50 cursor-pointer',
                                                    !isAvailable && 'opacity-40 cursor-not-allowed',
                                                    isSelected &&
                                                        'bg-gradient-to-br from-primary-400 to-primary-500 text-white border-primary-500 shadow-md',
                                                    !isSelected && isAvailable && 'border-gray-200 bg-white',
                                                    !isSelected && !isAvailable && 'border-gray-100 bg-gray-50',
                                                    isBlocked && 'border-red-200 bg-red-50'
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
                            </div>

                            {selectedDate && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-5 h-5 text-primary-500" />
                                        <label className="text-base font-semibold text-gray-900">Выберите время</label>
                                    </div>

                                    {isSlotsLoading ? (
                                        <div className="text-center py-8">
                                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-primary-400 border-r-transparent"></div>
                                        </div>
                                    ) : availableSlots && availableSlots.length > 0 ? (
                                        <div className="grid grid-cols-4 gap-3">
                                            {availableSlots.map((slot) => (
                                                <Button
                                                    key={slot}
                                                    variant={selectedTime === slot ? 'default' : 'secondary'}
                                                    onClick={() => setSelectedTime(slot)}
                                                    className={cn(
                                                        'h-12',
                                                        selectedTime === slot && 'ring-2 ring-primary-300'
                                                    )}
                                                >
                                                    {slot}
                                                </Button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500">На эту дату нет свободных слотов</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedDate && selectedTime && (
                                <Button onClick={() => setStep('client')} className="w-full" size="lg">
                                    Продолжить →
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Шаг 2: Данные клиента */}
                    {step === 'client' && (
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Имя *
                                    </label>
                                    <Input
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        placeholder="Имя клиента"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        Телефон *
                                    </label>
                                    <Input
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="+7 (999) 999-99-99"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </label>
                                    <Input
                                        type="email"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Telegram
                                    </label>
                                    <Input
                                        value={clientTelegram}
                                        onChange={(e) => setClientTelegram(e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Примечания</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Дополнительная информация..."
                                    className="flex min-h-[100px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setStep('date')} className="flex-1">
                                    Назад
                                </Button>
                                <Button
                                    onClick={() => setStep('product')}
                                    disabled={!clientName || !clientPhone}
                                    className="flex-1"
                                    size="lg"
                                >
                                    Продолжить →
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Шаг 3: Продукт */}
                    {step === 'product' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Продукт *
                                </label>
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
                                                                <span className="text-white text-xs">✓</span>
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
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setStep('client')} className="flex-1">
                                    Назад
                                </Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={!selectedProductId || isSubmitting}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {isSubmitting ? 'Создание...' : '✅ Создать запись'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

