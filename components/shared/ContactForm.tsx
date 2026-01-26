'use client'

import { useState } from 'react'
import { Mail, Send, MessageSquare, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ContactFormProps {
    /** Show as a Card wrapper (default: false) */
    showCard?: boolean
    /** Callback on successful submission */
    onSuccess?: () => void
    /** Show success message inline instead of toast (default: false when showCard=false, true when showCard=true) */
    showInlineSuccess?: boolean
}

export function ContactForm({ 
    showCard = false, 
    onSuccess,
    showInlineSuccess
}: ContactFormProps = {}) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Default showInlineSuccess based on showCard
    const useInlineSuccess = showInlineSuccess ?? showCard

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
        setError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        // Validation
        if (!formData.name.trim()) {
            setError('Пожалуйста, укажите ваше имя')
            setIsSubmitting(false)
            return
        }

        if (!formData.message.trim()) {
            setError('Пожалуйста, напишите сообщение')
            setIsSubmitting(false)
            return
        }

        if (!formData.phone && !formData.email) {
            setError('Укажите телефон или email для обратной связи')
            setIsSubmitting(false)
            return
        }

        // Email validation if provided
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Пожалуйста, укажите корректный email адрес')
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    message: formData.message.trim()
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Не удалось отправить сообщение')
            }

            // Success handling
            if (!useInlineSuccess) {
                toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.')
            }
            
            setIsSuccess(true)
            setFormData({ name: '', phone: '', email: '', message: '' })

            // Callback
            if (onSuccess) {
                setTimeout(() => onSuccess(), 2000)
            }

            // Reset success state
            if (!useInlineSuccess) {
                setTimeout(() => setIsSuccess(false), 5000)
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Произошла ошибка при отправке'
            setError(errorMessage)
            if (!useInlineSuccess) {
                toast.error(errorMessage)
            }
            console.error('Error submitting contact form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl animate-[fadeIn_0.3s_ease-out]">
                    <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">
                        <span className="text-red-500">*</span> Ваше имя
                    </label>
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Как к вам обращаться?"
                        required
                        disabled={isSubmitting}
                        className="h-12"
                    />
                </div>
                <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Email
                    </label>
                    <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                        className="h-12"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-800 mb-2 block">
                    Телефон
                </label>
                <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+7 (___) ___-__-__"
                    disabled={isSubmitting}
                    className="h-12"
                />
                {!formData.phone && !formData.email && (
                    <p className="text-xs text-gray-500 mt-1">
                        * Укажите телефон или email для обратной связи
                    </p>
                )}
            </div>

            <div>
                <label className="text-sm font-semibold text-gray-800 mb-2 block">
                    <span className="text-red-500">*</span> Ваше сообщение
                </label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Расскажите, чем я могу вам помочь..."
                    required
                    disabled={isSubmitting}
                    rows={5}
                    className="flex w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/20 focus-visible:border-primary-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
            </div>

            <Button
                type="submit"
                disabled={isSubmitting || (isSuccess && !useInlineSuccess)}
                className="w-full h-12 text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Отправка...
                    </>
                ) : (isSuccess && !useInlineSuccess) ? (
                    <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Отправлено!
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5 mr-2" />
                        Отправить сообщение
                    </>
                )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
            </p>
        </form>
    )

    // Show inline success message (for Card mode)
    if (isSuccess && useInlineSuccess) {
        const successContent = (
            <div className="text-center p-8">
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
                        onClick={() => setIsSuccess(false)}
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
            </div>
        )

        if (showCard) {
            return (
                <Card className="booking-card">
                    <CardContent className="p-8">
                        {successContent}
                    </CardContent>
                </Card>
            )
        }
        return successContent
    }

    // Render with or without Card wrapper
    if (showCard) {
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
                    {formContent}
                </CardContent>
            </Card>
        )
    }

    return formContent
}
