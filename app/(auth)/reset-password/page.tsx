// app/(auth)/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Lock, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const token = searchParams.get('token') || ''

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [hasError, setHasError] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setErrorText(null)

        // Валидация
        if (newPassword !== confirmPassword) {
            setErrorText('Пароли не совпадают')
            return
        }

        if (newPassword.length < 6) {
            setErrorText('Пароль должен быть не короче 6 символов')
            return
        }

        setIsLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setMessage('✅ Пароль успешно изменен! Перенаправляем на страницу входа...')

                // Автоматический редирект через 2 секунды
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            } else {
                setErrorText(data.error || 'Произошла ошибка. Попробуйте еще раз.')
            }
        } catch (err) {
            console.error(err)
            setErrorText('Ошибка соединения с сервером')
        } finally {
            setIsLoading(false)
        }
    }

    // Если токена нет в URL — показываем страницу ошибки
    if (!token) {
        return (
            <div className="booking-page-surface min-h-screen px-4 py-12 flex items-center justify-center relative overflow-hidden">
                {/* Декоративные элементы */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-300/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="w-full max-w-md relative z-10 animate-[fadeInUp_0.6s_ease-out]">
                    <Card className="border-2 shadow-2xl shadow-red-100/50">
                        <CardHeader className="space-y-1 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
                                    <AlertCircle className="h-5 w-5 text-white" />
                                </div>
                                <CardTitle className="text-2xl">
                                    Ошибка токена
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                                            Токен не найден
                                        </h3>
                                        <p className="text-sm text-red-700">
                                            Пожалуйста, используйте ссылку из письма для сброса пароля.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-semibold text-amber-800 mb-1">
                                            Что делать?
                                        </h3>
                                        <ul className="text-xs text-amber-700 space-y-1">
                                            <li>• Проверьте правильность ссылки</li>
                                            <li>• Запросите новую ссылку восстановления</li>
                                            <li>• Токен мог устареть (действителен 1 час)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/forgot-password" className="flex items-center justify-center gap-2">
                                        <ArrowRight className="h-5 w-5 rotate-180" />
                                        Запросить новую ссылку
                                    </Link>
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="w-full border border-gray-200 hover:bg-gray-50"
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
                                        Написать на email
                                    </Link>
                                    <span className="hidden sm:inline text-gray-400">•</span>
                                    <Link
                                        href="https://t.me/arts_psi"
                                        className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
                                        target="_blank"
                                    >
                                        Telegram
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Основная форма сброса пароля (когда токен ЕСТЬ)
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
                        {success ? 'Пароль изменен!' : 'Сброс пароля'}
                    </h1>
                    <p className="text-gray-600">
                        {success ? 'Вы успешно изменили пароль' : 'Придумайте новый пароль для вашего аккаунта'}
                    </p>
                </div>

                <Card className="border-2 shadow-2xl shadow-primary-100/50">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                {success ? (
                                    <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <CardTitle className="text-2xl">
                                {success ? 'Успешно!' : 'Новый пароль'}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Сообщение об ошибке */}
                        {errorText && (
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 font-medium">{errorText}</p>
                            </div>
                        )}

                        {/* Сообщение об успехе */}
                        {success && message && (
                            <div className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-emerald-800 font-medium mb-1">{message}</p>
                                    <p className="text-xs text-emerald-600">Через 2 секунды вы будете перенаправлены на страницу входа...</p>
                                </div>
                            </div>
                        )}

                        {/* Форма сброса пароля (показывается если нет успеха) */}
                        {!success && (
                            <>
                                {/* Индикатор токена */}
                                <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-blue-800 mb-1">
                                                Установите новый пароль для вашего аккаунта.
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {/* Поле нового пароля */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-primary-600" />
                                            Новый пароль
                                        </label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            placeholder="Введите новый пароль"
                                            required
                                            className="h-14"
                                            disabled={isLoading}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Минимум 6 символов
                                        </p>
                                    </div>

                                    {/* Поле подтверждения пароля */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-primary-600" />
                                            Повторите пароль
                                        </label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="Повторите новый пароль"
                                            required
                                            className="h-14"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    {/* Советы по безопасности */}
                                    <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-amber-800 mb-1">
                                                    Советы по безопасности
                                                </h3>
                                                <ul className="text-xs text-amber-700 space-y-1">
                                                    <li>• Используйте комбинацию букв, цифр и символов</li>
                                                    <li>• Избегайте простых паролей (123456, password)</li>
                                                    <li>• Не используйте личную информацию</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Кнопка отправки */}
                                    <Button
                                        type="submit"
                                        className="w-full group"
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Изменяем пароль...
                                            </>
                                        ) : (
                                            <>
                                                Сбросить пароль
                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* Разделитель (показывается если нет успеха) */}
                        {!success && (
                            <div className="relative pt-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Вспомнили старый пароль?</span>
                                </div>
                            </div>
                        )}

                        {/* Кнопки навигации */}
                        {!success && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="flex-1"
                                    asChild
                                >
                                    <Link href="/login" className="flex items-center justify-center gap-2">
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
                        )}

                        {/* Кнопка перехода на вход после успеха */}
                        {success && (
                            <div className="text-center">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="w-full"
                                    asChild
                                >
                                    <Link href="/login" className="flex items-center justify-center gap-2">
                                        Перейти к входу
                                        <ArrowRight className="h-5 w-5" />
                                    </Link>
                                </Button>

                                <p className="text-xs text-gray-500 mt-3">
                                    Если редирект не сработал, нажмите кнопку выше
                                </p>
                            </div>
                        )}

                        {/* Контакты поддержки */}
                        <div className="text-center text-sm text-gray-500 pt-4 border-t-2 border-gray-100">
                            <p className="mb-2">Нужна помощь?</p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Link
                                    href="mailto:spokludi@yandex.ru"
                                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                    Написать на email
                                </Link>
                                <span className="hidden sm:inline text-gray-400">•</span>
                                <Link
                                    href="https://t.me/arts_psi"
                                    className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
                                    target="_blank"
                                >
                                    Telegram
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ссылка на регистрацию */}
                {!success && (
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600 mb-2">Еще нет аккаунта?</p>
                        <Button variant="link" className="text-primary-600 hover:text-primary-700 font-semibold" asChild>
                            <Link href="/register" className="flex items-center justify-center gap-1">
                                Создать новый аккаунт
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Основной компонент страницы с Suspense
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="booking-page-surface min-h-screen px-4 py-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-600">Загружаем форму сброса пароля...</p>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}