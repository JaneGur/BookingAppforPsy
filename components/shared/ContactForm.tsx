'use client'

import { useState } from 'react'
import { Mail, Send, MessageSquare, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ContactForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Клиентская валидация
        if (!name.trim()) {
            setError('Пожалуйста, укажите ваше имя')
            setIsSubmitting(false)
            return
        }

        if (!email.trim()) {
            setError('Пожалуйста, укажите ваш email')
            setIsSubmitting(false)
            return
        }

        if (!message.trim()) {
            setError('Пожалуйста, напишите сообщение')
            setIsSubmitting(false)
            return
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Пожалуйста, укажите корректный email адрес')
            setIsSubmitting(false)
            return
        }

        try {
            console.log('Sending contact form data:', { name, email, phone, message })

            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone ? phone.trim() : '',
                    message: message.trim()
                }),
            })

            const data = await res.json()

            console.log('Contact form response:', { status: res.status, data })

            if (!res.ok) {
                throw new Error(data.error || 'Ошибка при отправке сообщения')
            }

            // Успешная отправка
            setIsSubmitted(true)
            setName('')
            setEmail('')
            setPhone('')
            setMessage('')

        } catch (err) {
            console.error('Contact form submission error:', err)
            setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение. Попробуйте позже.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <Card className="booking-card">
                <CardContent className="p-8 text-center">
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-4">
                            <CheckCircle className="h-10 w-10 text-emerald-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Сообщение отправлено!</h3>
                    <p className="text-gray-600 mb-2">
                        Я получила ваше сообщение и свяжусь с вами в ближайшее время.
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Обычно я отвечаю в течение 24 часов
                    </p>
                    <div className="space-y-3">
                        <Button
                            variant="default"
                            onClick={() => setIsSubmitted(false)}
                            className="w-full"
                        >
                            Отправить ещё одно сообщение
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => window.location.href = '/'}
                            className="w-full"
                        >
                            Вернуться на главную
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <div>Связаться со мной</div>
                        <div className="text-sm font-normal text-gray-500 mt-1">
                            Отвечаю обычно в течение 24 часов
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl animate-[fadeIn_0.3s_ease-out]">
                            <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <span className="text-red-500">*</span>
                                Имя
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ваше имя"
                                required
                                className="h-14"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <span className="text-red-500">*</span>
                                Email
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                                className="h-14"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Телефон (необязательно)
                        </label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (999) 999-99-99"
                            className="h-14"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <span className="text-red-500">*</span>
                            Сообщение
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Опишите ваш вопрос или запрос..."
                            required
                            disabled={isSubmitting}
                            className="flex min-h-[150px] w-full rounded-xl border-2 border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-4 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full group"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                    Отправка...
                                </>
                            ) : (
                                <>
                                    <Send className="h-5 w-5 mr-3 group-hover:translate-x-1 transition-transform" />
                                    Отправить сообщение
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center mt-3">
                            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}