'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, MessageSquare, Calendar, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Client, ClientProfile } from '@/types/client'
import { Booking } from '@/types/booking'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold'
    const map: Record<Booking['status'], { label: string; className: string }> = {
        pending_payment: { label: '🟡 Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: '✅ Подтверждена', className: 'bg-green-100 text-green-800' },
        completed: { label: '✅ Завершена', className: 'bg-emerald-100 text-emerald-800' },
        cancelled: { label: '❌ Отменена', className: 'bg-red-100 text-red-800' },
    }
    const item = map[status]
    return <span className={`${base} ${item.className}`}>{item.label}</span>
}

export default function ClientProfilePage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string

    const [profile, setProfile] = useState<ClientProfile | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [telegram, setTelegram] = useState('')

    const loadProfile = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/clients/${clientId}`)
            if (res.ok) {
                const data = await res.json()
                setProfile(data.profile)
                setBookings(data.bookings || [])
                setName(data.profile.client.name)
                setEmail(data.profile.client.email || '')
                setTelegram(data.profile.client.telegram || '')
            } else {
                setError('Не удалось загрузить профиль')
            }
        } catch (error) {
            console.error('Failed to load profile:', error)
            setError('Ошибка загрузки профиля')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clientId])

    const handleSave = async () => {
        setIsSaving(true)
        setError(null)

        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, telegram }),
            })

            if (res.ok) {
                setIsEditing(false)
                loadProfile()
            } else {
                const error = await res.json()
                setError(error.error || 'Не удалось сохранить изменения')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить этого клиента? Это действие необратимо и удалит все связанные записи.')) return

        try {
            const res = await fetch(`/api/admin/clients/${clientId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                router.push('/admin/clients')
            } else {
                setError('Не удалось удалить клиента')
            }
        } catch (error) {
            setError('Ошибка при удалении')
        }
    }

    if (isLoading) {
        return (
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-3 text-sm text-gray-500">Загрузка профиля...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">Клиент не найден</p>
                            <Button className="mt-4" onClick={() => router.push('/admin/clients')}>
                                Вернуться к списку
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Заголовок */}
                <div className="booking-card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/clients')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold text-primary-900">Профиль клиента</h1>
                                <p className="text-sm text-gray-600">Детальная информация и история записей</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                        Отмена
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Редактировать
                                    </Button>
                                    <Button variant="ghost" onClick={handleDelete}>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Удалить
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <Card className="booking-card">
                        <CardContent className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Левая колонка - информация о клиенте */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Контакты */}
                        <Card className="booking-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary-500" />
                                    Контактная информация
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Имя *</label>
                                            <Input value={name} onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Telegram</label>
                                            <Input
                                                value={telegram}
                                                onChange={(e) => setTelegram(e.target.value)}
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block">Телефон</label>
                                            <Input value={profile.client.phone} disabled />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Имя</div>
                                                <div className="font-semibold text-gray-900">{profile.client.name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <div className="text-sm text-gray-500">Телефон</div>
                                                <div className="font-semibold text-gray-900">{profile.client.phone}</div>
                                            </div>
                                        </div>
                                        {profile.client.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Email</div>
                                                    <div className="font-semibold text-gray-900">{profile.client.email}</div>
                                                </div>
                                            </div>
                                        )}
                                        {profile.client.telegram && (
                                            <div className="flex items-center gap-3">
                                                <MessageSquare className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <div className="text-sm text-gray-500">Telegram</div>
                                                    <div className="font-semibold text-gray-900">{profile.client.telegram}</div>
                                                    {profile.client.telegram_chat_id && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mt-1 inline-block">
                                                            Уведомления включены
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Статистика */}
                        <Card className="booking-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-primary-500" />
                                    Статистика
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Всего записей</span>
                                    <span className="text-lg font-bold text-primary-900">{profile.total_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Предстоящих</span>
                                    <span className="text-lg font-bold text-green-600">{profile.upcoming_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Завершено</span>
                                    <span className="text-lg font-bold text-emerald-600">{profile.completed_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Отменено</span>
                                    <span className="text-lg font-bold text-red-600">{profile.cancelled_bookings}</span>
                                </div>
                                {profile.first_booking && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="text-xs text-gray-500">Первая запись</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {format(parseISO(profile.first_booking), 'd MMM yyyy', { locale: ru })}
                                        </div>
                                    </div>
                                )}
                                {profile.last_booking && (
                                    <div>
                                        <div className="text-xs text-gray-500">Последняя запись</div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {format(parseISO(profile.last_booking), 'd MMM yyyy', { locale: ru })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Правая колонка - история записей */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="booking-card">
                            <CardHeader>
                                <CardTitle>История записей</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bookings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">У клиента нет записей</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="booking-card p-4">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <StatusBadge status={booking.status} />
                                                            <span className="font-semibold text-gray-900">
                                                                {format(parseISO(booking.booking_date), 'd MMMM yyyy', { locale: ru })} в{' '}
                                                                {booking.booking_time}
                                                            </span>
                                                        </div>
                                                        {booking.notes && (
                                                            <p className="text-sm text-gray-600 italic">{booking.notes}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {booking.status === 'pending_payment' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={async () => {
                                                                    const res = await fetch(`/api/bookings/${booking.id}`, {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({
                                                                            status: 'confirmed',
                                                                            paid_at: new Date().toISOString(),
                                                                        }),
                                                                    })
                                                                    if (res.ok) {
                                                                        loadProfile()
                                                                    }
                                                                }}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Оплачено
                                                            </Button>
                                                        )}
                                                        {booking.status !== 'cancelled' && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={async () => {
                                                                    if (!confirm('Отменить запись?')) return
                                                                    const res = await fetch(`/api/bookings/${booking.id}`, {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ status: 'cancelled' }),
                                                                    })
                                                                    if (res.ok) {
                                                                        loadProfile()
                                                                    }
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Отменить
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

