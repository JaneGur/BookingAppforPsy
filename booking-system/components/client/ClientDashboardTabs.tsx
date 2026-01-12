'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Calendar, Home, LineChart, MessageSquare, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
    useGetClientBookingsQuery,
    useGetPendingBookingQuery,
    useGetUpcomingBookingQuery,
} from '@/store/api/bookingsApi'
import { BookingActions } from '@/components/client/BookingActions'
import { ClientNewBookingForm } from '@/components/client/ClientNewBookingForm'

type TabKey = 'home' | 'new' | 'history' | 'profile' | 'telegram'

function formatDateRu(date: string) {
    return format(parseISO(date), 'd MMMM yyyy', { locale: ru })
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold'

    const map: Record<Booking['status'], { label: string; className: string }> = {
        pending_payment: { label: '🟡 Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: '✅ Подтверждена', className: 'bg-green-100 text-green-800' },
        completed: { label: '✅ Завершена', className: 'bg-emerald-100 text-emerald-800' },
        cancelled: { label: '❌ Отменена', className: 'bg-red-100 text-red-800' },
    }

    const item = map[status]

    return <span className={`${base} ${item.className}`}>{item.label}</span>
}

export function ClientDashboardTabs() {
    const router = useRouter()
    const { data: session, status } = useSession()

    const [tab, setTab] = useState<TabKey>('home')

    const phone = session?.user?.phone

    const { data: bookings = [], isLoading: isBookingsLoading } = useGetClientBookingsQuery(phone ?? '', {
        skip: !phone,
    })
    const { data: pendingBooking } = useGetPendingBookingQuery(phone ?? '', { skip: !phone })
    const { data: upcomingBooking } = useGetUpcomingBookingQuery(phone ?? '', { skip: !phone })

    const upcomingConfirmed = useMemo(() => {
        const list = bookings.filter((b) => b.status === 'confirmed')
        list.sort((a, b) => {
            const aDt = Date.parse(`${a.booking_date}T${a.booking_time}:00+03:00`)
            const bDt = Date.parse(`${b.booking_date}T${b.booking_time}:00+03:00`)
            return aDt - bDt
        })
        return list
    }, [bookings])

    if (status === 'loading') {
        return (
            <div className="booking-page-surface min-h-screen p-6">
                <div className="max-w-5xl mx-auto">
                    <div className="booking-card">Загрузка…</div>
                </div>
            </div>
        )
    }

    // Временно отключено для тестирования
    // if (!session?.user) {
    //     router.push('/login')
    //     return null
    // }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">👤 Личный кабинет</h1>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={tab === 'home' ? 'default' : 'secondary'}
                                onClick={() => setTab('home')}
                            >
                                <Home className="h-4 w-4" />
                                🏠 Главная
                            </Button>
                            <Button
                                variant={tab === 'new' ? 'default' : 'secondary'}
                                onClick={() => setTab('new')}
                            >
                                <Calendar className="h-4 w-4" />
                                📅 Новая запись
                            </Button>
                            <Button
                                variant={tab === 'history' ? 'default' : 'secondary'}
                                onClick={() => setTab('history')}
                            >
                                <LineChart className="h-4 w-4" />
                                📊 История
                            </Button>
                            <Button
                                variant={tab === 'profile' ? 'default' : 'secondary'}
                                onClick={() => setTab('profile')}
                            >
                                <User className="h-4 w-4" />
                                👤 Профиль
                            </Button>
                            <Button
                                variant={tab === 'telegram' ? 'default' : 'secondary'}
                                onClick={() => setTab('telegram')}
                            >
                                <MessageSquare className="h-4 w-4" />
                                💬 Уведомления
                            </Button>
                        </div>
                    </div>
                </div>

                {tab === 'home' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {pendingBooking ? (
                                <Card className="booking-card">
                                    <CardHeader>
                                        <CardTitle>🟡 Заказ в ожидании оплаты</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge status={pendingBooking.status} />
                                            <div className="text-sm text-gray-700">
                                                {formatDateRu(pendingBooking.booking_date)} в {pendingBooking.booking_time}
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button asChild>
                                                <Link href={`/payment/${pendingBooking.id}`}>💳 Перейти к оплате</Link>
                                            </Button>
                                            <Button variant="secondary" onClick={() => setTab('history')}>
                                                📊 История
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {upcomingBooking ? (
                                <Card className="booking-card">
                                    <CardHeader>
                                        <CardTitle>🕐 Ближайшая консультация</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge status={upcomingBooking.status} />
                                            <div className="text-sm text-gray-700">
                                                {formatDateRu(upcomingBooking.booking_date)} в {upcomingBooking.booking_time}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            ⏱️ До начала:{' '}
                                            {formatDistanceToNowStrict(
                                                new Date(`${upcomingBooking.booking_date}T${upcomingBooking.booking_time}:00+03:00`),
                                                { locale: ru }
                                            )}
                                        </div>
                                        {upcomingBooking.status === 'confirmed' ? (
                                            <BookingActions booking={upcomingBooking} />
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ) : null}

                            {!pendingBooking && !upcomingBooking ? (
                                <Card className="booking-card">
                                    <CardHeader>
                                        <CardTitle>📭 У вас нет предстоящих консультаций</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-gray-600">
                                            Запишитесь на новую консультацию, используя кнопку ниже.
                                        </p>
                                        <Button onClick={() => setTab('new')}>📅 Записаться</Button>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>

                        <div className="space-y-6">
                            <Card className="info-panel">
                                <CardContent className="space-y-3 p-6">
                                    <div className="text-sm text-gray-600">📊 Метрики</div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="rounded-xl bg-white/70 border border-primary-200/30 p-3">
                                            <div className="text-xs text-gray-500">Предстоящих</div>
                                            <div className="text-lg font-semibold text-primary-900">
                                                {upcomingConfirmed.length}
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-white/70 border border-primary-200/30 p-3">
                                            <div className="text-xs text-gray-500">Всего</div>
                                            <div className="text-lg font-semibold text-primary-900">{bookings.length}</div>
                                        </div>
                                        <div className="rounded-xl bg-white/70 border border-primary-200/30 p-3">
                                            <div className="text-xs text-gray-500">Telegram</div>
                                            <div className="text-lg font-semibold text-primary-900">
                                                {session?.user?.phone ? '✅' : '—'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {tab === 'new' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle>📅 Новая запись</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {pendingBooking ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <p className="text-sm text-yellow-800">
                                        🟡 У вас уже есть созданный заказ, ожидающий оплаты.
                                    </p>
                                    <Button className="mt-3" onClick={() => setTab('home')}>
                                        Вернуться на главную
                                    </Button>
                                </div>
                            ) : upcomingConfirmed.length > 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ У вас уже есть активная запись.
                                    </p>
                                    <Button className="mt-3" onClick={() => setTab('home')}>
                                        Посмотреть на главной
                                    </Button>
                                </div>
                            ) : (
                                <ClientNewBookingForm />
                            )}
                        </CardContent>
                    </Card>
                )}

                {tab === 'history' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle>📊 История записей</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isBookingsLoading ? (
                                <div className="text-sm text-gray-600">Загрузка…</div>
                            ) : bookings.length === 0 ? (
                                <div className="bg-primary-50/50 p-4 rounded-xl">
                                    <p className="text-sm text-gray-700">📭 История записей пуста</p>
                                    <Button className="mt-3" onClick={() => setTab('new')}>
                                        📅 Создать первую запись
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {bookings
                                        .slice()
                                        .sort((a, b) => {
                                            const aDt = Date.parse(`${a.booking_date}T${a.booking_time}:00+03:00`)
                                            const bDt = Date.parse(`${b.booking_date}T${b.booking_time}:00+03:00`)
                                            return bDt - aDt
                                        })
                                        .map((b) => (
                                            <div key={b.id} className="booking-card">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {formatDateRu(b.booking_date)} в {b.booking_time}
                                                        </div>
                                                        <StatusBadge status={b.status} />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {b.status === 'pending_payment' ? (
                                                            <Button asChild size="sm">
                                                                <Link href={`/payment/${b.id}`}>💳 Оплатить</Link>
                                                            </Button>
                                                        ) : null}
                                                        {(b.status === 'confirmed' || b.status === 'pending_payment') ? (
                                                            <BookingActions booking={b} />
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {tab === 'profile' && <ProfileTab />}

                {tab === 'telegram' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle>💬 Уведомления в Telegram</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600">
                                Эту вкладку я подключу следующей: понадобится API /api/telegram/connect и /api/telegram/disconnect,
                                плюс сохранение chat_id в clients/booking.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

function ProfileTab() {
    const { data: session } = useSession()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [telegram, setTelegram] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    async function load() {
        const res = await fetch('/api/profile')
        const data = (await res.json().catch(() => null)) as any
        if (res.ok && data) {
            setName(String(data.name ?? ''))
            setEmail(String(data.email ?? ''))
            setTelegram(String(data.telegram ?? ''))
        }
    }

    useEffect(() => {
        load().catch(() => null)
    }, [])

    if (!session?.user) {
        return null
    }

    const phone = session.user.phone

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle>👤 Профиль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {message ? (
                    <div className="bg-primary-50/50 p-4 rounded-xl text-sm text-gray-700">{message}</div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Имя *</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Телефон</label>
                        <Input value={phone ?? ''} disabled />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Telegram</label>
                        <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={async () => {
                            setIsLoading(true)
                            setMessage(null)
                            const res = await fetch('/api/profile', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name, email, telegram }),
                            })
                            const data = (await res.json().catch(() => null)) as any
                            setIsLoading(false)
                            setMessage(res.ok ? '✅ Профиль обновлен' : String(data?.error ?? 'Ошибка'))
                        }}
                        disabled={isLoading}
                    >
                        💾 Сохранить
                    </Button>
                </div>

                <div className="border-t pt-4 space-y-4">
                    <div className="text-sm font-semibold text-gray-800">🔐 Смена пароля</div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Текущий пароль</label>
                            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        </div>
                        <div />
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Новый пароль</label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Подтверждение</label>
                            <Input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} />
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            if (!currentPassword || !newPassword || !newPasswordConfirm) {
                                setMessage('Заполните поля пароля')
                                return
                            }
                            if (newPassword !== newPasswordConfirm) {
                                setMessage('Новый пароль и подтверждение не совпадают')
                                return
                            }
                            setIsLoading(true)
                            setMessage(null)
                            const res = await fetch('/api/auth/change-password', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
                            })
                            const data = (await res.json().catch(() => null)) as any
                            setIsLoading(false)
                            setMessage(res.ok ? '✅ Пароль изменен' : String(data?.error ?? 'Ошибка'))
                            if (res.ok) {
                                setCurrentPassword('')
                                setNewPassword('')
                                setNewPasswordConfirm('')
                            }
                        }}
                        disabled={isLoading}
                    >
                        🔐 Изменить пароль
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
