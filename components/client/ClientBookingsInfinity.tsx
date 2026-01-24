'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar, User, Phone, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useInfinityBookings } from '@/lib/hooks/useInfinityBookings'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

interface BookingStatus {
    status: string
    label: string
    color: string
    icon: React.ReactNode
}

const bookingStatuses: Record<string, BookingStatus> = {
    pending_payment: {
        status: 'pending_payment',
        label: 'Ожидает оплаты',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <Clock className="w-4 h-4" />
    },
    confirmed: {
        status: 'confirmed',
        label: 'Подтверждена',
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle className="w-4 h-4" />
    },
    cancelled: {
        status: 'cancelled',
        label: 'Отменена',
        color: 'bg-red-100 text-red-800',
        icon: <XCircle className="w-4 h-4" />
    },
    completed: {
        status: 'completed',
        label: 'Завершена',
        color: 'bg-blue-100 text-blue-800',
        icon: <CheckCircle className="w-4 h-4" />
    }
}

export function ClientBookingsInfinity() {
    const { data: session } = useSession()
    const [selectedStatus, setSelectedStatus] = useState<string>('')

    const {
        data: bookings = [],
        isLoading,
        isInitialLoading,
        isLoadingMore,
        loadMore,
        hasMore,
        reset,
        refetch
    } = useInfinityBookings({
        clientId: session?.user?.id,
        status: selectedStatus || undefined,
        initialLimit: 5
    })

    // Сбрасываем данные при изменении фильтров
    useEffect(() => {
        reset()
    }, [selectedStatus, reset])

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status === selectedStatus ? '' : status)
    }

    const getStatusInfo = (status: string) => {
        return bookingStatuses[status] || {
            status,
            label: status,
            color: 'bg-gray-100 text-gray-800',
            icon: <Clock className="w-4 h-4" />
        }
    }

    const handlePayment = (bookingId: number) => {
        // Здесь логика перехода на страницу оплаты
        window.open(`/payment/${bookingId}`, '_blank')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Мои записи
                </CardTitle>

                {/* Фильтры по статусу */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedStatus === '' ? 'default' : 'secondary'}
                        size="sm"
                        onClick={() => handleStatusFilter('')}
                    >
                        Все
                    </Button>
                    {Object.entries(bookingStatuses).map(([key, status]) => (
                        <Button
                            key={key}
                            variant={selectedStatus === key ? 'default' : 'secondary'}
                            size="sm"
                            onClick={() => handleStatusFilter(key)}
                            className="flex items-center gap-1"
                        >
                            {status.icon}
                            {status.label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                {isInitialLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-32 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {selectedStatus ? 'Записи с таким статусом не найдены' : 'У вас пока нет записей'}
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {bookings.map((booking) => {
                                const statusInfo = getStatusInfo(booking.status)

                                return (
                                    <div
                                        key={booking.id}
                                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">
                                                        Запись #{booking.id}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {format(parseISO(booking.booking_date), 'dd MMM yyyy', { locale: ru })} в {booking.booking_time}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span>{booking.client_name}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                        <span>{booking.client_phone}</span>
                                                    </div>

                                                    {booking.products && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs">🎯</span>
                                                            <span>{booking.products.name}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 font-semibold text-lg">
                                                        <span className="text-xs">💰</span>
                                                        <span>{booking.amount.toLocaleString('ru-RU')} ₽</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Кнопки действий */}
                                            <div className="flex flex-col gap-2">
                                                {booking.status === 'pending_payment' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handlePayment(booking.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CreditCard className="w-4 h-4" />
                                                        Оплатить
                                                    </Button>
                                                )}

                                                {booking.status === 'confirmed' && (
                                                    <Button size="sm" variant="secondary" disabled>
                                                        Подтверждена
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <LoadMoreButton
                            onClick={loadMore}
                            isLoading={isLoadingMore}
                            hasMore={hasMore}
                            loadingText="Загрузка записей..."
                            defaultText="Показать ещё записи"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
