'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CreditCard, CheckCircle, ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PaymentPage() {
    const params = useParams()
    const router = useRouter()
    const bookingId = params.bookingId as string

    const [isLoading, setIsLoading] = useState(true)
    const [countdown, setCountdown] = useState(30)

    // Редрирект через 30 секунд
    useEffect(() => {
        if (!isLoading) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        router.push('/')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [isLoading, router])

    // Имитация загрузки данных заказа
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="booking-page-surface p-4 sm:p-6 lg:p-8">
                <div className="max-w-lg mx-auto">
                    <div className="booking-card text-center p-8">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 mb-6" />
                            <div className="h-6 w-48 bg-gradient-to-r from-primary-100 to-primary-200 rounded mb-4" />
                            <div className="h-4 w-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface p-4 sm:p-6 lg:p-8">
            <div className="max-w-lg mx-auto">
                <div className="booking-card text-center p-6 sm:p-8">
                    {/* Иконка успеха */}
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-lg">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>

                    {/* Заголовок */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                        Спасибо за запись!
                    </h1>

                    {/* Основное сообщение */}
                    <div className="space-y-4 mb-6">
                        <p className="text-gray-600 text-lg">
                            Мы получили вашу заявку на консультацию.
                        </p>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 p-4 rounded-xl">
                            <p className="font-semibold text-blue-800 mb-2">
                                Что дальше?
                            </p>
                            <ul className="text-left text-sm text-blue-700 space-y-2">
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">1</span>
                                    <span>Я свяжусь с вами в течение 30 минут чтобы подтвердить запись и уточнить детали</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">2</span>
                                    <span>Обсудим удобный способ связи и формат консультации</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="inline-block w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center mr-2 flex-shrink-0">3</span>
                                    <span>Вы получите подтверждение и все необходимые инструкции</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Информация о редиректе */}
                    <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                            Автоматический переход через: <span className="font-semibold">{countdown} сек.</span>
                        </span>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => router.push('/')}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Вернуться на главную
                        </Button>
                        {/*<Button*/}
                        {/*    onClick={() => router.push('/')}*/}
                        {/*    className="flex items-center gap-2"*/}
                        {/*>*/}
                        {/*    <CreditCard className="h-4 w-4" />*/}
                        {/*    В личный кабинет*/}
                        {/*</Button>*/}
                    </div>

                    {/* Дополнительная информация */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                            Если у вас есть срочные вопросы:
                        </p>
                        <a
                            href="https://t.me/arts_psi"
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Напишите мне
                        </a>
                    </div>
                </div>

                {/* Вспомогательная информация */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/30 border-2 border-primary-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-primary-700 mb-1">30 мин</div>
                        <div className="text-xs text-primary-600">Среднее время ответа</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100/30 border-2 border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-700 mb-1">24/7</div>
                        <div className="text-xs text-green-600">Поддержка клиентов</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 border-2 border-blue-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-700 mb-1">100%</div>
                        <div className="text-xs text-blue-600">Конфиденциальность</div>
                    </div>
                </div>
            </div>
        </div>
    )
}