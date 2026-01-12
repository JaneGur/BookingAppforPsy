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
    const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105'
    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: { label: 'Ожидает оплаты', className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300', icon: '⏳' },
        confirmed: { label: 'Подтверждена', className: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300', icon: '✓' },
        completed: { label: 'Завершена', className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300', icon: '✓' },
        cancelled: { label: 'Отменена', className: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300', icon: '✕' },
    }
    const item = map[status]
    return <span className={cn(base, item.className)}><span className="text-base">{item.icon}</span> {item.label}</span>
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
        <div className="space-y-8">
            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="booking-card border-2 hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-gray-600 uppercase">Всего</div>
                            <Calendar className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card border-2 border-yellow-200/50 bg-gradient-to-br from-yellow-50/50 to-white hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-yellow-700 uppercase">Ожидают</div>
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-white hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-green-700 uppercase">Подтверждены</div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-600">{stats.confirmed}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card border-2 border-emerald-200/50 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-emerald-700 uppercase">Завершены</div>
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card className="booking-card border-2 border-red-200/50 bg-gradient-to-br from-red-50/50 to-white hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-semibold text-red-700 uppercase">Отменены</div>
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Фильтры и поиск */}
            <Card className="booking-card border-2">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl">Управление записями</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Все консультации в системе</p>
                            </div>
                        </div>
                        <Button onClick={onCreateBooking} size="lg" className="shadow-xl">
                            <Plus className="h-5 w-5 mr-2" />
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
                <Card className="booking-card border-2">
                    <CardContent className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                            <p className="text-lg font-semibold text-gray-700">Загрузка записей...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : groupedBookings.length === 0 ? (
                <Card className="booking-card border-2 text-center">
                    <CardContent className="py-20">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                            <span className="text-4xl">📭</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Записи не найдены</h3>
                        <p className="text-gray-600 mb-6">Попробуйте изменить параметры фильтрации или создайте новую запись</p>
                        <Button onClick={onCreateBooking} size="lg" className="shadow-xl">
                            <Plus className="h-5 w-5 mr-2" />
                            Создать первую запись
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {groupedBookings.map(([date, dateBookings]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                </h3>
                            </div>
                            <div className="space-y-4">
                                {dateBookings.map((booking) => (
                                    <Card key={booking.id} className="booking-card border-2 hover:shadow-2xl transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <StatusBadge status={booking.status} />
                                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200">
                                                            <Clock className="h-4 w-4 text-blue-600" />
                                                            <span className="text-sm font-bold text-blue-900">
                                                                {booking.booking_time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-bold text-gray-900">{booking.client_name}</p>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                            <span className="flex items-center gap-1">
                                                                📱 {booking.client_phone}
                                                            </span>
                                                            {booking.client_email && (
                                                                <span className="flex items-center gap-1">
                                                                    ✉️ {booking.client_email}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {booking.notes && (
                                                            <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                                                <p className="text-sm text-gray-700 italic">💬 {booking.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex lg:flex-col items-center gap-2">
                                                    {booking.status === 'pending_payment' && (
                                                        <Button
                                                            size="lg"
                                                            onClick={() => handleMarkPaid(booking.id)}
                                                            className="bg-green-600 hover:bg-green-700 w-full lg:w-auto"
                                                        >
                                                            <CheckCircle className="h-5 w-5 mr-2" />
                                                            Оплачено
                                                        </Button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="lg"
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="w-full lg:w-auto"
                                                        >
                                                            <XCircle className="h-5 w-5 mr-2" />
                                                            Отменить
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="lg"
                                                        onClick={() => handleDelete(booking.id)}
                                                        className="hover:bg-red-50 hover:text-red-600 w-full lg:w-auto"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
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

