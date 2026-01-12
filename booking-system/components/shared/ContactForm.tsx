'use client'

import { useState } from 'react'
import { Mail, Send, MessageSquare } from 'lucide-react'
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

        try {
            // TODO: Реализовать отправку на бэкенд
            // const res = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, email, phone, message }),
            // })

            // Пока имитация
            await new Promise((resolve) => setTimeout(resolve, 1000))
            setIsSubmitted(true)
            setName('')
            setEmail('')
            setPhone('')
            setMessage('')
        } catch (err) {
            setError('Не удалось отправить сообщение. Попробуйте позже.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSubmitted) {
        return (
            <Card className="booking-card">
                <CardContent className="p-6 text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <Mail className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Спасибо за ваше сообщение!</h3>
                    <p className="text-gray-600 mb-4">
                        Я получил(а) ваше сообщение и свяжусь с вами в ближайшее время.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Отправить ещё одно сообщение
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    Связаться со мной
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Имя *
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ваше имя"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Email *
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Телефон
                        </label>
                        <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (999) 999-99-99"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Сообщение *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Опишите ваш вопрос или запрос..."
                            required
                            className="flex min-h-[120px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                        />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Send className="h-5 w-5 mr-2 animate-pulse" />
                                Отправка...
                            </>
                        ) : (
                            <>
                                <Send className="h-5 w-5 mr-2" />
                                Отправить сообщение
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

