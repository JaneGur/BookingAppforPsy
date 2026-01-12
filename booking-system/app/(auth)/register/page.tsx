'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

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
        <div className="booking-page-surface min-h-screen px-4 py-10">
            <div className="max-w-md mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>📝 Регистрация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errorText && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                <p className="text-sm text-red-800">{errorText}</p>
                            </div>
                        )}

                        <form className="space-y-4" onSubmit={onSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Имя *</label>
                                <Input name="name" type="text" placeholder="Ваше имя" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Email</label>
                                <Input name="email" type="email" placeholder="email@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Телефон *</label>
                                <Input name="phone" type="tel" placeholder="+7 (999) 999-99-99" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Пароль *</label>
                                <Input name="password" type="password" placeholder="Минимум 6 символов" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">Подтверждение пароля *</label>
                                <Input name="passwordConfirm" type="password" placeholder="Повторите пароль" required />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
                            </Button>
                        </form>

                        <div className="text-sm text-gray-600">
                            Уже есть аккаунт?{' '}
                            <Link href="/login" className="text-primary-600 font-semibold hover:underline">
                                Войти
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}