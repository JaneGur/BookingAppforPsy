'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Lock, Mail, Phone, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Page() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [isLoading, setIsLoading] = useState(false)
    const [errorText, setErrorText] = useState<string | null>(null)

    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
    const isAdminLogin = callbackUrl.includes('/admin')

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setErrorText(null)

        const formData = new FormData(e.currentTarget)
        const identifier = String(formData.get('identifier') ?? '')
        const password = String(formData.get('password') ?? '')

        const result = await signIn('credentials', {
            identifier,
            password,
            redirect: false,
            callbackUrl,
        })

        if (!result || result.error) {
            setErrorText('Неверный email или пароль')
            setIsLoading(false)
            return
        }

        router.push(result.url ?? callbackUrl)
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {isAdminLogin ? 'Вход для администратора' : 'Добро пожаловать'}
                    </h1>
                    <p className="text-gray-600">
                        {isAdminLogin ? 'Служебный доступ' : 'Войдите в свой аккаунт'}
                    </p>
                </div>

                <Card className="border-2 shadow-2xl shadow-primary-100/50">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                {isAdminLogin ? (
                                    <ShieldCheck className="h-5 w-5 text-white" />
                                ) : (
                                    <Lock className="h-5 w-5 text-white" />
                                )}
                            </div>
                            <CardTitle className="text-2xl">
                                {isAdminLogin ? 'Административный доступ' : 'Вход в систему'}
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

                        <form className="space-y-5" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary-600" />
                                    Телефон или Email
                                </label>
                                <Input 
                                    name="identifier" 
                                    type="text" 
                                    placeholder="+7 (999) 999-99-99 или email@example.com" 
                                    required 
                                    className="h-14"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary-600" />
                                    Пароль
                                </label>
                                <Input 
                                    name="password" 
                                    type="password" 
                                    placeholder="Введите пароль" 
                                    required 
                                    className="h-14"
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full group" 
                                size="lg" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Входим…
                                    </>
                                ) : (
                                    <>
                                        Войти
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {!isAdminLogin && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Нет аккаунта?</span>
                                </div>
                            </div>
                        )}

                        {!isAdminLogin && (
                            <Button variant="secondary" size="lg" className="w-full" asChild>
                                <Link href="/register">
                                    Создать аккаунт
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            </Button>
                        )}

                        {isAdminLogin && (
                            <div className="text-center text-sm text-gray-500 pt-4 border-t-2 border-gray-100 space-y-3">
                                <div className="flex items-center justify-center gap-2 text-amber-600">
                                    <ShieldCheck className="h-4 w-4" />
                                    <p className="font-semibold">Только для администраторов системы</p>
                                </div>
                                <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold hover:underline inline-flex items-center gap-1">
                                    ← Вернуться на главную
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Ссылка на главную */}
                {!isAdminLogin && (
                    <div className="text-center mt-6">
                        <Link href="/" className="text-sm text-gray-600 hover:text-primary-600 font-medium transition-colors inline-flex items-center gap-1">
                            ← Вернуться на главную
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}