'use client'

import { format, parse } from 'date-fns'
import { Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { nextStep, prevStep } from '@/store/slices/bookingSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function StepConfirmation() {
    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.booking.formData)

    const handleNext = () => {
        dispatch(nextStep())
    }

    const handleBack = () => {
        dispatch(prevStep())
    }

    const formattedDate = formData.date
        ? format(parse(formData.date, 'yyyy-MM-dd', new Date()), 'dd.MM.yyyy')
        : ''

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary-500" />
                    Шаг 3: Подтверждение
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-primary-50/50 p-4 rounded-xl space-y-3">
                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">
                            Дата и время
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                            {formattedDate} в {formData.time}
                        </div>
                    </div>

                    <div className="border-t border-primary-200 pt-3">
                        <div className="text-sm font-medium text-gray-600 mb-1">Имя</div>
                        <div className="text-base text-gray-900">{formData.name}</div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Телефон</div>
                        <div className="text-base text-gray-900">{formData.phone}</div>
                    </div>

                    {formData.email && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Email</div>
                            <div className="text-base text-gray-900">{formData.email}</div>
                        </div>
                    )}

                    {formData.telegram && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                                Telegram
                            </div>
                            <div className="text-base text-gray-900">{formData.telegram}</div>
                        </div>
                    )}

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-2">
                            Стоимость консультации
                        </div>
                        <div className="text-2xl font-bold text-primary-600">3,000 ₽</div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <p className="text-sm text-yellow-800">
                        <strong>Внимание:</strong> После подтверждения вам будет отправлена
                        информация для оплаты. Запись будет подтверждена после оплаты.
                    </p>
                </div>

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="secondary" onClick={handleBack}>
                        Назад
                    </Button>
                    <Button onClick={handleNext} size="lg">
                        Подтвердить и продолжить
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

