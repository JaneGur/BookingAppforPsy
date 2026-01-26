'use client'

import { useState } from 'react'
import { User, Phone, Mail, MessageSquare, Info } from 'lucide-react'
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

    // Форматирование телефона
    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 1) return `+${numbers}`
        if (numbers.length <= 4) return `+${numbers.slice(0, 1)} (${numbers.slice(1)}`
        if (numbers.length <= 7) return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4)}`
        return `+${numbers.slice(0, 1)} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value)
        setPhone(formatted)
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                    Шаг 2: Ваши данные
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Заполните контактные данные для связи
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Имя */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-primary-500" />
                        Имя <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Введите ваше имя"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-12 sm:h-11 text-base"
                        autoComplete="name"
                    />
                </div>

                {/* Телефон */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-primary-500" />
                        Телефон <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        value={phone}
                        onChange={handlePhoneChange}
                        required
                        className="h-12 sm:h-11 text-base"
                        autoComplete="tel"
                        inputMode="tel"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary-500" />
                        Email
                    </label>
                    <Input
                        type="email"
                        placeholder="example@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 sm:h-11 text-base"
                        autoComplete="email"
                        inputMode="email"
                    />
                </div>

                {/* Telegram */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-primary-500" />
                        Telegram
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            @
                        </span>
                        <Input
                            type="text"
                            placeholder="username"
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value.replace('@', ''))}
                            className="h-12 sm:h-11 text-base pl-8"
                        />
                    </div>
                </div>

                {/* Дополнительная информация */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-primary-500" />
                        Дополнительная информация
                    </label>
                    <textarea
                        className="flex h-32 sm:h-24 w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-base transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                        placeholder="Сообщите дополнительную информацию, если необходимо"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Например, предпочитаемый способ связи или тема консультации
                    </p>
                </div>

                {/* Подсказка */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4">
                    <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-blue-800 font-medium">
                                Ваши данные в безопасности
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Мы используем ваши контакты только для связи по поводу записи.
                                Все данные защищены и не передаются третьим лицам.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Кнопки навигации */}
                <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t">
                    <Button
                        variant="secondary"
                        onClick={handleBack}
                        className="w-full sm:w-auto h-12 sm:h-auto"
                    >
                        Назад
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={!isFormValid}
                        size="lg"
                        className="w-full sm:w-auto h-12 sm:h-auto text-base"
                    >
                        Продолжить
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}