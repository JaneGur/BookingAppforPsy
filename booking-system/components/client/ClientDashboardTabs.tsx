'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Calendar, Home, LineChart, MessageSquare, User, Mail, Phone, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useClientBookings, usePendingBooking, useUpcomingBooking } from '@/lib/hooks/useBookings'
import { BookingActions } from '@/components/client/BookingActions'
import { ClientNewBookingForm } from '@/components/client/ClientNewBookingForm'

type TabKey = 'home' | 'new' | 'history' | 'profile' | 'telegram'

function formatDateRu(date: string) {
    return format(parseISO(date), 'd MMMM yyyy', { locale: ru })
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105'

    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: { label: 'Ожидает оплаты', className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300', icon: '⏳' },
        confirmed: { label: 'Подтверждена', className: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300', icon: '✓' },
        completed: { label: 'Завершена', className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300', icon: '✓' },
        cancelled: { label: 'Отменена', className: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300', icon: '✕' },
    }

    const item = map[status]

    return <span className={`${base} ${item.className}`}><span className="text-base">{item.icon}</span> {item.label}</span>
}

export function ClientDashboardTabs() {
    const router = useRouter()
    const { data: session, status } = useSession()

    const [tab, setTab] = useState<TabKey>('home')

    const phone = session?.user?.phone

    const { data: bookings = [], isLoading: isBookingsLoading } = useClientBookings(phone)
    const { data: pendingBooking } = usePendingBooking(phone)
    const { data: upcomingBooking } = useUpcomingBooking(phone)

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="booking-card max-w-md">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        <span className="text-lg font-semibold text-gray-700">Загрузка…</span>
                    </div>
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
        <div className="space-y-8 animate-[fadeInUp_0.6s_ease-out]">
            {/* Заголовок и табы */}
            <div className="booking-card">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-xl">
                            <User className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Личный кабинет
                            </h1>
                            <p className="text-gray-600 mt-1">Управление записями и профилем</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <Button
                            variant={tab === 'home' ? 'default' : 'secondary'}
                            onClick={() => setTab('home')}
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <Home className="h-5 w-5" />
                            <span className="text-sm font-semibold">Главная</span>
                        </Button>
                        <Button
                            variant={tab === 'new' ? 'default' : 'secondary'}
                            onClick={() => setTab('new')}
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <Calendar className="h-5 w-5" />
                            <span className="text-sm font-semibold">Записаться</span>
                        </Button>
                        <Button
                            variant={tab === 'history' ? 'default' : 'secondary'}
                            onClick={() => setTab('history')}
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <LineChart className="h-5 w-5" />
                            <span className="text-sm font-semibold">История</span>
                        </Button>
                        <Button
                            variant={tab === 'profile' ? 'default' : 'secondary'}
                            onClick={() => setTab('profile')}
                            className="h-auto py-4 flex-col gap-2"
                        >
                            <User className="h-5 w-5" />
                            <span className="text-sm font-semibold">Профиль</span>
                        </Button>
                        <Button
                            variant={tab === 'telegram' ? 'default' : 'secondary'}
                            onClick={() => setTab('telegram')}
                            className="h-auto py-4 flex-col gap-2 col-span-2 sm:col-span-1"
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-sm font-semibold">Telegram</span>
                        </Button>
                    </div>
                </div>
            </div>

            {tab === 'home' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {pendingBooking ? (
                                <Card className="booking-card border-2 border-yellow-300/50 bg-gradient-to-br from-yellow-50/50 to-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                                                <span className="text-2xl">⏳</span>
                                            </div>
                                            <CardTitle className="text-2xl">Ожидает оплаты</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge status={pendingBooking.status} />
                                            <div className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-primary-600" />
                                                {formatDateRu(pendingBooking.booking_date)} в {pendingBooking.booking_time}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button asChild size="lg" className="flex-1">
                                                <Link href={`/payment/${pendingBooking.id}`}>
                                                    💳 Перейти к оплате
                                                </Link>
                                            </Button>
                                            <Button variant="secondary" onClick={() => setTab('history')} size="lg">
                                                История
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : null}

                            {upcomingBooking ? (
                                <Card className="booking-card border-2 border-green-300/50 bg-gradient-to-br from-green-50/50 to-white relative overflow-hidden">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400" />
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                                                <Calendar className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className="text-2xl">Ближайшая консультация</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge status={upcomingBooking.status} />
                                            <div className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                                <Calendar className="h-5 w-5 text-primary-600" />
                                                {formatDateRu(upcomingBooking.booking_date)} в {upcomingBooking.booking_time}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200">
                                            <div className="text-2xl">⏱️</div>
                                            <div>
                                                <div className="text-xs font-semibold text-blue-700 uppercase">До начала</div>
                                                <div className="text-sm font-bold text-blue-900">
                                                    {formatDistanceToNowStrict(
                                                        new Date(`${upcomingBooking.booking_date}T${upcomingBooking.booking_time}:00+03:00`),
                                                        { locale: ru }
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {upcomingBooking.status === 'confirmed' ? (
                                            <BookingActions booking={upcomingBooking} />
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ) : null}

                            {!pendingBooking && !upcomingBooking ? (
                                <Card className="booking-card border-2 border-gray-200 text-center">
                                    <CardContent className="py-12">
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                            <span className="text-4xl">📭</span>
                                        </div>
                                        <CardTitle className="text-2xl mb-4">Нет предстоящих консультаций</CardTitle>
                                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                            Запишитесь на новую консультацию и начните свой путь к внутренней гармонии
                                        </p>
                                        <Button onClick={() => setTab('new')} size="lg" className="shadow-xl">
                                            <Calendar className="h-5 w-5 mr-2" />
                                            Записаться на консультацию
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>

                        <div className="space-y-6">
                            <Card className="info-panel border-2">
                                <CardContent className="space-y-6 p-6">
                                    <div className="flex items-center gap-2">
                                        <LineChart className="h-5 w-5 text-primary-600" />
                                        <div className="text-lg font-bold text-gray-800">Статистика</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200/50 p-5 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-semibold text-primary-700">Предстоящих</div>
                                                <Calendar className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div className="text-3xl font-bold text-primary-900">
                                                {upcomingConfirmed.length}
                                            </div>
                                        </div>
                                        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200/50 p-5 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-semibold text-blue-700">Всего записей</div>
                                                <LineChart className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="text-3xl font-bold text-blue-900">{bookings.length}</div>
                                        </div>
                                        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-white border-2 border-green-200/50 p-5 hover:shadow-lg transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-sm font-semibold text-green-700">Telegram</div>
                                                <MessageSquare className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-green-900">
                                                {session?.user?.phone ? '✅ Подключен' : '—'}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

            {tab === 'new' && (
                    <Card className="booking-card border-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                    <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Новая запись</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">Выберите удобное время для консультации</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {pendingBooking ? (
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-2 border-yellow-300 p-6 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">⏳</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-yellow-900 mb-2">
                                                У вас уже есть созданный заказ
                                            </h3>
                                            <p className="text-sm text-yellow-800 mb-4">
                                                Пожалуйста, завершите оплату существующей записи перед созданием новой
                                            </p>
                                            <Button onClick={() => setTab('home')} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                                                Вернуться на главную
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : upcomingConfirmed.length > 0 ? (
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 p-6 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center flex-shrink-0">
                                            <span className="text-2xl">⚠️</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-amber-900 mb-2">
                                                У вас уже есть активная запись
                                            </h3>
                                            <p className="text-sm text-amber-800 mb-4">
                                                Вы можете создать новую запись после завершения текущей консультации
                                            </p>
                                            <Button onClick={() => setTab('home')} size="lg" variant="secondary">
                                                Посмотреть на главной
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <ClientNewBookingForm />
                            )}
                        </CardContent>
                    </Card>
                )}

            {tab === 'history' && (
                    <Card className="booking-card border-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                                    <LineChart className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">История записей</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">Все ваши консультации</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isBookingsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                        <span className="text-lg font-semibold text-gray-700">Загрузка…</span>
                                    </div>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                        <span className="text-4xl">📭</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-3">История записей пуста</h3>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        Создайте первую запись, чтобы начать отслеживать свои консультации
                                    </p>
                                    <Button onClick={() => setTab('new')} size="lg" className="shadow-xl">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Создать первую запись
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings
                                        .slice()
                                        .sort((a, b) => {
                                            const aDt = Date.parse(`${a.booking_date}T${a.booking_time}:00+03:00`)
                                            const bDt = Date.parse(`${b.booking_date}T${b.booking_time}:00+03:00`)
                                            return bDt - aDt
                                        })
                                        .map((b) => (
                                            <div key={b.id} className="booking-card border-2 hover:shadow-xl transition-all">
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 text-lg font-bold text-gray-900">
                                                            <Calendar className="h-5 w-5 text-primary-600" />
                                                            {formatDateRu(b.booking_date)} в {b.booking_time}
                                                        </div>
                                                        <StatusBadge status={b.status} />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {b.status === 'pending_payment' ? (
                                                            <Button asChild size="lg">
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
                    <Card className="booking-card border-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                                    <MessageSquare className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Уведомления в Telegram</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">Получайте напоминания о записях</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 p-6 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-400 flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">🔔</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                                            Функция в разработке
                                        </h3>
                                        <p className="text-sm text-blue-800">
                                            Скоро вы сможете получать уведомления о записях и напоминания о консультациях прямо в Telegram
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
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
        <Card className="booking-card border-2">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Профиль</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Управление личными данными</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {message ? (
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border-2 border-primary-200 p-4 rounded-2xl text-sm font-semibold text-gray-800 flex items-center gap-3">
                        <span className="text-xl">{message.includes('✅') ? '✅' : 'ℹ️'}</span>
                        {message}
                    </div>
                ) : null}

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary-600" />
                            Основная информация
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary-600" />
                                    Имя <span className="text-red-500">*</span>
                                </label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-12" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary-600" />
                                    Email
                                </label>
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-12" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary-600" />
                                    Телефон
                                </label>
                                <Input value={phone ?? ''} disabled className="h-12 bg-gray-50" />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-primary-600" />
                                    Telegram
                                </label>
                                <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" className="h-12" />
                            </div>
                        </div>
                    </div>

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
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Сохранение…
                            </>
                        ) : (
                            <>💾 Сохранить изменения</>
                        )}
                    </Button>
                </div>

                <div className="border-t-2 border-gray-200 pt-6 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary-600" />
                        Смена пароля
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary-600" />
                                Текущий пароль
                            </label>
                            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary-600" />
                                Новый пароль
                            </label>
                            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                                <Lock className="h-4 w-4 text-primary-600" />
                                Подтверждение
                            </label>
                            <Input type="password" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} className="h-12" />
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
                        size="lg"
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-primary-600/30 border-t-primary-600 rounded-full animate-spin" />
                                Изменение…
                            </>
                        ) : (
                            <>🔐 Изменить пароль</>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
