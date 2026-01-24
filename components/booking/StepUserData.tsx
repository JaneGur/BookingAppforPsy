'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import { useBookingForm } from '@/lib/contexts/BookingContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function StepUserData() {
    const { formData, nextStep, prevStep, updateFormData } = useBookingForm()

    const [name, setName] = useState(formData.name || '')
    const [phone, setPhone] = useState(formData.phone || '')
    const [email, setEmail] = useState(formData.email || '')
    const [telegram, setTelegram] = useState(formData.telegram || '')
    const [notes, setNotes] = useState(formData.notes || '')

    const handleNext = () => {
        updateFormData({
            name,
            phone,
            email,
            telegram,
            notes,
        })
        nextStep()
    }

    const handleBack = () => {
        prevStep()
    }

    const isFormValid = name.trim() && phone.trim()

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    Шаг 2: Ваши данные
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Имя <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Введите ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Телефон <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Email
                    </label>
                    <Input
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Telegram
                    </label>
                    <Input
                        type="text"
                        placeholder="@username"
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Дополнительная информация
                    </label>
                    <textarea
                        className="flex h-24 w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-base transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                        placeholder="Сообщите дополнительную информацию, если необходимо"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
                    <Button variant="secondary" onClick={handleBack} className="w-full sm:w-auto">
                        Назад
                    </Button>
                    <Button onClick={handleNext} disabled={!isFormValid} size="lg" className="w-full sm:w-auto">
                        Далее
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

