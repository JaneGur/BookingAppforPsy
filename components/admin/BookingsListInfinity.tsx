'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, User, Phone, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useInfinityAdminBookings } from '@/lib/hooks/useInfinityAdminBookings'
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
    }
}

export function BookingsListInfinity() {
    const [searchQuery, setSearchQuery] = useState('')

    const {
        data: bookings = [],
        isLoading,
        isInitialLoading,
        isLoadingMore,
        loadMore,
        hasMore,
        reset,
        refetch
    } = useInfinityAdminBookings({
        search: searchQuery || undefined,
        initialLimit: 5
    })

    // Сбрасываем данные при изменении поискового запроса
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            reset()
        }, 300) // Debounce 300ms

        return () => clearTimeout(timeoutId)
    }, [searchQuery, reset])

    const handleSearch = (value: string) => {
        setSearchQuery(value)
    }

    const getStatusInfo = (status: string) => {
        return bookingStatuses[status] || {
            status,
            label: status,
            color: 'bg-gray-100 text-gray-800',
            icon: <Clock className="w-4 h-4" />
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Заказы
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Поиск по имени, телефону, email..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isInitialLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-24 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery ? 'Заказы не найдены' : 'Нет заказов'}
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
                                                        Заказ #{booking.id}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusInfo.color}`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
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

                                                    {booking.client_email && (
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <span className="text-xs">📧</span>
                                                            <span className="truncate">{booking.client_email}</span>
                                                        </div>
                                                    )}

                                                    {booking.products && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs">🎯</span>
                                                            <span>{booking.products.name}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 font-semibold">
                                                        <span className="text-xs">💰</span>
                                                        <span>{booking.amount.toLocaleString('ru-RU')} ₽</span>
                                                    </div>
                                                </div>
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
                            loadingText="Загрузка заказов..."
                            defaultText="Показать ещё заказы"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
