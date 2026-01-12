'use client'

import { Lock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { prevStep, resetBooking } from '@/store/slices/bookingSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { normalizePhone, validatePhone } from '@/lib/utils/phone'

export function StepAuth() {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const formData = useAppSelector((state) => state.booking.formData)

    const [activeTab, setActiveTab] = useState<'login' | 'register' | 'later'>('login')
    const [isLoading, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState<string | null>(null)

    const [loginIdentifier, setLoginIdentifier] = useState(formData.phone || formData.email || '')
    const [loginPassword, setLoginPassword] = useState('')

    const [regName, setRegName] = useState(formData.name || '')
    const [regEmail, setRegEmail] = useState(formData.email || '')
    const [regPhone] = useState(formData.phone || '')
    const [regTelegram, setRegTelegram] = useState(formData.telegram || '')
    const [regPassword, setRegPassword] = useState('')
    const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

    const handleLogin = async () => {
        setIsLoading(true)
        setErrorText(null)

        const result = await signIn('credentials', {
            identifier: loginIdentifier,
            password: loginPassword,
            redirect: false,
            callbackUrl: '/dashboard',
        })

        if (!result || result.error) {
            setErrorText('Неверный телефон/email или пароль')
            setIsLoading(false)
            return
        }

        dispatch(resetBooking())
        router.push(result.url ?? '/dashboard')
        router.refresh()
    }

    const handleRegister = async () => {
        setIsLoading(true)
        setErrorText(null)

        if (!regName.trim()) {
            setErrorText('Введите имя')
            setIsLoading(false)
            return
        }

        if (!validatePhone(regPhone)) {
            setErrorText('Введите корректный телефон')
            setIsLoading(false)
            return
        }

        if (regPassword.length < 6) {
            setErrorText('Пароль должен быть не короче 6 символов')
            setIsLoading(false)
            return
        }

        if (regPassword !== regPasswordConfirm) {
            setErrorText('Пароли не совпадают')
            setIsLoading(false)
            return
        }

        const phone = normalizePhone(regPhone)
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: regName,
                email: regEmail,
                phone,
                password: regPassword,
                telegram: regTelegram,
            }),
        })

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null
            setErrorText(data?.error ?? 'Не удалось зарегистрироваться')
            setIsLoading(false)
            return
        }

        const loginResult = await signIn('credentials', {
            identifier: regEmail || phone,
            password: regPassword,
            redirect: false,
            callbackUrl: '/dashboard',
        })

        if (!loginResult || loginResult.error) {
            router.push('/login')
            router.refresh()
            return
        }

        dispatch(resetBooking())
        router.push(loginResult.url ?? '/dashboard')
        router.refresh()
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
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    <p className="text-sm text-green-800">
                        🎉 Ваш заказ успешно создан!
                    </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <p className="text-sm text-yellow-800">
                        ⏳ Заказ ожидает оплаты. Для завершения записи войдите в личный кабинет и перейдите к оплате.
                    </p>
                </div>

                {errorText && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                        <p className="text-sm text-red-800">{errorText}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={activeTab === 'login' ? 'default' : 'secondary'}
                        onClick={() => setActiveTab('login')}
                        className="flex-1"
                    >
                        🔐 Войти
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === 'register' ? 'default' : 'secondary'}
                        onClick={() => setActiveTab('register')}
                        className="flex-1"
                    >
                        📝 Регистрация
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === 'later' ? 'default' : 'secondary'}
                        onClick={() => setActiveTab('later')}
                        className="flex-1"
                    >
                        💳 Позже
                    </Button>
                </div>

                {activeTab === 'login' && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                📱 Телефон или Email
                            </label>
                            <Input
                                type="text"
                                placeholder="+7 (999) 999-99-99 или email@example.com"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                🔑 Пароль
                            </label>
                            <Input
                                type="password"
                                placeholder="Введите пароль"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>

                        <Button onClick={handleLogin} className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Входим…' : '🔐 Войти и перейти к оплате'}
                        </Button>
                    </div>
                )}

                {activeTab === 'register' && (
                    <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    👤 Имя
                                </label>
                                <Input
                                    type="text"
                                    value={regName}
                                    onChange={(e) => setRegName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    📧 Email
                                </label>
                                <Input
                                    type="email"
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    📱 Телефон
                                </label>
                                <Input type="tel" value={regPhone} disabled />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    💬 Telegram
                                </label>
                                <Input
                                    type="text"
                                    value={regTelegram}
                                    onChange={(e) => setRegTelegram(e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    🔑 Придумайте пароль
                                </label>
                                <Input
                                    type="password"
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    🔑 Подтвердите пароль
                                </label>
                                <Input
                                    type="password"
                                    value={regPasswordConfirm}
                                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={handleRegister} className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? 'Создаём аккаунт…' : '📝 Зарегистрироваться и перейти к оплате'}
                        </Button>
                    </div>
                )}

                {activeTab === 'later' && (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Важно: Без авторизации вы не сможете управлять заказом.
                            </p>
                        </div>
                        <div className="bg-primary-50/50 p-4 rounded-xl">
                            <p className="text-sm text-gray-700">
                                📌 Что делать дальше: 1) Вернитесь на главную, 2) Войдите в кабинет, 3) Найдите заказ,
                                4) Оплатите.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    dispatch(resetBooking())
                                    router.push('/')
                                }}
                            >
                                🏠 На главную
                            </Button>
                            <Button className="flex-1" onClick={() => setActiveTab('login')}>
                                🔐 Войти сейчас
                            </Button>
                        </div>
                    </div>
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

