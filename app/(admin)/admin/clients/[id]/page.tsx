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
    MoreVertical,
    X,
    ChevronDown,
    ChevronUp
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
import { AdminClientBookingsCalendar } from '@/components/admin/AdminClientBookingsCalendar'

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
    const [showMobileMenu, setShowMobileMenu] = useState(false)
    const [showStats, setShowStats] = useState(false)

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

    if (isLoading) {
        return (
            <div className="min-h-screen p-3 sm:p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <Card className="border-2 border-gray-200 bg-white shadow-sm">
                        <CardContent className="p-12 text-center">
                            <div className="inline-block h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-4 text-sm sm:text-base font-medium text-gray-600">Загрузка профиля...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen p-3 sm:p-4 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <Card className="border-2 border-red-200 bg-red-50/50">
                        <CardContent className="p-6 sm:p-12 text-center">
                            <AlertCircle className="h-10 w-10 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Клиент не найден</p>
                            <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Возможно, клиент был удален</p>
                            <Button onClick={() => router.push('/admin/clients')} size="lg" className="w-full sm:w-auto">
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
        <div className="min-h-screen p-2 sm:p-3 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
            {/* Мобильное меню */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileMenu(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl animate-slideInRight"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">Действия</span>
                                <button
                                    onClick={() => setShowMobileMenu(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <Button
                                size="sm"
                                onClick={() => setIsEditing(true)}
                                className="w-full justify-start"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Редактировать
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCreateModal(true)}
                                className="w-full justify-start"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Новая запись
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Удалить клиента
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Заголовок - мобильная версия */}
                <Card className="border-2 border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => router.push('/admin/clients')}
                                        className="hover:bg-primary-50 h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 flex-shrink-0"
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                                    </Button>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md lg:shadow-lg flex-shrink-0">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                            {profile.client.name}
                                        </h1>
                                        <p className="text-xs text-gray-600 mt-0.5">Профиль клиента</p>
                                    </div>
                                </div>

                                {/* Мобильное меню кнопка */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMobileMenu(true)}
                                    className="md:hidden h-8 w-8 flex-shrink-0"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Основные действия - десктоп */}
                            <div className="hidden md:flex flex-col lg:flex-row gap-2">
                                {isEditing ? (
                                    <>
                                        <Button variant="secondary" onClick={() => {
                                            setIsEditing(false)
                                            setName(profile.client.name)
                                            setEmail(profile.client.email || '')
                                            setTelegram(profile.client.telegram || '')
                                        }} size="lg" className="w-full lg:w-auto">
                                            Отмена
                                        </Button>
                                        <Button onClick={handleSave} disabled={updateClient.isPending} size="lg" className="shadow-lg w-full lg:w-auto">
                                            {updateClient.isPending ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="secondary" onClick={() => setIsEditing(true)} size="lg" className="w-full lg:w-auto">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Редактировать
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={handleDelete}
                                            disabled={deleteClient.isPending}
                                            size="lg"
                                            className="hover:bg-red-50 hover:text-red-600 w-full lg:w-auto"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Удалить
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Основные действия - мобильная версия */}
                            <div className="md:hidden space-y-2">
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="secondary" onClick={() => {
                                            setIsEditing(false)
                                            setName(profile.client.name)
                                            setEmail(profile.client.email || '')
                                            setTelegram(profile.client.telegram || '')
                                        }} size="lg" className="w-full">
                                            Отмена
                                        </Button>
                                        <Button onClick={handleSave} disabled={updateClient.isPending} size="lg" className="shadow-lg w-full">
                                            {updateClient.isPending ? '...' : 'Сохранить'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button onClick={() => setShowCreateModal(true)} size="lg" className="w-full">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Запись
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsEditing(true)}
                                            size="lg"
                                            className="w-full"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Редакт.
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {editError && (
                    <Card className="border-2 border-red-200 bg-red-50/50">
                        <CardContent className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3 text-red-700">
                                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                <p className="text-xs sm:text-sm font-medium">{editError}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {/* Левая колонка - информация о клиенте */}
                    <div className="lg:col-span-1 space-y-3 sm:space-y-4 lg:space-y-6">
                        {/* Контакты */}
                        <Card className="border-2 border-gray-200 bg-white shadow-sm">
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary-200/50 flex-shrink-0">
                                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                    </div>
                                    <span>Контакты</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                                {isEditing ? (
                                    <>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block flex items-center gap-2">
                                                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                Имя *
                                            </label>
                                            <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-10 sm:h-12" />
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                Email
                                            </label>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="h-10 sm:h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block flex items-center gap-2">
                                                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                Telegram
                                            </label>
                                            <Input
                                                value={telegram}
                                                onChange={(e) => setTelegram(e.target.value)}
                                                placeholder="@username"
                                                className="h-10 sm:h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                Телефон
                                            </label>
                                            <Input value={profile.client.phone} disabled className="h-10 sm:h-12 font-mono text-sm sm:text-base" />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Имя</div>
                                                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{profile.client.name}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <Phone className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Телефон</div>
                                                    <div className="text-sm sm:text-base font-mono font-semibold text-gray-900 truncate">{profile.client.phone}</div>
                                                </div>
                                            </div>
                                        </div>
                                        {profile.client.email && (
                                            <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                        <Mail className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-purple-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Email</div>
                                                        <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{profile.client.email}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {profile.client.telegram && (
                                            <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <MessageSquare className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">Telegram</div>
                                                        <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">{profile.client.telegram}</div>
                                                        {profile.client.telegram_chat_id && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full mt-1 inline-block font-medium">
                                                                ✓ Уведомления
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

                        {/* Статистика - мобильная версия с аккордеоном */}
                        <Card className="border-2 border-gray-200 bg-white shadow-sm">
                            <button
                                onClick={() => setShowStats(!showStats)}
                                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors md:hidden"
                            >
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3 m-0">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-2 border-green-200/50 flex-shrink-0">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                    </div>
                                    <span>Статистика</span>
                                </CardTitle>
                                {showStats ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                            </button>

                            {/* Десктоп заголовок */}
                            <CardHeader className="hidden md:block p-4 sm:p-6">
                                <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-2 border-green-200/50 flex-shrink-0">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                    </div>
                                    <span>Статистика</span>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className={`space-y-2 sm:space-y-3 p-4 sm:p-6 ${!showStats && 'hidden md:block'} md:pt-0`}>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <div className="flex flex-col p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary-50/50">
                                        <span className="text-xs font-medium text-gray-700 mb-1">Всего</span>
                                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">{profile.total_bookings}</span>
                                    </div>
                                    <div className="flex flex-col p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-green-50/50">
                                        <span className="text-xs font-medium text-gray-700 mb-1">Предстоящих</span>
                                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{profile.upcoming_bookings}</span>
                                    </div>
                                    <div className="flex flex-col p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50/50">
                                        <span className="text-xs font-medium text-gray-700 mb-1">Завершено</span>
                                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">{profile.completed_bookings}</span>
                                    </div>
                                    <div className="flex flex-col p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-red-50/50">
                                        <span className="text-xs font-medium text-gray-700 mb-1">Отменено</span>
                                        <span className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{profile.cancelled_bookings}</span>
                                    </div>
                                </div>

                                <div className="pt-2 sm:pt-3 border-t-2 border-gray-100 space-y-1.5 sm:space-y-2">
                                    {profile.first_booking && (
                                        <div>
                                            <div className="text-xs text-gray-500">Первая запись</div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {format(parseISO(profile.first_booking), 'd MMM yyyy', { locale: ru })}
                                            </div>
                                        </div>
                                    )}
                                    {profile.last_booking && (
                                        <div>
                                            <div className="text-xs text-gray-500">Последняя запись</div>
                                            <div className="text-sm font-semibold text-gray-900">
                                                {format(parseISO(profile.last_booking), 'd MMM yyyy', { locale: ru })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Правая колонка - история записей */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
                        <Card className="border-2 border-gray-200 bg-white shadow-sm">
                            <CardHeader className="p-3 sm:p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 sm:gap-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 flex items-center justify-center border-2 border-amber-200/50 flex-shrink-0">
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                                        </div>
                                        <span>История записей</span>
                                    </CardTitle>
                                    <Button size="lg" className="shadow-lg w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Создать запись</span>
                                        <span className="sm:hidden">Новая запись</span>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 sm:p-4 lg:p-6 pt-0 sm:pt-0 lg:pt-0">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12 lg:py-16">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                        </div>
                                        <p className="text-sm sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Нет записей</p>
                                        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Создайте первую запись</p>
                                        <Button size="lg" className="shadow-lg w-full sm:w-auto" onClick={() => setShowCreateModal(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Создать запись
                                        </Button>
                                    </div>
                                ) : (
                                    <AdminClientBookingsCalendar
                                        bookings={bookings}
                                        onReschedule={handleRescheduleOpen}
                                        onViewDetails={setDetailsBooking}
                                        onMarkPaid={handleMarkPaid}
                                        onCancel={handleCancelBooking}
                                        onDelete={handleDeleteBooking}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Модальные окна */}
            {detailsBooking && (
                <BookingDetailsModal
                    booking={detailsBooking}
                    open={!!detailsBooking}
                    onClose={() => setDetailsBooking(null)}
                />
            )}

            {rescheduleBooking && (
                <RescheduleBookingModal
                    booking={rescheduleBooking}
                    open={!!rescheduleBooking}
                    onClose={() => setRescheduleBooking(null)}
                    onSuccess={() => {
                        setRescheduleBooking(null)
                        refetch()
                    }}
                />
            )}

            {showCreateModal && (
                <CreateBookingModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    clientId={clientId}
                    clientPhone={profile.client.phone}
                    onSuccess={() => {
                        setShowCreateModal(false)
                        refetch()
                    }}
                />
            )}
        </div>
    )
}