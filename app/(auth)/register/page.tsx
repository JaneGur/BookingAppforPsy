'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { User, Mail, Phone, Lock, UserPlus, ArrowRight, AlertCircle, Check } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { normalizePhone, validatePhone } from '@/lib/utils/phone'

export default function Page() {
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState<string | null>(null)

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setErrorText(null)

        const formData = new FormData(e.currentTarget)
        const name = String(formData.get('name') ?? '').trim()
        const email = String(formData.get('email') ?? '').trim()
        const phoneRaw = String(formData.get('phone') ?? '').trim()
        const password = String(formData.get('password') ?? '')
        const passwordConfirm = String(formData.get('passwordConfirm') ?? '')

        if (!name) {
            setErrorText('Введите имя')
            setIsLoading(false)
            return
        }

        if (!validatePhone(phoneRaw)) {
            setErrorText('Введите корректный телефон (10-11 цифр, начинается с 7)')
            setIsLoading(false)
            return
        }

        if (password.length < 6) {
            setErrorText('Пароль должен быть не короче 6 символов')
            setIsLoading(false)
            return
        }

        if (password !== passwordConfirm) {
            setErrorText('Пароли не совпадают')
            setIsLoading(false)
            return
        }

        const phone = normalizePhone(phoneRaw)

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password }),
        })

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null
            setErrorText(data?.error ?? 'Не удалось зарегистрироваться')
            setIsLoading(false)
            return
        }

        const loginResult = await signIn('credentials', {
            identifier: email || phone,
            password,
            redirect: false,
            callbackUrl: '/dashboard',
        })

        if (!loginResult || loginResult.error) {
            router.push('/login')
            router.refresh()
            return
        }

        router.push(loginResult.url ?? '/dashboard')
        router.refresh()
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
                            <span className="text-2xl">🌿</span>
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Создайте аккаунт
                    </h1>
                    <p className="text-gray-600">
                        Начните свой путь к внутренней гармонии
                    </p>
                </div>

                <Card className="border-2 shadow-2xl shadow-primary-100/50">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <CardTitle className="text-2xl">Регистрация</CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 pl-13">Заполните форму для создания аккаунта</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errorText && (
                            <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-800 font-medium">{errorText}</p>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary-600" />
                                    Ваше имя
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    name="name" 
                                    type="text" 
                                    placeholder="Как к вам обращаться?" 
                                    required 
                                    className="h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary-600" />
                                    Email
                                    <span className="text-gray-400 text-xs">(опционально)</span>
                                </label>
                                <Input 
                                    name="email" 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    className="h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary-600" />
                                    Телефон
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input 
                                    name="phone" 
                                    type="tel" 
                                    placeholder="+7 (999) 999-99-99" 
                                    required 
                                    className="h-14"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-primary-600" />
                                        Пароль
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        name="password" 
                                        type="password" 
                                        placeholder="Мин. 6 символов" 
                                        required 
                                        className="h-14"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary-600" />
                                        Повторите
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input 
                                        name="passwordConfirm" 
                                        type="password" 
                                        placeholder="Повторите пароль" 
                                        required 
                                        className="h-14"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button 
                                    type="submit" 
                                    className="w-full group" 
                                    size="lg" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Создаём аккаунт…
                                        </>
                                    ) : (
                                        <>
                                            Зарегистрироваться
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Уже есть аккаунт?</span>
                            </div>
                        </div>

                        <Button variant="secondary" size="lg" className="w-full" asChild>
                            <Link href="/login">
                                Войти
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Ссылка на главную */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors inline-flex items-center gap-1">
                        ← Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    )
}