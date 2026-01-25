'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface ContactFormProps {
    onSuccess?: () => void
}

export function ContactForm({ onSuccess }: ContactFormProps = {}) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Не удалось отправить сообщение')
            }

            toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.')
            setIsSuccess(true)
            setFormData({ name: '', phone: '', email: '', message: '' })

            // Вызываем коллбэк успешной отправки
            if (onSuccess) {
                setTimeout(() => onSuccess(), 2000)
            }

            // Сбросить успех через 5 секунд
            setTimeout(() => setIsSuccess(false), 5000)
        } catch (error: any) {
            toast.error(error.message || 'Произошла ошибка при отправке')
            console.error('Error submitting contact form:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">
                        Ваше имя *
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
                </div>
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
                {!formData.phone && !formData.email && (
                    <p className="text-xs text-gray-500 mt-1">
                        * Укажите телефон или email для обратной связи
                    </p>
                )}
            </div>
            <div>
                <label className="text-sm font-semibold text-gray-800 mb-2 block">
                    Ваше сообщение *
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
                disabled={isSubmitting || isSuccess || !formData.name || !formData.message || (!formData.phone && !formData.email)}
                className="w-full h-12 text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Отправка...
                    </>
                ) : isSuccess ? (
                    <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Отправлено!
                    </>
                ) : (
                    <>
                        <Send className="h-5 w-5 mr-2" />
                        Отправить сообщение
                    </>
                )}
            </Button>
        </form>
    )
}
