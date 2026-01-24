'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CreditCard, Percent, Package, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Booking } from '@/types/booking'

const DISCOUNT_PERCENTAGE = 0.10 // 10%

// Список категорий для скидки
const DISCOUNT_CATEGORIES = [
    { value: '', label: 'Нет льготной категории', discount: false },
    { value: 'disabled', label: 'Инвалид', discount: true },
    { value: 'large_family', label: 'Многодетный родитель', discount: true },
    { value: 'pensioner', label: 'Пенсионер', discount: true },
    { value: 'svo', label: 'Участник СВО', discount: true },
]

export default function PaymentPage() {
    const params = useParams()
    const bookingId = params.bookingId as string

    const [booking, setBooking] = useState<Booking | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [sessionCount, setSessionCount] = useState(1)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [error, setError] = useState<string | null>(null)


    // Загружаем данные заказа
    useEffect(() => {
        async function loadBooking() {
            if (!bookingId) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/bookings/${bookingId}`)

                if (!response.ok) {
                    throw new Error('Не удалось загрузить данные записи')
                }

                const data = await response.json()
                setBooking(data)
            } catch (error) {
                console.error('Ошибка загрузки записи:', error)
                setError('Не удалось загрузить данные записи')
            } finally {
                setIsLoading(false)
            }
        }

        loadBooking()
    }, [bookingId])

    const totalDiscount = useMemo(() => {
        let discount = 0
        // Проверяем, выбрана ли категория со скидкой
        const selectedCategoryData = DISCOUNT_CATEGORIES.find(cat => cat.value === selectedCategory)
        if (selectedCategoryData?.discount) {
            discount += DISCOUNT_PERCENTAGE
        }
        if (sessionCount > 1) {
            discount += DISCOUNT_PERCENTAGE
        }
        return Math.min(discount, 0.2) // Максимальная скидка 20%
    }, [selectedCategory, sessionCount])

    const totalPrice = useMemo(() => {
        if (!booking) return 0

        const baseAmount = booking.amount || 0
        const total = baseAmount * sessionCount
        const discountAmount = total * totalDiscount
        return total - discountAmount
    }, [booking, sessionCount, totalDiscount])

    const handlePayment = async () => {
        if (!booking) return

        setIsPaymentLoading(true)
        setPaymentStatus('idle')
        setError(null)

        try {
            // Отправляем данные платежа на сервер
            const response = await fetch(`/api/bookings/${bookingId}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: booking.id,
                    amount: totalPrice,
                    sessionCount,
                    discountCategory: selectedCategory || null,
                    discountPercentage: totalDiscount * 100,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Ошибка оплаты')
            }

            const data = await response.json()

            // Обновляем статус записи на "confirmed"
            await fetch(`/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'confirmed',
                    paid_at: new Date().toISOString(),
                    amount: totalPrice,
                    notes: `Оплачено ${sessionCount} сессий${selectedCategory ? ` (льготная категория: ${selectedCategory})` : ''}`,
                }),
            })

            setPaymentStatus('success')
        } catch (error) {
            console.error('Ошибка оплаты:', error)
            setError(error instanceof Error ? error.message : 'Ошибка при обработке платежа')
            setPaymentStatus('error')
        } finally {
            setIsPaymentLoading(false)
        }
    }

    // Загрузка данных
    if (isLoading) {
        return (
            <div className="booking-card max-w-lg mx-auto text-center p-8">
                <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary-600" />
                <p className="mt-4 text-gray-600">Загрузка данных записи...</p>
            </div>
        )
    }

    // Ошибка загрузки
    if (error && !booking) {
        return (
            <div className="booking-card max-w-lg mx-auto p-6">
                <div className="flex items-center gap-3 text-red-600 mb-4">
                    <AlertCircle className="h-6 w-6" />
                    <h2 className="text-xl font-bold">Ошибка</h2>
                </div>
                <p className="text-gray-700">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="secondary"
                    className="mt-4"
                >
                    Попробовать снова
                </Button>
            </div>
        )
    }

    // Запись не найдена
    if (!booking) {
        return (
            <div className="booking-card max-w-lg mx-auto text-center p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Запись не найдена</h2>
                <p className="text-gray-600 mb-6">Запрашиваемая запись не существует или была удалена</p>
                <Button asChild>
                    <a href="/">Вернуться на главную</a>
                </Button>
            </div>
        )
    }

    // Проверяем статус записи
    if (booking.status !== 'pending_payment') {
        return (
            <div className="booking-card max-w-lg mx-auto p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {booking.status === 'confirmed' ? 'Запись уже оплачена' :
                        booking.status === 'cancelled' ? 'Запись отменена' : 'Невозможно оплатить'}
                </h2>
                <p className="text-gray-600 mb-6">
                    {booking.status === 'confirmed'
                        ? 'Эта запись уже была оплачена ранее.'
                        : booking.status === 'cancelled'
                            ? 'Эта запись была отменена и не может быть оплачена.'
                            : 'Статус записи не позволяет провести оплату.'}
                </p>
                <Button asChild variant="secondary">
                    <a href="/client">Вернуться в личный кабинет</a>
                </Button>
            </div>
        )
    }

    // Успешная оплата
    if (paymentStatus === 'success') {
        return (
            <div className="booking-card max-w-lg mx-auto text-center p-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                    <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">Оплата успешно завершена!</h2>
                <p className="text-gray-600 mb-2">Спасибо за оплату записи.</p>
                <p className="text-gray-600 mb-6">
                    Я свяжусь с вами в течение 30 минут чтобы подтвердить запись.
                </p>
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 p-4 rounded-xl mb-6">
                    <p className="font-semibold text-green-800">Детали оплаты:</p>
                    <p className="text-sm text-green-700 mt-1">
                        Запись #{booking.id} • {booking.booking_date} • {booking.booking_time}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                        Сумма: {totalPrice.toLocaleString('ru-RU')} ₽
                        {totalDiscount > 0 && ` (скидка ${(totalDiscount * 100).toFixed(0)}%)`}
                    </p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button asChild variant="secondary">
                        <a href="/client">В личный кабинет</a>
                    </Button>
                    <Button asChild>
                        <a href={`/bookings/${booking.id}`}>Посмотреть запись</a>
                    </Button>
                </div>
            </div>
        )
    }

    // Форма оплаты
    return (
        <div className="booking-page-surface p-4 sm:p-6 lg:p-8">
            <div className="max-w-lg mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Оплата консультации</h1>
                    <p className="text-gray-500 mt-1">
                        Запись на {new Date(booking.booking_date).toLocaleDateString('ru-RU')} в {booking.booking_time.slice(0, 5)}
                    </p>
                    {/*{booking.client_name && (*/}
                    {/*    <p className="text-sm text-gray-600 mt-2">Для: {booking.client_name}</p>*/}
                    {/*)}*/}
                </header>

                {error && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 p-4 rounded-xl mb-6">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </div>
                )}

                <div className="info-panel p-6">
                    {/* Информация о базовой стоимости */}
                    <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 border-2 border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-700 font-medium">Базовая стоимость одной сессии</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                        </p>
                    </div>

                    {/* Выбор количества сессий */}
                    <div className="mb-6">
                        <label htmlFor="sessions" className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                            <Package size={20} className="mr-2"/>
                            Количество сессий
                        </label>
                        <select
                            id="sessions"
                            value={sessionCount}
                            onChange={(e) => setSessionCount(Number(e.target.value))}
                            className="flex h-12 w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md shadow-sm"
                        >
                            {[...Array(30)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1} {i === 0 ? 'сессия' : i < 4 ? 'сессии' : 'сессий'}
                                </option>
                            ))}
                        </select>
                        {sessionCount > 1 && (
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <Percent size={14} className="mr-1"/>
                                Скидка 10% за оплату {sessionCount} сессий единовременно!
                            </p>
                        )}
                        {sessionCount === 1 && (
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Оплата нескольких сессий единовременно даёт скидку 10%
                            </p>
                        )}
                    </div>

                    {/* Льготные категории (radio buttons) */}
                    <div className="mb-6">
                        <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                            <Percent size={20} className="mr-2"/>
                            Льготная категория (скидка 10%)
                        </label>
                        <div className="space-y-2">
                            {DISCOUNT_CATEGORIES.map((category) => (
                                <label key={category.value} className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="discountCategory"
                                        value={category.value}
                                        checked={selectedCategory === category.value}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-gray-700">{category.label}</span>
                                </label>
                            ))}
                        </div>
                        {selectedCategory && selectedCategory !== '' && (
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <Percent size={14} className="mr-1"/> Скидка 10% применена!
                            </p>
                        )}
                    </div>

                    {/* Итог */}
                    <div className="border-t pt-4">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Базовая стоимость ({sessionCount} сессий):</span>
                                <span>{((booking.amount || 0) * sessionCount).toLocaleString('ru-RU')} ₽</span>
                            </div>
                            {totalDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Скидка ({(totalDiscount * 100).toFixed(0)}%):</span>
                                    <span>-{(((booking.amount || 0) * sessionCount) * totalDiscount).toLocaleString('ru-RU')} ₽</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold border-t pt-3">
                            <span>Итого к оплате:</span>
                            <span className="text-2xl text-primary-700">{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                    </div>

                    {/* Кнопка оплаты */}
                    <div className="mt-8">
                        <Button
                            onClick={handlePayment}
                            disabled={isPaymentLoading}
                            size="lg"
                            className="w-full shadow-xl"
                        >
                            {isPaymentLoading ? (
                                <>
                                    <Loader2 className="animate-spin h-5 w-5 mr-2"/>
                                    Обработка платежа...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="h-5 w-5 mr-2"/>
                                    Оплатить {totalPrice.toLocaleString('ru-RU')} ₽
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-gray-500 text-center mt-3">
                            Нажимая кнопку, вы соглашаетесь с условиями оказания услуг
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}