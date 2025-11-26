'use client'

import { Lock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { prevStep } from '@/store/slices/bookingSlice'
import { useCreateBookingMutation } from '@/store/api/bookingsApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function StepAuth() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const formData = useAppSelector((state) => state.booking.formData)
    const [createBooking, { isLoading, isSuccess, error }] = useCreateBookingMutation()

    const [phone, setPhone] = useState(formData.phone || '')
    const [code, setCode] = useState('')
    const [codeSent, setCodeSent] = useState(false)

    const handleSendCode = async () => {
        // Здесь должна быть логика отправки кода
        // Пока просто имитируем
        setCodeSent(true)
    }

    const handleVerifyAndBook = async () => {
        if (!code) return

        try {
            const bookingDate = formData.date && formData.time 
                ? `${formData.date}T${formData.time}:00` 
                : undefined

            await createBooking({
                booking_date: formData.date || '',
                booking_time: formData.time || '',
                client_name: formData.name || '',
                client_phone: formData.phone || '',
                client_email: formData.email,
                client_telegram: formData.telegram,
                notes: formData.notes,
                product_id: formData.productId || 1,
                status: 'pending_payment',
            }).unwrap()

            // Перенаправляем на страницу успеха или дашборд
            router.push('/dashboard')
        } catch (err) {
            console.error('Ошибка при создании записи:', err)
        }
    }

    const handleBack = () => {
        dispatch(prevStep())
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary-500" />
                    Шаг 4: Авторизация
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!codeSent ? (
                    <>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Телефон
                            </label>
                            <Input
                                type="tel"
                                placeholder="+7 (999) 999-99-99"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleSendCode} className="w-full" size="lg">
                            Отправить код подтверждения
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="bg-primary-50/50 p-4 rounded-xl">
                            <p className="text-sm text-gray-700">
                                Код подтверждения отправлен на номер{' '}
                                <strong>{phone}</strong>
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Код подтверждения
                            </label>
                            <Input
                                type="text"
                                placeholder="Введите код"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                <p className="text-sm text-red-800">
                                    Ошибка: {error && 'data' in error ? String(error.data) : 'Неизвестная ошибка'}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={handleVerifyAndBook}
                            disabled={!code || isLoading}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? 'Создание записи...' : 'Подтвердить и завершить'}
                        </Button>
                        {isSuccess && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                                <p className="text-sm text-green-800">
                                    Запись успешно создана! Перенаправляем...
                                </p>
                            </div>
                        )}
                    </>
                )}

                <div className="flex justify-start pt-4 border-t">
                    <Button variant="ghost" onClick={handleBack}>
                        Назад
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

