// app/(auth)/forgot-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Mail, Phone, ArrowRight, Lock, ShieldCheck, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Path } from '@/lib/routing'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState<string | null>(null)

    // Редирект уже авторизованных пользователей
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            if (session.user.role === 'admin') {
                router.push(Path.AdminDashboard)
            } else {
                router.push(Path.ClientDashboard)
            }
        }
    }, [status, session, router])

    // Показываем загрузку пока проверяем сессию
    if (status === 'loading') {
        return (
            <div className="booking-page-surface min-h-screen px-4 py-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Загрузка...</p>
                </div>
            </div>
        )
    }

    // Если пользователь авторизован, не показываем форму (он будет редиректнут)
    if (status === 'authenticated') {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setErrorText(null)
        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email || undefined,
                    phone: phone || undefined
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('📬 Письмо отправлено! Проверьте вашу почту для восстановления пароля.')
                setEmail('')
                setPhone('')

                // Через 3 секунды перенаправляем на главную
                setTimeout(() => {
                    router.push('/')
                }, 3000)
            } else {
                setErrorText(data.error || 'Что-то пошло не так. Попробуйте еще раз.')
            }
        } catch (err) {
            console.error(err)
            setErrorText('Ошибка соединения с сервером')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="booking-page-surface min-h-screen px-4 py-12 flex items-center justify-center relative overflow-hidden">
            {/* Декоративные элементы */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="w-full max-w-md relative z-10 animate-[fadeInUp_0.6s_ease-out]">
                {/* Логотип / Заголовок сверху */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center justify-center gap-3 group mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                            <Lock className="h-7 w-7 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Восстановление пароля
                    </h1>
                    <p className="text-gray-600">
                        Мы отправим ссылку для сброса пароля на ваш email
                    </p>
                </div>

                <Card className="border-2 shadow-2xl shadow-primary-100/50">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                <ShieldCheck className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-2xl">
                                Восстановление доступа
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errorText && (
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 font-medium">{errorText}</p>
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-emerald-800 font-medium mb-1">{message}</p>
                                    <p className="text-xs text-emerald-600">Через 3 секунды вы будете перенаправлены на главную...</p>
                                </div>
                            </div>
                        )}

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* Поле Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary-600" />
                                    Email адрес
                                </label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ваш@email.com"
                                    required
                                    className="h-14"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Или</span>
                                </div>
                            </div>

                            {/* Поле телефона */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary-600" />
                                    Номер телефона
                                </label>
                                <Input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+7 (999) 999-99-99"
                                    className="h-14"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                            <Lock className="h-4 w-4 text-amber-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-amber-800 mb-1">
                                            Что дальше?
                                        </h3>
                                        <ul className="text-xs text-amber-700 space-y-1">
                                            <li>• Проверьте папку Спам, если письмо не пришло</li>
                                            <li>• Ссылка действительна в течение 1 часа</li>
                                            <li>• После восстановления вы сможете войти с новым паролем</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full group"
                                size="lg"
                                disabled={isLoading || (!email && !phone)}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Отправляем...
                                    </>
                                ) : (
                                    <>
                                        Отправить ссылку
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="relative pt-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Вспомнили пароль?</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="secondary" size="lg" className="flex-1" asChild>
                                <Link href="/login">
                                    <ArrowRight className="h-5 w-5 rotate-180" />
                                    Вернуться к входу
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="flex-1 border border-gray-200 hover:bg-gray-50"
                                asChild
                            >
                                <Link href="/" className="flex items-center justify-center gap-2">
                                    На главную
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>

                        <div className="text-center text-sm text-gray-500 pt-4 border-t-2 border-gray-100">
                            <p className="mb-2">Нужна помощь?</p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Link
                                    href="mailto:spokludi@yandex.ru"
                                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                    <Mail className="h-4 w-4" />
                                    Написать на email
                                </Link>
                                <span className="hidden sm:inline text-gray-400">•</span>
                                <Link
                                    href="https://t.me/arts_psi"
                                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
                                    target="_blank"
                                >
                                    <Phone className="h-4 w-4" />
                                    Telegram
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ссылка на регистрацию */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600 mb-2">Еще нет аккаунта?</p>
                    <Button variant="link" className="text-primary-600 hover:text-primary-700 font-semibold" asChild>
                        <Link href="/register">
                            Создать новый аккаунт
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}