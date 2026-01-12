'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, parseISO, startOfDay, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
    Calendar,
    Search,
    Filter,
    Plus,
    CheckCircle,
    XCircle,
    Trash2,
    Edit,
    MoreVertical,
    Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'

interface BookingsTabProps {
    onCreateBooking: () => void
    refreshTrigger?: number
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold'
    const map: Record<Booking['status'], { label: string; className: string }> = {
        pending_payment: { label: '🟡 Ожидает оплаты', className: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: '✅ Подтверждена', className: 'bg-green-100 text-green-800' },
        completed: { label: '✅ Завершена', className: 'bg-emerald-100 text-emerald-800' },
        cancelled: { label: '❌ Отменена', className: 'bg-red-100 text-red-800' },
    }
    const item = map[status]
    return <span className={cn(base, item.className)}>{item.label}</span>
}

export function BookingsTab({ onCreateBooking, refreshTrigger }: BookingsTabProps) {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
        end: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    })
    const [showFilters, setShowFilters] = useState(false)

    // Загружаем записи
    const loadBookings = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedStatuses.length > 0) {
                params.append('status', selectedStatuses.join(','))
            }
            if (dateRange.start) {
                params.append('start_date', dateRange.start)
            }
            if (dateRange.end) {
                params.append('end_date', dateRange.end)
            }
            if (searchQuery) {
                params.append('search', searchQuery)
            }

            const res = await fetch(`/api/admin/bookings?${params.toString()}`)
            if (res.ok) {
                const data = (await res.json()) as Booking[]
                setBookings(data)
            }
        } catch (error) {
            console.error('Failed to load bookings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Загружаем записи при монтировании и при изменении refreshTrigger
    useEffect(() => {
        loadBookings()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger])

    // Группируем записи по датам
    const groupedBookings = useMemo(() => {
        const groups = new Map<string, Booking[]>()
        bookings.forEach((booking) => {
            const dateKey = booking.booking_date
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)!.push(booking)
        })
        return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    }, [bookings])

    // Статистика
    const stats = useMemo(() => {
        return {
            total: bookings.length,
            pending: bookings.filter((b) => b.status === 'pending_payment').length,
            confirmed: bookings.filter((b) => b.status === 'confirmed').length,
            completed: bookings.filter((b) => b.status === 'completed').length,
            cancelled: bookings.filter((b) => b.status === 'cancelled').length,
        }
    }, [bookings])

    const handleStatusToggle = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        )
    }

    const handleMarkPaid = async (id: number) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed', paid_at: new Date().toISOString() }),
            })
            if (res.ok) {
                loadBookings()
            }
        } catch (error) {
            console.error('Failed to mark as paid:', error)
        }
    }

    const handleCancel = async (id: number) => {
        if (!confirm('Вы уверены, что хотите отменить эту запись?')) return
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            })
            if (res.ok) {
                loadBookings()
            }
        } catch (error) {
            console.error('Failed to cancel:', error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту запись? Это действие необратимо.')) return
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                loadBookings()
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Всего</div>
                        <div className="text-2xl font-bold text-primary-900">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Ожидают оплаты</div>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Подтверждены</div>
                        <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Завершены</div>
                        <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="text-xs text-gray-500 mb-1">Отменены</div>
                        <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Фильтры и поиск */}
            <Card className="booking-card">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary-500" />
                            Записи
                        </CardTitle>
                        <Button onClick={onCreateBooking} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Создать запись
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Поиск */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    loadBookings()
                                }
                            }}
                            placeholder="Поиск по имени, телефону, email..."
                            className="pl-10"
                        />
                    </div>
                    <div className="text-xs text-gray-500 bg-primary-50/50 p-2 rounded-lg">
                        ⏰ Всё время указано по Москве (МСК)
                    </div>

                    {/* Фильтры */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Фильтры
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => loadBookings()}>
                            Применить
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedStatuses([])
                                setDateRange({
                                    start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
                                    end: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
                                })
                                loadBookings()
                            }}
                        >
                            Сбросить
                        </Button>
                    </div>

                    {showFilters && (
                        <div className="grid gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            {/* Статусы */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Статусы</label>
                                <div className="flex flex-wrap gap-2">
                                    {['pending_payment', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusToggle(status)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                                                selectedStatuses.includes(status)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                            )}
                                        >
                                            {status === 'pending_payment' && '🟡 Ожидает оплаты'}
                                            {status === 'confirmed' && '✅ Подтверждена'}
                                            {status === 'completed' && '✅ Завершена'}
                                            {status === 'cancelled' && '❌ Отменена'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Период */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">С</label>
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">По</label>
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Список записей */}
            {isLoading ? (
                <Card className="booking-card">
                    <CardContent className="p-12 text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                        <p className="mt-3 text-sm text-gray-500">Загрузка записей...</p>
                    </CardContent>
                </Card>
            ) : groupedBookings.length === 0 ? (
                <Card className="booking-card">
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">Записи не найдены</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {groupedBookings.map(([date, dateBookings]) => (
                        <div key={date}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                            </h3>
                            <div className="space-y-3">
                                {dateBookings.map((booking) => (
                                    <Card key={booking.id} className="booking-card">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <StatusBadge status={booking.status} />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {booking.booking_time}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-gray-900">{booking.client_name}</p>
                                                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                            <span>{booking.client_phone}</span>
                                                            {booking.client_email && <span>{booking.client_email}</span>}
                                                        </div>
                                                        {booking.notes && (
                                                            <p className="text-sm text-gray-500 italic">{booking.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {booking.status === 'pending_payment' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkPaid(booking.id)}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Оплачено
                                                        </Button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleCancel(booking.id)}
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Отменить
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(booking.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

