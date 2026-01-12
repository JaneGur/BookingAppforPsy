'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { CreditCard, Percent, Package, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Временные данные о записи. В реальности их нужно будет загружать по ID.
const mockBooking = {
    id: '1',
    date: '15 декабря 2024',
    time: '14:00',
    basePrice: 3000,
}

const DISCOUNT_PERCENTAGE = 0.10 // 10%

export default function PaymentPage() {
    const params = useParams()
    const { bookingId } = params

    const [sessionCount, setSessionCount] = useState(1)
    const [hasDiscountCategory, setHasDiscountCategory] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const totalDiscount = useMemo(() => {
        let discount = 0
        if (hasDiscountCategory) {
            discount += DISCOUNT_PERCENTAGE
        }
        if (sessionCount > 1) {
            discount += DISCOUNT_PERCENTAGE
        }
        return Math.min(discount, 0.2) // Максимальная скидка 20%
    }, [hasDiscountCategory, sessionCount])

    const totalPrice = useMemo(() => {
        const total = mockBooking.basePrice * sessionCount
        const discountAmount = total * totalDiscount
        return total - discountAmount
    }, [sessionCount, totalDiscount])

    const handlePayment = async () => {
        setIsLoading(true)
        setPaymentStatus('idle')
        // Имитация запроса к платежной системе
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsLoading(false)
        setPaymentStatus('success')
        // TODO: Отправить запрос на бэкенд для обновления статуса записи
        // TODO: Отправить чек на почту/в соц.сеть
    }

    if (paymentStatus === 'success') {
        return (
            <div className="booking-card max-w-lg mx-auto text-center p-8">
                <h2 className="text-2xl font-bold text-green-600 mb-4">Оплата прошла успешно!</h2>
                <p className="text-gray-600 mb-2">Чек отправлен на вашу электронную почту.</p>
                <p className="text-gray-600">Спасибо за доверие!</p>
            </div>
        )
    }

    return (
        <div className="booking-page-surface p-4 sm:p-6 lg:p-8">
            <div className="max-w-lg mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Оплата консультации</h1>
                    <p className="text-gray-500 mt-1">
                        Запись на {mockBooking.date} в {mockBooking.time}
                    </p>
                </header>

                <div className="info-panel p-6">
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
                                <Percent size={14} className="mr-1"/> Скидка 10% за оплату {sessionCount} сессий единовременно!
                            </p>
                        )}
                        {sessionCount === 1 && (
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Оплата нескольких сессий единовременно даёт скидку 10%
                            </p>
                        )}
                    </div>

                    {/* Льготные категории */}
                    <div className="mb-6">
                        <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                            <Percent size={20} className="mr-2"/>
                            Льготная категория (скидка 10%)
                        </label>
                        <div className="space-y-2">
                            {[
                                { value: 'disabled', label: 'Инвалид' },
                                { value: 'large_family', label: 'Многодетный родитель' },
                                { value: 'pensioner', label: 'Пенсионер' },
                                { value: 'svo', label: 'Участник СВО' },
                            ].map((category) => (
                                <label key={category.value} className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasDiscountCategory}
                                        onChange={(e) => setHasDiscountCategory(e.target.checked)}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="ml-3 text-gray-700">{category.label}</span>
                                </label>
                            ))}
                        </div>
                        {hasDiscountCategory && (
                            <p className="text-sm text-green-600 mt-2 flex items-center">
                                <Percent size={14} className="mr-1"/> Скидка 10% применена!
                            </p>
                        )}
                    </div>
                    
                    {/* Итог */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold mb-2">
                            <span>Итого к оплате:</span>
                            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        {totalDiscount > 0 && (
                             <p className="text-sm text-gray-500 text-right">
                                 Скидка: {(totalDiscount * 100).toFixed(0)}%
                             </p>
                        )}
                    </div>

                    {/* Кнопка оплаты */}
                    <div className="mt-8">
                        <Button
                            onClick={handlePayment}
                            disabled={isLoading}
                            size="lg"
                            className="w-full"
                        >
                            {isLoading ? (
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
                    </div>
                </div>
            </div>
        </div>
    )
}