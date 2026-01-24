'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, parseISO, startOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
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
    Eye,
    Clock,
    ArrowUpDown,
    CheckSquare,
    Square,
    List,
    CalendarDays,
    Ban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'
import { BookingsCalendar } from './BookingsCalendar'
import { BookingDetailsModal } from './BookingDetailsModal'
import {useUpdateBookingStatus, useDeleteBooking, useCancelBooking} from '@/lib/hooks'
import { RescheduleBookingModal } from '@/components/admin/RescheduleBookingModal'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

interface BookingsTabProps {
    onCreateBooking: () => void
    refreshTrigger?: number
}

type ViewMode = 'list' | 'calendar'
type SortField = 'date' | 'created_at' | 'status' | 'amount' | 'client_name'
type SortDirection = 'asc' | 'desc'
type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'upcoming' | 'past'

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
    // 🚀 Optimistic updates hooks
    const updateStatus = useUpdateBookingStatus()
    const deleteBooking = useDeleteBooking()
    const cancelBooking = useCancelBooking()
    const queryClient = useQueryClient()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
        end: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    })
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
    const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set())
    const [calendarDate, setCalendarDate] = useState(new Date())
    const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[] | null>(null)
    const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null)
    const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)

    // Используем React Query для получения записей
    const { data: bookings = [], isLoading, refetch } = useQuery({
        queryKey: ['bookings', 'admin', selectedStatuses, dateRange, searchQuery, refreshTrigger],
        queryFn: async () => {
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
            if (!res.ok) throw new Error('Failed to load bookings')
            return res.json() as Promise<Booking[]>
        },
    })

    // Применяем быстрые фильтры
    useEffect(() => {
        const today = startOfDay(new Date())
        switch (quickFilter) {
            case 'today':
                setDateRange({
                    start: format(today, 'yyyy-MM-dd'),
                    end: format(today, 'yyyy-MM-dd'),
                })
                break
            case 'week':
                setDateRange({
                    start: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                    end: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
                })
                break
            case 'month':
                setDateRange({
                    start: format(startOfMonth(today), 'yyyy-MM-dd'),
                    end: format(endOfMonth(today), 'yyyy-MM-dd'),
                })
                break
            case 'upcoming':
                setDateRange({
                    start: format(today, 'yyyy-MM-dd'),
                    end: format(addDays(today, 90), 'yyyy-MM-dd'),
                })
                break
            case 'past':
                setDateRange({
                    start: format(addDays(today, -90), 'yyyy-MM-dd'),
                    end: format(addDays(today, -1), 'yyyy-MM-dd'),
                })
                break
            default:
                // all - reset
                break
        }
    }, [quickFilter])

    // Сортировка записей
    const sortedBookings = useMemo(() => {
        const sorted = [...bookings]
        sorted.sort((a, b) => {
            let comparison = 0
            switch (sortField) {
                case 'date':
                    comparison = `${a.booking_date}T${a.booking_time}`.localeCompare(`${b.booking_date}T${b.booking_time}`)
                    break
                case 'created_at':
                    comparison = (a.created_at || '').localeCompare(b.created_at || '')
                    break
                case 'status':
                    comparison = a.status.localeCompare(b.status)
                    break
                case 'amount':
                    comparison = (a.amount || 0) - (b.amount || 0)
                    break
                case 'client_name':
                    comparison = a.client_name.localeCompare(b.client_name)
                    break
            }
            return sortDirection === 'asc' ? comparison : -comparison
        })
        return sorted
    }, [bookings, sortField, sortDirection])

    // Группируем записи по датам
    const groupedBookings = useMemo(() => {
        const groups = new Map<string, Booking[]>()
        sortedBookings.forEach((booking) => {
            const dateKey = booking.booking_date
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)!.push(booking)
        })
        return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    }, [sortedBookings])

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

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const handleSelectAll = () => {
        if (selectedBookings.size === sortedBookings.length) {
            setSelectedBookings(new Set())
        } else {
            setSelectedBookings(new Set(sortedBookings.map(b => b.id)))
        }
    }

    const handleSelectBooking = (id: number) => {
        const newSelected = new Set(selectedBookings)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedBookings(newSelected)
    }

    const handleBulkStatusChange = async (newStatus: Booking['status']) => {
        if (selectedBookings.size === 0) return

        const actionName = newStatus === 'confirmed' ? 'подтвердить' :
            newStatus === 'completed' ? 'завершить' : 'отменить'

        if (!confirm(`${newStatus === 'cancelled' ? 'Отменить' : 'Изменить статус у'} ${selectedBookings.size} записей?`)) return

        try {
            const promises = Array.from(selectedBookings).map(id =>
                fetch(`/api/bookings/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus }),
                })
            )

            await Promise.all(promises)

            // Инвалидируем кэш React Query
            queryClient.invalidateQueries({ queryKey: ['bookings'] })

            setSelectedBookings(new Set())
            toast.success(`Статус ${selectedBookings.size} записей изменен`)
        } catch (error) {
            console.error('Failed to bulk update:', error)
            toast.error('Не удалось изменить статус')
        }
    }

    const handleBulkCancel = async () => {
        if (selectedBookings.size === 0) return
        if (!confirm(`Отменить ${selectedBookings.size} записей? Записи будут помечены как отмененные, но останутся в истории.`)) return

        try {
            // Используем мутации для оптимистичной отмены
            const cancelPromises = Array.from(selectedBookings).map(id =>
                cancelBooking.mutateAsync(id)
            )

            await Promise.all(cancelPromises)

            setSelectedBookings(new Set())
            toast.success(`Отменено ${selectedBookings.size} записей`)
        } catch (error) {
            console.error('Failed to bulk cancel:', error)
            toast.error('Не удалось отменить записи')
        }
    }

    const handleBulkDelete = async () => {
        if (selectedBookings.size === 0) return
        if (!confirm(`Полностью удалить ${selectedBookings.size} записей из базы данных? Это действие необратимо. Записи будут удалены безвозвратно.`)) return

        try {
            // Используем мутации для оптимистичного удаления
            const deletePromises = Array.from(selectedBookings).map(id =>
                deleteBooking.mutateAsync(id)
            )

            await Promise.all(deletePromises)

            setSelectedBookings(new Set())
            toast.success(`Удалено ${selectedBookings.size} записей`)
        } catch (error) {
            console.error('Failed to bulk delete:', error)
            toast.error('Не удалось удалить записи')
        }
    }

    const handleMarkPaid = async (id: number) => {
        try {
            await updateStatus.mutateAsync({
                id,
                status: 'confirmed',
                paid_at: new Date().toISOString()
            })
            toast.success('Запись подтверждена и оплачена')
        } catch (error) {
            console.error('Failed to mark as paid:', error)
            toast.error('Не удалось подтвердить оплату')
        }
    }

    const handleCancel = async (id: number) => {
        if (!confirm('Отменить эту запись? Запись будет помечена как отмененная, но останется в истории.')) return
        try {
            await cancelBooking.mutateAsync(id)
            toast.success('Запись отменена')
        } catch (error) {
            console.error('Failed to cancel:', error)
            toast.error('Не удалось отменить запись')
        }
    }

    const handleRescheduleOpen = (booking: Booking) => {
        setRescheduleBooking(booking)
    }

    // 🎯 OPTIMISTIC UPDATE - полное удаление записи
    const handleDelete = async (id: number) => {
        if (!confirm('Полностью удалить эту запись из базы данных? Это действие необратимо. Запись будет удалена безвозвратно.')) return
        try {
            await deleteBooking.mutateAsync(id)
            toast.success('Запись полностью удалена')
        } catch (error) {
            console.error('Failed to delete:', error)
            toast.error('Не удалось удалить запись')
        }
    }

    const handleDayClick = (date: string, dayBookings: Booking[]) => {
        setSelectedDayBookings(dayBookings)
    }

    // 🎯 OPTIMISTIC UPDATE - изменение статуса записи
    const handleStatusChange = async (id: number, status: Booking['status']) => {
        try {
            await updateStatus.mutateAsync({ id, status })
            toast.success('Статус записи изменен')
        } catch (error) {
            console.error('Failed to change status:', error)
            toast.error('Не удалось изменить статус')
        }
    }

    return (
        <div className="space-y-8">
            {/* Статистика */}
            <Card className="booking-card border-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Статистика записей</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-amber-700 uppercase truncate">Всего</div>
                                <Calendar className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-amber-900">{stats.total}</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-2 border-yellow-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-yellow-700 uppercase truncate">
                                    <span className="hidden sm:inline">Ожидают</span>
                                    <span className="sm:hidden">Ждут</span>
                                </div>
                                <Clock className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase truncate">
                                    <span className="hidden sm:inline">Подтверждены</span>
                                    <span className="sm:hidden">Подтв.</span>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-green-900">{stats.confirmed}</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase truncate">
                                    <span className="hidden sm:inline">Завершены</span>
                                    <span className="sm:hidden">Заверш.</span>
                                </div>
                                <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-900">{stats.completed}</div>
                        </div>
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-red-700 uppercase truncate">
                                    <span className="hidden sm:inline">Отменены</span>
                                    <span className="sm:hidden">Отмен.</span>
                                </div>
                                <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-red-900">{stats.cancelled}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Заголовок */}
            <Card className="booking-card border-2">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Управление записями</h2>
                                <p className="text-sm text-gray-600 mt-1">Все консультации в системе</p>
                            </div>
                        </div>
                        <Button onClick={onCreateBooking} size="lg" className="shadow-xl">
                            <Plus className="h-5 w-5 mr-2" />
                            Создать запись
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Фильтры и поиск */}
            <Card className="booking-card border-2">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Поиск и фильтрация</CardTitle>
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
                                    refetch()
                                }
                            }}
                            placeholder="Поиск по имени, телефону, email..."
                            className="pl-10"
                        />
                    </div>

                    {/* Быстрые фильтры */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { key: 'all' as QuickFilter, label: 'Все' },
                            { key: 'today' as QuickFilter, label: 'Сегодня' },
                            { key: 'week' as QuickFilter, label: 'Эта неделя' },
                            { key: 'month' as QuickFilter, label: 'Этот месяц' },
                            { key: 'upcoming' as QuickFilter, label: 'Предстоящие' },
                            { key: 'past' as QuickFilter, label: 'Прошедшие' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setQuickFilter(key)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    quickFilter === key
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Переключатель вида и фильтры */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4 mr-2" />
                                Список
                            </Button>
                            <Button
                                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                            >
                                <CalendarDays className="h-4 w-4 mr-2" />
                                Календарь
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Фильтры
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => refetch()}>
                                Применить
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedStatuses([])
                                    setQuickFilter('all')
                                    setDateRange({
                                        start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
                                        end: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
                                    })
                                    refetch()
                                }}
                            >
                                Сбросить
                            </Button>
                        </div>
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

            {/* Массовые действия */}
            {selectedBookings.size > 0 && (
                <Card className="booking-card border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
                    <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-primary-600" />
                                <span className="font-bold text-primary-900">
                                    Выбрано записей: {selectedBookings.size}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" onClick={() => handleBulkStatusChange('confirmed')}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Подтвердить
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange('completed')}>
                                    Завершить
                                </Button>
                                <Button size="sm" variant="secondary" onClick={handleBulkCancel}>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Отменить
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleBulkDelete}
                                    className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Удалить
                                </Button>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedBookings(new Set())} className="ml-auto">
                                Сбросить выбор
                            </Button>
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary-100">
                            <p className="text-xs text-gray-600">
                                <span className="font-medium">Отменить:</span> помечает записи как отмененные (остаются в истории)
                                <br />
                                <span className="font-medium">Удалить:</span> полностью удаляет записи из базы (необратимо)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Календарное представление */}
            {viewMode === 'calendar' && !isLoading && (
                <>
                    <BookingsCalendar
                        bookings={sortedBookings}
                        currentDate={calendarDate}
                        onDateChange={setCalendarDate}
                        onDayClick={handleDayClick}
                    />

                    {/* Модальное окно для выбранного дня */}
                    {selectedDayBookings && selectedDayBookings.length > 0 && (
                        <Card className="booking-card border-2 mt-6">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        Записи на {format(parseISO(selectedDayBookings[0].booking_date), 'd MMMM yyyy', { locale: ru })}
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedDayBookings(null)}>
                                        <XCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedDayBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        onClick={() => setDetailsBooking(booking)}
                                        className="booking-card border-2 p-4 hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <StatusBadge status={booking.status} />
                                                    <span className="text-sm font-bold text-blue-900">
                                                        {booking.booking_time}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-gray-900">{booking.client_name}</p>
                                                <p className="text-sm text-gray-600">{booking.client_phone}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-primary-600">
                                                    {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDetailsBooking(booking)
                                                }}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Детали
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Список записей */}
            {viewMode === 'list' && isLoading ? (
                <Card className="booking-card border-2">
                    <CardContent className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                            <p className="text-lg font-semibold text-gray-700">Загрузка записей...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' && bookings.length === 0 ? (
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
            ) : viewMode === 'list' && (
                <div className="space-y-6">
                    {/* Сортировка */}
                    <Card className="booking-card border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base sm:text-lg">Сортировка и выбор</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                                {[
                                    { key: 'date' as SortField, label: 'По дате', shortLabel: 'Дата' },
                                    { key: 'created_at' as SortField, label: 'По созданию', shortLabel: 'Создание' },
                                    { key: 'status' as SortField, label: 'По статусу', shortLabel: 'Статус' },
                                    { key: 'amount' as SortField, label: 'По сумме', shortLabel: 'Сумма' },
                                    { key: 'client_name' as SortField, label: 'По имени', shortLabel: 'Имя' },
                                ].map(({ key, label, shortLabel }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className={cn(
                                            'px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 whitespace-nowrap',
                                            sortField === key
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                        )}
                                    >
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{shortLabel}</span>
                                        {sortField === key && (
                                            <ArrowUpDown className={cn(
                                                "h-3 w-3 transition-transform flex-shrink-0",
                                                sortDirection === 'desc' && 'rotate-180'
                                            )} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {bookings.length > 0 && (
                                <div className="pt-3 border-t-2 border-gray-100">
                                    <button
                                        onClick={handleSelectAll}
                                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
                                    >
                                        {selectedBookings.size === sortedBookings.length ? (
                                            <CheckSquare className="h-5 w-5 text-primary-600" />
                                        ) : (
                                            <Square className="h-5 w-5 text-gray-400" />
                                        )}
                                        {selectedBookings.size === sortedBookings.length ? 'Снять выбор со всех' : 'Выбрать все'}
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Список записей по датам */}
                    {groupedBookings.map(([date, dateBookings]) => (
                        <Card key={date} className="booking-card border-2">
                            <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-br from-amber-50 to-white border-b-2 border-amber-100">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                    </div>
                                    <CardTitle className="text-base sm:text-xl">
                                        {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                    </CardTitle>
                                    <span className="ml-auto text-xs sm:text-sm font-medium text-gray-600">
                                        {dateBookings.length} {dateBookings.length === 1 ? 'запись' : 'записей'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                                {dateBookings.map((booking) => (
                                    <div key={booking.id} className="booking-card border-2 p-4 sm:p-5 hover:shadow-xl transition-all">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-start gap-3">
                                                <button
                                                    onClick={() => handleSelectBooking(booking.id)}
                                                    className="mt-1 hover:scale-110 transition-transform flex-shrink-0"
                                                >
                                                    {selectedBookings.has(booking.id) ? (
                                                        <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                                                    ) : (
                                                        <Square className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                                                    )}
                                                </button>
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
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-base sm:text-lg font-bold text-gray-900 break-words">{booking.client_name}</p>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <span className="flex-shrink-0">📱</span>
                                                                <span className="break-all">{booking.client_phone}</span>
                                                            </div>
                                                            {booking.client_email && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <span className="flex-shrink-0">✉️</span>
                                                                    <span className="break-all">{booking.client_email}</span>
                                                                </div>
                                                            )}
                                                        </div>
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
                                                        onClick={() => handleCancel(booking.id)}
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
                                                    onClick={() => handleDelete(booking.id)}
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Модальное окно деталей записи */}
            <BookingDetailsModal
                booking={detailsBooking}
                onClose={() => setDetailsBooking(null)}
                onDelete={handleDelete}
                onCancel={handleCancel}
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
        </div>
    )
}