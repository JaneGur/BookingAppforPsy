'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MessageSquare,
    Calendar,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Plus,
    Clock,
    AlertCircle,
    Eye,
    Ban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClientProfile, useDeleteClient, useUpdateClient, useUpdateBookingStatus, useCancelBooking, useDeleteBooking } from '@/lib/hooks'
import { Booking } from '@/types/booking'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'sonner'
import { BookingDetailsModal } from '@/components/admin/BookingDetailsModal'
import { RescheduleBookingModal } from '@/components/admin/RescheduleBookingModal'
import { CreateBookingModal } from '@/components/admin/CreateBookingModal'

function StatusBadge({ status }: { status: Booking['status'] }) {
    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: {
            label: 'Ожидает оплаты',
            className: 'bg-gradient-to-br from-yellow-50 to-yellow-100 text-yellow-700 border-2 border-yellow-200',
            icon: '⏳',
        },
        confirmed: {
            label: 'Подтверждена',
            className: 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-2 border-green-200',
            icon: '✓',
        },
        completed: {
            label: 'Завершена',
            className: 'bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 border-2 border-emerald-200',
            icon: '✓',
        },
        cancelled: {
            label: 'Отменена',
            className: 'bg-gradient-to-br from-red-50 to-red-100 text-red-700 border-2 border-red-200',
            icon: '✕',
        },
    }
    const item = map[status]
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:scale-105 transition-transform ${item.className}`}>
            <span>{item.icon}</span>
            {item.label}
        </span>
    )
}

export default function ClientProfilePage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string

    const { data, isLoading, error, refetch } = useClientProfile(clientId)
    const deleteClient = useDeleteClient()
    const updateClient = useUpdateClient()
    const updateBookingStatus = useUpdateBookingStatus()
    const cancelBooking = useCancelBooking()
    const deleteBooking = useDeleteBooking()

    const [isEditing, setIsEditing] = useState(false)
    const [editError, setEditError] = useState<string | null>(null)
    const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null)
    const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [telegram, setTelegram] = useState('')

    // Initialize edit form when data loads
    if (data && !isEditing && !name) {
        setName(data.profile.client.name)
        setEmail(data.profile.client.email || '')
        setTelegram(data.profile.client.telegram || '')
    }

    // 🎯 OPTIMISTIC UPDATE - редактирование клиента
    const handleSave = async () => {
        setEditError(null)

        try {
            await updateClient.mutateAsync({
                clientId,
                data: { name, email, telegram },
            })
            setIsEditing(false)
            toast.success('Данные клиента обновлены')
        } catch (error: any) {
            const errorMsg = error.message || 'Ошибка при сохранении'
            setEditError(errorMsg)
            toast.error(errorMsg)
        }
    }

    const handleDelete = async () => {
        if (!data) return
        if (
            !confirm(
                `Вы уверены, что хотите удалить клиента "${data.profile.client.name}"? Это действие необратимо и удалит все связанные записи.`
            )
        )
            return

        try {
            await deleteClient.mutateAsync(clientId)
            router.push('/admin/clients')
        } catch (error) {
            alert('Не удалось удалить клиента')
        }
    }

    // 🎯 OPTIMISTIC UPDATE - изменение статуса записи
    const handleUpdateBookingStatus = async (bookingId: number, status: string, paid_at?: string) => {
        try {
            await updateBookingStatus.mutateAsync({
                id: bookingId,
                status: status as Booking['status'],
                paid_at,
            })
            toast.success('Статус записи обновлен')
            refetch()
        } catch (error) {
            console.error('Failed to update booking:', error)
            toast.error('Не удалось обновить статус')
        }
    }

    const handleMarkPaid = async (bookingId: number) => {
        try {
            await updateBookingStatus.mutateAsync({
                id: bookingId,
                status: 'confirmed',
                paid_at: new Date().toISOString()
            })
            toast.success('Запись подтверждена и оплачена')
            refetch()
        } catch (error) {
            console.error('Failed to mark as paid:', error)
            toast.error('Не удалось подтвердить оплату')
        }
    }

    const handleCancelBooking = async (bookingId: number) => {
        if (!confirm('Отменить эту запись? Запись будет помечена как отмененная, но останется в истории.')) return
        try {
            await cancelBooking.mutateAsync(bookingId)
            toast.success('Запись отменена')
            refetch()
        } catch (error) {
            console.error('Failed to cancel:', error)
            toast.error('Не удалось отменить запись')
        }
    }

    const handleDeleteBooking = async (bookingId: number) => {
        if (!confirm('Полностью удалить эту запись из базы данных? Это действие необратимо. Запись будет удалена безвозвратно.')) return
        try {
            await deleteBooking.mutateAsync(bookingId)
            toast.success('Запись полностью удалена')
            refetch()
        } catch (error) {
            console.error('Failed to delete:', error)
            toast.error('Не удалось удалить запись')
        }
    }

    const handleRescheduleOpen = (booking: Booking) => {
        setRescheduleBooking(booking)
    }

    const handleStatusChange = async (bookingId: number, status: Booking['status']) => {
        try {
            await updateBookingStatus.mutateAsync({ id: bookingId, status })
            toast.success('Статус записи изменен')
            refetch()
        } catch (error) {
            console.error('Failed to change status:', error)
            toast.error('Не удалось изменить статус')
        }
    }

    if (isLoading) {
        return (
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="booking-card border-2">
                        <CardContent className="p-16 text-center">
                            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-4 text-base font-medium text-gray-600">Загрузка профиля...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="booking-card border-2 border-red-200 bg-red-50/50">
                        <CardContent className="p-12 text-center">
                            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-gray-900 mb-2">Клиент не найден</p>
                            <p className="text-sm text-gray-600 mb-6">Возможно, клиент был удален</p>
                            <Button onClick={() => router.push('/admin/clients')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Вернуться к списку
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const { profile, bookings } = data

    return (
        <div className="booking-page-surface min-h-screen p-3 sm:p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                {/* Заголовок */}
                <Card className="booking-card border-2">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/admin/clients')}
                                    className="hover:bg-primary-50 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                                >
                                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                                        {profile.client.name}
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Профиль клиента</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="secondary" onClick={() => {
                                            setIsEditing(false)
                                            setName(profile.client.name)
                                            setEmail(profile.client.email || '')
                                            setTelegram(profile.client.telegram || '')
                                        }} size="lg" className="w-full sm:w-auto">
                                            Отмена
                                        </Button>
                                        <Button onClick={handleSave} disabled={updateClient.isPending} size="lg" className="shadow-lg w-full sm:w-auto">
                                            {updateClient.isPending ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="secondary" onClick={() => setIsEditing(true)} size="lg" className="w-full sm:w-auto">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Редактировать
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={handleDelete}
                                            disabled={deleteClient.isPending}
                                            size="lg"
                                            className="hover:bg-red-50 hover:text-red-600 w-full sm:w-auto"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Удалить
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {editError && (
                    <Card className="booking-card border-2 border-red-200 bg-red-50/50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                <p className="text-sm font-medium">{editError}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Левая колонка - информация о клиенте */}
                    <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                        {/* Контакты */}
                        <Card className="booking-card border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary-200/50">
                                        <User className="w-5 h-5 text-primary-600" />
                                    </div>
                                    Контактная информация
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Имя *
                                            </label>
                                            <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-12" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <Mail className="h-4 w-4" />
                                                Email
                                            </label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                Telegram
                                            </label>
                                            <Input
                                                value={telegram}
                                                onChange={(e) => setTelegram(e.target.value)}
                                                placeholder="@username"
                                                className="h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                                <Phone className="h-4 w-4" />
                                                Телефон
                                            </label>
                                            <Input value={profile.client.phone} disabled className="h-12 font-mono" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500 mb-1">Имя</div>
                                                    <div className="font-semibold text-gray-900 truncate">{profile.client.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                    <Phone className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500 mb-1">Телефон</div>
                                                    <div className="font-mono font-semibold text-gray-900">{profile.client.phone}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {profile.client.email && (
                                            <div className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                        <Mail className="h-5 w-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-500 mb-1">Email</div>
                                                        <div className="font-semibold text-gray-900 truncate">{profile.client.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {profile.client.telegram && (
                                            <div className="p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-500 mb-1">Telegram</div>
                                                        <div className="font-semibold text-gray-900">{profile.client.telegram}</div>
                                                        {profile.client.telegram_chat_id && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block font-medium">
                                                                ✓ Уведомления активны
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Статистика */}
                        <Card className="booking-card border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-2 border-green-200/50">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                    </div>
                                    Статистика
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-primary-50/50">
                                    <span className="text-sm font-medium text-gray-700">Всего записей</span>
                                    <span className="text-2xl font-bold text-primary-600">{profile.total_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-green-50/50">
                                    <span className="text-sm font-medium text-gray-700">Предстоящих</span>
                                    <span className="text-2xl font-bold text-green-600">{profile.upcoming_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/50">
                                    <span className="text-sm font-medium text-gray-700">Завершено</span>
                                    <span className="text-2xl font-bold text-emerald-600">{profile.completed_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-red-50/50">
                                    <span className="text-sm font-medium text-gray-700">Отменено</span>
                                    <span className="text-2xl font-bold text-red-600">{profile.cancelled_bookings}</span>
                                </div>
                                {profile.first_booking && (
                                    <div className="pt-3 border-t-2 border-gray-100">
                                        <div className="text-xs text-gray-500 mb-1">Первая запись</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {format(parseISO(profile.first_booking), 'd MMMM yyyy', { locale: ru })}
                                        </div>
                                    </div>
                                )}
                                {profile.last_booking && (
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Последняя запись</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {format(parseISO(profile.last_booking), 'd MMMM yyyy', { locale: ru })}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Правая колонка - история записей */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        <Card className="booking-card border-2">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center border-2 border-amber-200/50">
                                            <Calendar className="w-5 h-5 text-amber-600" />
                                        </div>
                                        История записей
                                    </CardTitle>
                                    <Button size="lg" className="shadow-lg" onClick={() => setShowCreateModal(true)}>
                                        <Plus className="h-5 w-5 mr-2" />
                                        Создать запись
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {bookings.length === 0 ? (
                                    <div className="text-center py-16">
                                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <Calendar className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <p className="text-lg font-semibold text-gray-900 mb-2">У клиента нет записей</p>
                                        <p className="text-sm text-gray-500 mb-6">Создайте первую запись для этого клиента</p>
                                        <Button size="lg" className="shadow-lg" onClick={() => setShowCreateModal(true)}>
                                            <Plus className="h-5 w-5 mr-2" />
                                            Создать запись
                                        </Button>

                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="booking-card border-2 p-4 sm:p-5 hover:shadow-xl transition-all">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0 space-y-3">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <StatusBadge status={booking.status} />
                                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                                                                    <Clock className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                                                                    <span className="text-sm font-bold text-blue-900 whitespace-nowrap">
                                                                        {booking.booking_time}
                                                                    </span>
                                                                </div>
                                                                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                                                                    <span className="text-sm font-bold text-purple-900 whitespace-nowrap">
                                                                        {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                                                                    </span>
                                                                </div>
                                                                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200">
                                                                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                                                        {format(parseISO(booking.booking_date), 'd MMMM yyyy', { locale: ru })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <p className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                                                    {booking?.product_description || 'Услуга не указана'}
                                                                </p>
                                                                {booking.notes && (
                                                                    <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                                        <p className="text-sm text-gray-700 italic break-words">💬 {booking.notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDetailsBooking(booking)}
                                                            className="w-full sm:w-auto justify-center sm:justify-start"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Детали
                                                        </Button>
                                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleRescheduleOpen(booking)}
                                                                className="w-full sm:w-auto justify-center sm:justify-start"
                                                                title="Перенести дату/время записи"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Перенести
                                                            </Button>
                                                        )}
                                                        {booking.status === 'pending_payment' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleMarkPaid(booking.id)}
                                                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center sm:justify-start"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Оплачено
                                                            </Button>
                                                        )}
                                                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                            <Button
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleCancelBooking(booking.id)}
                                                                className="w-full sm:w-auto justify-center sm:justify-start"
                                                                title="Отменить запись (остается в истории)"
                                                            >
                                                                <Ban className="h-4 w-4 mr-2" />
                                                                Отменить
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteBooking(booking.id)}
                                                            className="hover:bg-red-50 hover:text-red-600 w-full sm:w-auto justify-center sm:justify-start"
                                                            title="Полностью удалить запись из базы"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Удалить
                                                        </Button>
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

            {/* Модальное окно деталей записи */}
            <BookingDetailsModal
                booking={detailsBooking}
                onClose={() => setDetailsBooking(null)}
                onDelete={handleDeleteBooking}
                onCancel={handleCancelBooking}
                onReschedule={(b) => {
                    setDetailsBooking(null)
                    handleRescheduleOpen(b)
                }}
                onStatusChange={handleStatusChange}
            />

            <RescheduleBookingModal
                booking={rescheduleBooking}
                open={!!rescheduleBooking}
                onClose={() => setRescheduleBooking(null)}
            />

            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        refetch()
                    }}
                    clientPreset={{
                        name: profile.client.name,
                        phone: profile.client.phone,
                        email: profile.client.email || undefined,
                        telegram: profile.client.telegram || undefined,
                    }}
                    hideClientStep
                />
            )}
        </div>
    )
}