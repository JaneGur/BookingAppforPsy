'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

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
        <div className="booking-page-surface min-h-screen px-4 py-10">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {isAdminLogin ? '🔐 Служебный вход для администратора' : '🔐 Вход'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errorText && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                <p className="text-sm text-red-800">{errorText}</p>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">📱 Телефон или Email</label>
                                <Input name="identifier" type="text" placeholder="+7 (999) 999-99-99 или email@example.com" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Пароль</label>
                                <Input name="password" type="password" placeholder="Введите пароль" required />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Входим…' : 'Войти'}
                            </Button>
                        </form>

                        {!isAdminLogin && (
                            <div className="text-sm text-gray-600">
                                Нет аккаунта?{' '}
                                <Link href="/register" className="text-primary-600 font-semibold hover:underline">
                                    Зарегистрироваться
                                </Link>
                            </div>
                        )}
                        {isAdminLogin && (
                            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                                <p>Только для администраторов системы</p>
                                <Link href="/" className="text-primary-600 hover:underline mt-2 inline-block">
                                    Вернуться на главную
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}