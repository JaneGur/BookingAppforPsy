'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
    User,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    MoreVertical,
    Phone,
    MessageSquare,
    CreditCard,
    DollarSign,
    FileText,
    ArrowLeft,
    BarChart3,
    Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'
import { BookingsCalendar } from './BookingsCalendar'
import { BookingDetailsModal } from './BookingDetailsModal'
import { useUpdateBookingStatus, useDeleteBooking, useCancelBooking } from '@/lib/hooks'
import { RescheduleBookingModal } from '@/components/admin/RescheduleBookingModal'
import { toast } from 'sonner'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'

interface BookingsTabProps {
    onCreateBooking: () => void
    refreshTrigger?: number
}

type ViewMode = 'list' | 'calendar'
type SortField = 'date' | 'created_at' | 'status' | 'amount' | 'client_name'
type SortDirection = 'asc' | 'desc'
type QuickFilter = 'all' | 'today' | 'week' | 'month' | 'upcoming' | 'past'

const BOOKINGS_PER_PAGE = 10

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105'
    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: { label: 'Ожидает оплаты', className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300', icon: '⏳' },
        confirmed: { label: 'Подтверждена', className: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300', icon: '✓' },
        completed: { label: 'Завершена', className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300', icon: '✓' },
        cancelled: { label: 'Отменена', className: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300', icon: '✕' },
    }
    const item = map[status]
    return (
        <span className={cn(base, item.className)}>
            <span className="text-xs">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.split(' ')[0]}</span>
        </span>
    )
}

export function BookingsTab({ onCreateBooking, refreshTrigger }: BookingsTabProps) {
    const updateStatus = useUpdateBookingStatus()
    const deleteBooking = useDeleteBooking()
    const cancelBooking = useCancelBooking()
    const queryClient = useQueryClient()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({})
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set())
    const [sortField, setSortField] = useState<SortField>('date')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [bookingDetails, setBookingDetails] = useState<Booking | null>(null)
    const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [calendarDate, setCalendarDate] = useState(new Date())
    const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([])
    const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showSortOptions, setShowSortOptions] = useState(false)
    const [showMobileActions, setShowMobileActions] = useState(false)
    const [showStats, setShowStats] = useState(false) // 🆕 Мобильная статистика
    const [showSearch, setShowSearch] = useState(false) // 🆕 Мобильный поиск

    const currentPageRef = useRef(1)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [fullStats, setFullStats] = useState<any>(null)

    // 🎯 Загрузка данных (оставляем как есть)
    const loadBookings = async (page: number = 1, append: boolean = false) => {
        if (append) {
            setIsLoadingMore(true)
        } else {
            setIsLoading(true)
        }
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: BOOKINGS_PER_PAGE.toString(),
                sort_by: sortField === 'date' ? 'booking_date' : sortField,
                sort_order: sortDirection
            })

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
            const result = await res.json()

            const adminBookings = result.data || []
            const normalized = adminBookings.map((adminBooking: any) => ({
                ...adminBooking,
                phone_hash: ''
            }))
            if (append) {
                setBookings((prev) => {
                    const existingIds = new Set(prev.map((b) => b.id))
                    const uniqueNew = normalized.filter((b: Booking) => !existingIds.has(b.id))
                    return [...prev, ...uniqueNew]
                })
            } else {
                setBookings(normalized)
            }
            setHasMore(result.pagination?.hasMore || false)
            currentPageRef.current = page
        } catch (error) {
            console.error('Error loading bookings:', error)
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }

    // 🎯 Остальные функции загрузки и обработки (оставляем как есть)
    const loadMore = () => {
        if (hasMore && !isLoading && !isLoadingMore) {
            loadBookings(currentPageRef.current + 1, true)
        }
    }

    const loadFullStats = async () => {
        try {
            const params = new URLSearchParams({
                limit: '10000',
                sort_by: 'booking_date',
                sort_order: 'desc'
            })

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
            if (!res.ok) throw new Error('Failed to load full stats')
            const result = await res.json()

            const allBookings = result.data || []

            const stats = {
                total: allBookings.length,
                pending: allBookings.filter((b: any) => b.status === 'pending_payment').length,
                confirmed: allBookings.filter((b: any) => b.status === 'confirmed').length,
                completed: allBookings.filter((b: any) => b.status === 'completed').length,
                cancelled: allBookings.filter((b: any) => b.status === 'cancelled').length,
            }

            setFullStats(stats)
        } catch (error) {
            console.error('Error loading full stats:', error)
        }
    }

    useEffect(() => {
        currentPageRef.current = 1
        loadBookings(1, false)
        loadFullStats()
    }, [])

    // 🎯 Эффекты для фильтров (оставляем как есть)
    useEffect(() => {
        const today = startOfDay(new Date())
        if (quickFilter === 'all') {
            setDateRange({})
            return
        }

        if (quickFilter === 'today') {
            const day = format(today, 'yyyy-MM-dd')
            setDateRange({ start: day, end: day })
            return
        }

        if (quickFilter === 'week') {
            const start = startOfWeek(today, { weekStartsOn: 1 })
            const end = endOfWeek(today, { weekStartsOn: 1 })
            setDateRange({
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            })
            return
        }

        if (quickFilter === 'month') {
            const start = startOfMonth(today)
            const end = endOfMonth(today)
            setDateRange({
                start: format(start, 'yyyy-MM-dd'),
                end: format(end, 'yyyy-MM-dd'),
            })
            return
        }

        if (quickFilter === 'upcoming') {
            const start = format(today, 'yyyy-MM-dd')
            const end = format(addDays(today, 30), 'yyyy-MM-dd')
            setDateRange({ start, end })
            return
        }

        if (quickFilter === 'past') {
            const end = format(addDays(today, -1), 'yyyy-MM-dd')
            setDateRange({ end })
        }
    }, [quickFilter])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            currentPageRef.current = 1
            loadBookings(1, false)
            loadFullStats()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [selectedStatuses.join(','), dateRange.start, dateRange.end, searchQuery, sortField, sortDirection])

    // 🎯 Группировка и сортировка (оставляем как есть)
    const groupedBookings = useMemo(() => {
        const groups = new Map<string, Booking[]>()
        bookings.forEach((booking) => {
            const dateKey = booking.booking_date
            if (!groups.has(dateKey)) {
                groups.set(dateKey, [])
            }
            groups.get(dateKey)!.push(booking)
        })

        const compareByField = (a: Booking, b: Booking) => {
            let value = 0
            switch (sortField) {
                case 'created_at':
                    value = Date.parse(a.created_at) - Date.parse(b.created_at)
                    break
                case 'status':
                    value = a.status.localeCompare(b.status)
                    break
                case 'amount':
                    value = (a.amount || 0) - (b.amount || 0)
                    break
                case 'client_name':
                    value = a.client_name.localeCompare(b.client_name)
                    break
                default:
                    value = 0
            }
            return sortDirection === 'desc' ? -value : value
        }

        const entries = Array.from(groups.entries())

        if (sortField === 'date') {
            entries.sort((a, b) =>
                sortDirection === 'asc' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])
            )
            entries.forEach(([, list]) => {
                list.sort((a, b) => a.booking_time.localeCompare(b.booking_time))
            })
        } else {
            entries.forEach(([, list]) => {
                list.sort(compareByField)
            })
        }

        return entries
    }, [bookings, sortField, sortDirection])

    const stats = useMemo(() => {
        return {
            total: fullStats?.total || 0,
            pending: fullStats?.pending || 0,
            confirmed: fullStats?.confirmed || 0,
            completed: fullStats?.completed || 0,
            cancelled: fullStats?.cancelled || 0,
        }
    }, [fullStats])

    // 🎯 Остальные обработчики (оставляем как есть)
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
        setShowSortOptions(false)
    }

    const handleSelectAll = () => {
        if (selectedBookings.size === bookings.length) {
            setSelectedBookings(new Set())
        } else {
            setSelectedBookings(new Set(bookings.map(b => b.id)))
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
        if (!confirm(`Отменить ${selectedBookings.size} записей?`)) return

        try {
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
        if (!confirm(`Удалить ${selectedBookings.size} записей?`)) return

        try {
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
        if (!confirm('Отменить эту запись?')) return
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

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить эту запись?')) return
        try {
            await deleteBooking.mutateAsync(id)
            toast.success('Запись удалена')
        } catch (error) {
            console.error('Failed to delete:', error)
            toast.error('Не удалось удалить запись')
        }
    }

    const handleDayClick = (date: string, dayBookings: Booking[]) => {
        setSelectedDayBookings(dayBookings)
    }

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
        <div className="space-y-4 sm:space-y-8">
            {/* 🎯 Мобильное меню действий */}
            {showMobileActions && (
                <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileActions(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl animate-slideInRight"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">Действия</span>
                                <button
                                    onClick={() => setShowMobileActions(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <Button
                                size="sm"
                                onClick={onCreateBooking}
                                className="w-full justify-start"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Создать запись
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowFilters(true)}
                                className="w-full justify-start"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Фильтры
                            </Button>
                            <div className="pt-2 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className={`w-full justify-start ${viewMode === 'list' ? 'bg-primary-50 text-primary-700' : ''}`}
                                >
                                    <List className="h-4 w-4 mr-2" />
                                    Список
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className={`w-full justify-start ${viewMode === 'calendar' ? 'bg-primary-50 text-primary-700' : ''}`}
                                >
                                    <CalendarDays className="h-4 w-4 mr-2" />
                                    Календарь
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎯 Заголовок - мобильная адаптация */}
            <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md sm:shadow-lg flex-shrink-0">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-base sm:text-2xl font-bold text-gray-900 truncate">Управление записями</h2>
                                <p className="text-xs text-gray-600 mt-0.5 truncate">Все консультации в системе</p>
                            </div>
                        </div>

                        {/* 🎯 Мобильное меню кнопка */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowMobileActions(true)}
                            className="md:hidden h-8 w-8 flex-shrink-0"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>

                        {/* Десктопная кнопка */}
                        <Button onClick={onCreateBooking} size="lg" className="shadow-xl hidden sm:flex">
                            <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Создать запись
                        </Button>
                    </div>

                    {/* Мобильная кнопка создания */}
                    <Button onClick={onCreateBooking} size="lg" className="shadow-xl w-full mt-3 sm:hidden">
                        <Plus className="h-4 w-4 mr-2" />
                        Создать запись
                    </Button>
                </CardContent>
            </Card>

            {/* 🎯 Статистика - мобильная адаптация с аккордеоном */}
            <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full p-3 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors md:hidden"
                >
                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2 m-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-2 border-emerald-200/50 flex-shrink-0">
                            <BarChart3 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span>Статистика записей</span>
                    </CardTitle>
                    {showStats ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>

                {/* Десктоп заголовок */}
                <CardHeader className="hidden md:block pb-2 px-3 sm:px-6">
                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center border-2 border-emerald-200/50">
                            <BarChart3 className="w-4 h-4 text-emerald-600" />
                        </div>
                        Статистика записей
                    </CardTitle>
                </CardHeader>

                <CardContent className={`px-3 sm:px-6 pt-0 ${!showStats && 'hidden md:block'} md:pt-0`}>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 sm:gap-2">
                        <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-amber-700 uppercase">Всего</div>
                                <Calendar className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                            </div>
                            <div className="text-base sm:text-2xl font-bold text-amber-900">{stats.total}</div>
                        </div>
                        <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-yellow-700 uppercase">Ждут</div>
                                <Clock className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-yellow-600 flex-shrink-0" />
                            </div>
                            <div className="text-base sm:text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        </div>
                        <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-green-700 uppercase">Подтв.</div>
                                <CheckCircle className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                            </div>
                            <div className="text-base sm:text-2xl font-bold text-green-900">{stats.confirmed}</div>
                        </div>
                        <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase">Заверш.</div>
                                <CheckCircle className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                            </div>
                            <div className="text-base sm:text-2xl font-bold text-emerald-900">{stats.completed}</div>
                        </div>
                        <div className="p-2 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200">
                            <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div className="text-[10px] sm:text-xs font-semibold text-red-700 uppercase">Отмен.</div>
                                <XCircle className="h-2.5 w-2.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                            </div>
                            <div className="text-base sm:text-2xl font-bold text-red-900">{stats.cancelled}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🎯 Поиск и фильтры - мобильная адаптация */}
            <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2 px-3 sm:px-6">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-50 to-primary-50 flex items-center justify-center border-2 border-primary-200/50">
                                <Search className="w-3.5 h-3.5 text-primary-600" />
                            </div>
                            Поиск и фильтрация
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="sm:hidden h-7 w-7 p-0"
                        >
                            {isMobileMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 px-3 sm:px-6">
                    {/* 🎯 Мобильный поиск - сворачиваемый */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    {searchQuery ? `Поиск: "${searchQuery}"` : 'Поиск...'}
                                </span>
                            </div>
                            {showSearch ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                        {showSearch && (
                            <div className="mt-2 relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Введите имя, телефон..."
                                    className="pl-9 text-sm h-10"
                                />
                            </div>
                        )}
                    </div>

                    {/* Десктопный поиск */}
                    <div className="hidden sm:block relative">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск..."
                            className="pl-9 text-sm h-10 sm:h-12"
                        />
                    </div>

                    {/* Быстрые фильтры - мобильная версия */}
                    <div className="sm:hidden overflow-x-auto pb-2 -mx-3 px-3">
                        <div className="flex gap-1.5 min-w-max">
                            {[
                                { key: 'all' as QuickFilter, label: 'Все', mobile: 'Все' },
                                { key: 'today' as QuickFilter, label: 'Сегодня', mobile: 'Сегодня' },
                                { key: 'week' as QuickFilter, label: 'Неделя', mobile: 'Неделя' },
                                { key: 'month' as QuickFilter, label: 'Месяц', mobile: 'Месяц' },
                                { key: 'upcoming' as QuickFilter, label: 'Будущие', mobile: 'Будущие' },
                                { key: 'past' as QuickFilter, label: 'Прошлые', mobile: 'Прошлые' },
                            ].map(({ key, label, mobile }) => (
                                <button
                                    key={key}
                                    onClick={() => setQuickFilter(key)}
                                    className={cn(
                                        'px-3 py-1.5 text-xs font-medium transition-all rounded-lg whitespace-nowrap',
                                        quickFilter === key
                                            ? 'bg-primary-500 text-white shadow-md'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                    )}
                                >
                                    {mobile}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Быстрые фильтры - десктоп версия */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        {[
                            { key: 'all' as QuickFilter, label: 'Все', mobile: 'Все' },
                            { key: 'today' as QuickFilter, label: 'Сегодня', mobile: 'Сегодня' },
                            { key: 'week' as QuickFilter, label: 'Эта неделя', mobile: 'Неделя' },
                            { key: 'month' as QuickFilter, label: 'Этот месяц', mobile: 'Месяц' },
                            { key: 'upcoming' as QuickFilter, label: 'Предстоящие', mobile: 'Будущие' },
                            { key: 'past' as QuickFilter, label: 'Прошедшие', mobile: 'Прошлые' },
                        ].map(({ key, label, mobile }) => (
                            <button
                                key={key}
                                onClick={() => setQuickFilter(key)}
                                className={cn(
                                    'px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-all rounded-lg',
                                    quickFilter === key
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Мобильное меню фильтров */}
                    {isMobileMenuOpen && (
                        <div className="sm:hidden space-y-3 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="flex-1"
                                >
                                    <List className="h-3.5 w-3.5 mr-1.5" />
                                    Список
                                </Button>
                                <Button
                                    variant={viewMode === 'calendar' ? 'default' : 'secondary'}
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className="flex-1"
                                >
                                    <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                                    Календарь
                                </Button>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="w-full"
                            >
                                <Filter className="h-3.5 w-3.5 mr-1.5" />
                                {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                            </Button>
                        </div>
                    )}

                    {/* Десктопные кнопки */}
                    <div className="hidden sm:flex items-center justify-between">
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
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedStatuses([])
                                    setQuickFilter('all')
                                    setDateRange({})
                                    loadBookings(1, false)
                                }}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </div>

                    {/* Расширенные фильтры */}
                    {showFilters && (
                        <div className="grid gap-3 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                            {/* Статусы */}
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">Статусы</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {['pending_payment', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusToggle(status)}
                                            className={cn(
                                                'px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm font-medium transition-all rounded-lg whitespace-nowrap',
                                                selectedStatuses.includes(status)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                            )}
                                        >
                                            {status === 'pending_payment' && '🟡 Ожидает'}
                                            {status === 'confirmed' && '✅ Подтверждена'}
                                            {status === 'completed' && '✅ Завершена'}
                                            {status === 'cancelled' && '❌ Отменена'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Период */}
                            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">С</label>
                                    <Input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="text-sm h-10"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">По</label>
                                    <Input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="text-sm h-10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 🎯 Массовые действия - мобильная адаптация */}
            {selectedBookings.size > 0 && (
                <Card className="booking-card border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-sm">
                    <CardContent className="p-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                                    <span className="font-bold text-primary-900 text-sm">
                                        Выбрано: {selectedBookings.size}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedBookings(new Set())}
                                    className="text-xs h-7 px-2"
                                >
                                    Сбросить
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Button size="sm" onClick={() => handleBulkStatusChange('confirmed')} className="text-xs h-8 px-2 flex-1 min-w-[100px]">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Подтвердить
                                </Button>
                                <Button size="sm" variant="secondary" onClick={() => handleBulkStatusChange('completed')} className="text-xs h-8 px-2 flex-1 min-w-[100px]">
                                    Завершить
                                </Button>
                                <Button size="sm" variant="secondary" onClick={handleBulkCancel} className="text-xs h-8 px-2 flex-1 min-w-[100px]">
                                    <Ban className="h-3 w-3 mr-1" />
                                    Отменить
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={handleBulkDelete}
                                    className="text-xs h-8 px-2 flex-1 min-w-[100px] text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 🎯 Календарное представление - на мобильных не показываем */}
            {viewMode === 'calendar' && !isLoading && window.innerWidth >= 768 && (
                <>
                    <BookingsCalendar
                        bookings={bookings}
                        currentDate={calendarDate}
                        onDateChange={setCalendarDate}
                        onDayClick={handleDayClick}
                    />

                    {selectedDayBookings && selectedDayBookings.length > 0 && (
                        <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm mt-4">
                            <CardHeader className="px-3 sm:px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary-600" />
                                        {format(parseISO(selectedDayBookings[0].booking_date), 'd MMMM yyyy', { locale: ru })}
                                    </CardTitle>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedDayBookings([])} className="h-7 w-7 p-0">
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 px-3 sm:px-6 pb-3">
                                {selectedDayBookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        onClick={() => setDetailsBooking(booking)}
                                        className="booking-card border-2 p-3 hover:shadow-xl transition-all cursor-pointer bg-white"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                                    <StatusBadge status={booking.status} />
                                                    <span className="text-xs font-bold text-blue-900">
                                                        {booking.booking_time}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-sm truncate">{booking.client_name}</p>
                                                <p className="text-xs text-gray-600 truncate">{booking.client_phone}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="text-sm font-bold text-primary-600">
                                                    {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDetailsBooking(booking)
                                                }} className="h-6 w-6 p-0">
                                                    <Eye className="h-3 w-3" />
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

            {/* 🎯 Предупреждение о календаре на мобильных */}
            {viewMode === 'calendar' && window.innerWidth < 768 && (
                <Card className="booking-card border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">Календарь на мобильных</h3>
                        <p className="text-xs text-gray-600 mb-3">Для удобства просмотра календаря перейдите в режим списка или используйте десктопную версию</p>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="w-full"
                        >
                            <List className="h-3.5 w-3.5 mr-1.5" />
                            Перейти к списку
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* 🎯 Список записей - мобильная адаптация */}
            {viewMode === 'list' && isLoading ? (
                <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                    <CardContent className="py-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-semibold text-gray-700">Загрузка записей...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' && bookings.length === 0 ? (
                <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm text-center">
                    <CardContent className="py-8">
                        <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-3">
                            <span className="text-2xl">📭</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-800 mb-1.5">Записи не найдены</h3>
                        <p className="text-xs text-gray-600 mb-3">Попробуйте изменить параметры фильтрации</p>
                        <Button onClick={onCreateBooking} size="lg" className="shadow-xl w-full max-w-xs mx-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Создать запись
                        </Button>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' && (
                <div className="space-y-3">
                    {/* 🎯 Сортировка - мобильная адаптация */}
                    <Card className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                        <button
                            onClick={() => setShowSortOptions(!showSortOptions)}
                            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <CardTitle className="text-sm flex items-center gap-2 m-0">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center border-2 border-primary-200/50">
                                    <ArrowUpDown className="w-3 h-3 text-primary-600" />
                                </div>
                                Сортировка
                            </CardTitle>
                            {showSortOptions ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>

                        <CardContent className={`space-y-2 px-3 pt-0 ${!showSortOptions && 'hidden'}`}>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'date' as SortField, label: 'Дата' },
                                    { key: 'client_name' as SortField, label: 'Имя' },
                                    { key: 'created_at' as SortField, label: 'Создание' },
                                    { key: 'status' as SortField, label: 'Статус' },
                                    { key: 'amount' as SortField, label: 'Сумма' },
                                ].map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className={cn(
                                            'px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between gap-1',
                                            sortField === key
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                        )}
                                    >
                                        {label}
                                        {sortField === key && (
                                            <ArrowUpDown className={cn(
                                                "h-2.5 w-2.5 transition-transform",
                                                sortDirection === 'desc' && 'rotate-180'
                                            )} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {bookings.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2 justify-center mt-2"
                                >
                                    {selectedBookings.size === bookings.length ? (
                                        <CheckSquare className="h-4 w-4 text-primary-600" />
                                    ) : (
                                        <Square className="h-4 w-4 text-gray-400" />
                                    )}
                                    {selectedBookings.size === bookings.length ? 'Снять выбор со всех' : 'Выбрать все'}
                                </button>
                            )}
                        </CardContent>
                    </Card>

                    {/* 🎯 Список записей по датам - мобильная адаптация */}
                    {groupedBookings.map(([date, dateBookings]) => (
                        <Card key={date} className="booking-card border-2 border-gray-200 bg-white shadow-sm">
                            <CardHeader className="pb-2 px-3 bg-gradient-to-br from-amber-50 to-white border-b border-amber-100">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md flex-shrink-0">
                                        <Calendar className="h-3 w-3 text-white" />
                                    </div>
                                    <CardTitle className="text-sm flex-1 min-w-0">
                                        <span className="truncate block">{format(parseISO(date), 'd MMMM yyyy', { locale: ru })}</span>
                                    </CardTitle>
                                    <span className="text-xs font-medium text-gray-600">
                                        {dateBookings.length} зап.
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-2 space-y-2">
                                {dateBookings.map((booking) => (
                                    <div key={booking.id} className="booking-card border border-gray-200 p-3 hover:shadow-md transition-all bg-white">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-start gap-2">
                                                <button
                                                    onClick={() => handleSelectBooking(booking.id)}
                                                    className="mt-0.5 hover:scale-110 transition-transform flex-shrink-0"
                                                >
                                                    {selectedBookings.has(booking.id) ? (
                                                        <CheckSquare className="h-4 w-4 text-primary-600" />
                                                    ) : (
                                                        <Square className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <StatusBadge status={booking.status} />
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                                                            <Clock className="h-2.5 w-2.5 text-blue-600 flex-shrink-0" />
                                                            <span className="text-xs font-bold text-blue-900 whitespace-nowrap">
                                                                {booking.booking_time}
                                                            </span>
                                                        </div>
                                                        <div className="px-1.5 py-0.5 rounded-md bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                                                            <span className="text-xs font-bold text-purple-900 whitespace-nowrap">
                                                                {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Link
                                                            href={`/admin/clients/${booking.client_id}`}
                                                            className="group inline-block"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <p className="text-sm font-bold text-blue-900 break-words hover:text-primary-700 hover:underline transition-colors flex items-center gap-1">
                                                                <User className="h-3.5 w-3.5 flex-shrink-0 text-primary-500 group-hover:text-primary-600" />
                                                                {booking.client_name}
                                                            </p>
                                                        </Link>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                <span className="flex-shrink-0">📱</span>
                                                                <span className="break-all">{booking.client_phone}</span>
                                                            </div>
                                                            {booking.client_email && (
                                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                                    <span className="flex-shrink-0">✉️</span>
                                                                    <span className="break-all">{booking.client_email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {booking.product_description && (
                                                            <div className="mt-1 p-1.5 rounded-md bg-purple-50 border border-purple-200">
                                                                <p className="text-xs text-purple-900 break-words line-clamp-2">📝 {booking.product_description}</p>
                                                            </div>
                                                        )}
                                                        {booking.notes && (
                                                            <div className="mt-1 p-1.5 rounded-md bg-gray-50 border border-gray-200">
                                                                <p className="text-xs text-gray-700 italic break-words line-clamp-2">💬 {booking.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🎯 Мобильные кнопки - только Детали */}
                                            <div className="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDetailsBooking(booking)}
                                                    className="text-xs h-7 px-2 flex-1 min-w-[100px]"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Детали
                                                </Button>

                                                {/* Остальные кнопки только в деталях */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Кнопка "Показать еще" - мобильная адаптация */}
            {viewMode === 'list' && (hasMore || isLoadingMore) && (
                <div className="px-3 sm:px-0">
                    <LoadMoreButton
                        onClick={loadMore}
                        isLoading={isLoadingMore}
                        hasMore={hasMore}
                    />
                </div>
            )}

            {/* 🎯 Модальные окна */}
            {detailsBooking && (
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
            )}

            {rescheduleBooking && (
                <RescheduleBookingModal
                    booking={rescheduleBooking}
                    open={!!rescheduleBooking}
                    onClose={() => setRescheduleBooking(null)}
                    onSuccess={(updated) => {
                        setBookings((prev) =>
                            prev.map((b) =>
                                b.id === updated.id
                                    ? { ...b, booking_date: updated.booking_date, booking_time: updated.booking_time }
                                    : b
                            )
                        )
                    }}
                />
            )}
        </div>
    )
}