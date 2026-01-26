'use client'

import {useMemo, useState} from 'react'
import {addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, isToday, parseISO, startOfMonth, isWeekend} from 'date-fns'
import {ru} from 'date-fns/locale'
import {
    Badge,
    Ban,
    Calendar as CalendarIcon,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Edit,
    Eye,
    FileText,
    MessageSquare,
    Phone,
    Trash2,
    User,
    X,
    MoreHorizontal,
    Sparkles,
    CalendarDays,
    Filter
} from 'lucide-react'
import {Button} from '@/components/ui/button'
import {Dialog, DialogContent, DialogTitle} from '@/components/ui/dialog'
import {Booking} from '@/types/booking'
import {cn} from '@/lib/utils/cn'
import {formatDateRu, formatTimeSlot} from '@/lib/utils/date'

interface AdminClientBookingsCalendarProps {
    bookings: Booking[]
    onReschedule: (booking: Booking) => void
    onViewDetails: (booking: Booking) => void
    onMarkPaid: (bookingId: number) => Promise<void>
    onCancel: (bookingId: number) => Promise<void>
    onDelete: (bookingId: number) => Promise<void>
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const map: Record<Booking['status'], { label: string; className: string; icon: React.ReactNode }> = {
        pending_payment: {
            label: 'Ожидает оплаты',
            className: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm',
            icon: <Clock className="h-3 w-3" />
        },
        confirmed: {
            label: 'Подтверждена',
            className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm',
            icon: <CheckCircle className="h-3 w-3" />
        },
        completed: {
            label: 'Завершена',
            className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
            icon: <CheckCircle className="h-3 w-3" />
        },
        cancelled: {
            label: 'Отменена',
            className: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm',
            icon: <X className="h-3 w-3" />
        },
    }

    const item = map[status]
    return (
        <Badge className={`${item.className} gap-1.5 px-3 py-1.5 font-medium shadow-sm`}>
            {item.icon}
            {item.label}
        </Badge>
    )
}

export function AdminClientBookingsCalendar({
                                                bookings,
                                                onReschedule,
                                                onViewDetails,
                                                onMarkPaid,
                                                onCancel,
                                                onDelete
                                            }: AdminClientBookingsCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedBookings, setSelectedBookings] = useState<Booking[]>([])
    const [isProcessing, setIsProcessing] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid')

    // Группируем записи по датам
    const bookingsByDate = useMemo(() => {
        const map = new Map<string, Booking[]>()
        bookings.forEach(booking => {
            const dateKey = booking.booking_date
            if (!map.has(dateKey)) {
                map.set(dateKey, [])
            }
            map.get(dateKey)!.push(booking)
        })
        return map
    }, [bookings])

    // Получаем дни для отображения в календаре
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Добавляем пустые ячейки в начале
    const firstDayOfWeek = monthStart.getDay()
    const emptyCellsStart = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

    const handleDateClick = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const bookingsForDate = bookingsByDate.get(dateKey) || []

        if (bookingsForDate.length > 0) {
            setSelectedDate(date)
            setSelectedBookings(bookingsForDate.sort((a, b) =>
                a.booking_time.localeCompare(b.booking_time)
            ))
        }
    }

    const handlePrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1))
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const getBookingsCount = (date: Date): number => {
        const dateKey = format(date, 'yyyy-MM-dd')
        return bookingsByDate.get(dateKey)?.length || 0
    }

    const hasBookings = (date: Date): boolean => {
        return getBookingsCount(date) > 0
    }

    const getBookingStatusColor = (date: Date): string => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const bookings = bookingsByDate.get(dateKey) || []

        if (bookings.some(b => b.status === 'confirmed')) return 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-200'
        if (bookings.some(b => b.status === 'pending_payment')) return 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-200'
        if (bookings.some(b => b.status === 'completed')) return 'bg-gradient-to-br from-blue-400 to-blue-500 shadow-blue-200'
        if (bookings.some(b => b.status === 'cancelled')) return 'bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-200'

        return 'bg-gradient-to-br from-gray-300 to-gray-400'
    }

    const getDayBackground = (date: Date, hasBookings: boolean): string => {
        if (hasBookings) {
            if (isWeekend(date)) return 'bg-gradient-to-br from-white via-white to-blue-50/50'
            return 'bg-gradient-to-br from-white via-white to-gray-50'
        }
        if (isWeekend(date)) return 'bg-gradient-to-br from-gray-50/50 via-gray-50/30 to-blue-50/20'
        return 'bg-gradient-to-br from-gray-50/50 via-gray-50/30 to-transparent'
    }

    const handleMarkPaid = async (bookingId: number) => {
        setIsProcessing(bookingId)
        try {
            await onMarkPaid(bookingId)
            // Обновляем локальный список
            setSelectedBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' as const } : b)
            )
        } catch (error) {
            console.error('Error marking as paid:', error)
        } finally {
            setIsProcessing(null)
        }
    }

    const handleCancel = async (bookingId: number) => {
        if (!confirm('Отменить эту запись? Запись будет помечена как отмененная, но останется в истории.')) return

        setIsProcessing(bookingId)
        try {
            await onCancel(bookingId)
            // Обновляем локальный список
            setSelectedBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
            )
        } catch (error) {
            console.error('Error cancelling:', error)
        } finally {
            setIsProcessing(null)
        }
    }

    const handleDelete = async (bookingId: number) => {
        if (!confirm('Полностью удалить эту запись из базы данных? Это действие необратимо.')) return

        setIsProcessing(bookingId)
        try {
            await onDelete(bookingId)
            // Удаляем из локального списка
            setSelectedBookings(prev => prev.filter(b => b.id !== bookingId))

            // Если записей больше нет, закрываем модальное окно
            if (selectedBookings.length === 1) {
                setSelectedDate(null)
            }
        } catch (error) {
            console.error('Error deleting:', error)
        } finally {
            setIsProcessing(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Заголовок и управление */}
            <div className="bg-gradient-to-r from-white via-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                                <CalendarDays className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Календарь записей
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <CalendarIcon className="h-4 w-4 text-primary-500" />
                                        <span className="capitalize">
                                            {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        <span>{bookings.length} {bookings.length === 1 ? 'запись' : 'записей'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                            >
                                Сетка
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('compact')}
                                className={`px-3 ${viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                            >
                                Компактно
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handlePrevMonth}
                                className="h-10 w-10 p-0"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setCurrentMonth(new Date())}
                                className="px-4 h-10 min-w-[100px]"
                            >
                                Сегодня
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleNextMonth}
                                className="h-10 w-10 p-0"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                    <div
                        key={day}
                        className={cn(
                            "text-center text-sm font-semibold py-3 rounded-lg",
                            index >= 5
                                ? "bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 border border-blue-200/50"
                                : "bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border border-gray-200/50"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Дни месяца */}
            <div className={cn(
                "grid gap-2",
                viewMode === 'grid' ? "grid-cols-7" : "grid-cols-1"
            )}>
                {/* Пустые ячейки */}
                {viewMode === 'grid' && Array.from({ length: emptyCellsStart }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Дни */}
                {daysInMonth.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isCurrentDay = isToday(day)
                    const dayHasBookings = hasBookings(day)
                    const bookingsCount = getBookingsCount(day)
                    const isWeekendDay = isWeekend(day)

                    if (viewMode === 'compact' && !dayHasBookings) {
                        return null
                    }

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            disabled={!dayHasBookings}
                            className={cn(
                                'group transition-all duration-300',
                                viewMode === 'grid' ? 'aspect-square p-3 rounded-2xl border relative' : 'p-4 rounded-xl border relative',
                                isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                isCurrentDay && 'ring-2 ring-primary-500 ring-offset-1 shadow-lg',
                                dayHasBookings
                                    ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 bg-white border-gray-200 hover:border-primary-300'
                                    : 'border-gray-100 cursor-default',
                                getDayBackground(day, dayHasBookings)
                            )}
                        >
                            <div className={cn(
                                "flex flex-col h-full",
                                viewMode === 'grid' ? 'items-center justify-start' : 'items-start justify-between gap-3'
                            )}>
                                {/* Дата и день недели */}
                                <div className={cn(
                                    "flex items-center gap-2",
                                    viewMode === 'grid' ? 'flex-col' : 'justify-between w-full'
                                )}>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-bold",
                                            viewMode === 'grid' ? 'text-2xl' : 'text-xl',
                                            isCurrentDay && 'text-primary-600',
                                            !isCurrentMonth && 'text-gray-300',
                                            isWeekendDay && !isCurrentDay && 'text-blue-600'
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {viewMode === 'compact' && (
                                            <span className="text-sm font-medium text-gray-500">
                                                {format(day, 'EEEE', { locale: ru })}
                                            </span>
                                        )}
                                    </div>

                                    {viewMode === 'grid' && (
                                        <span className="text-xs font-medium text-gray-500 uppercase">
                                            {format(day, 'EEE', { locale: ru })}
                                        </span>
                                    )}
                                </div>

                                {/* Индикаторы записей */}
                                {dayHasBookings && (
                                    <div className={cn(
                                        "flex items-center gap-2",
                                        viewMode === 'grid' ? 'flex-col mt-2' : 'flex-row justify-between w-full'
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "w-3 h-3 rounded-full shadow-sm",
                                                getBookingStatusColor(day)
                                            )} />
                                            {viewMode === 'compact' && (
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {bookingsCount} {bookingsCount === 1 ? 'запись' : 'записи'}
                                                </span>
                                            )}
                                        </div>

                                        {bookingsCount > 1 && viewMode === 'grid' && (
                                            <div className="absolute top-3 right-3">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                                    {bookingsCount}
                                                </div>
                                            </div>
                                        )}

                                        {viewMode === 'compact' && (
                                            <div className="flex items-center gap-2">
                                                {bookingsByDate.get(format(day, 'yyyy-MM-dd'))?.slice(0, 2).map((booking) => (
                                                    <div key={booking.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
                                                        <Clock className="h-3 w-3 text-gray-500" />
                                                        <span className="text-xs font-medium text-gray-700">
                                                            {formatTimeSlot(booking.booking_time)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {bookingsCount > 2 && (
                                                    <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-500">
                                                        +{bookingsCount - 2}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {viewMode === 'grid' && (
                                            <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {bookingsCount} запись
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Праздничный/выходной индикатор */}
                                {isWeekendDay && viewMode === 'grid' && !dayHasBookings && (
                                    <div className="absolute bottom-2 text-[10px] text-blue-400 font-medium">
                                        Выходной
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Легенда и статистика */}
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Легенда статусов</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                        <span className="font-semibold text-gray-900">{bookings.length}</span> записей всего
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                            <span className="font-semibold text-emerald-800">Подтверждена</span>
                        </div>
                        <div className="text-sm text-emerald-700">
                            {bookings.filter(b => b.status === 'confirmed').length} записей
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
                            <span className="font-semibold text-amber-800">Ожидает оплаты</span>
                        </div>
                        <div className="text-sm text-amber-700">
                            {bookings.filter(b => b.status === 'pending_payment').length} записей
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"></div>
                            <span className="font-semibold text-blue-800">Завершена</span>
                        </div>
                        <div className="text-sm text-blue-700">
                            {bookings.filter(b => b.status === 'completed').length} записей
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"></div>
                            <span className="font-semibold text-rose-800">Отменена</span>
                        </div>
                        <div className="text-sm text-rose-700">
                            {bookings.filter(b => b.status === 'cancelled').length} записей
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно с деталями записи */}
            <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 rounded-3xl border border-gray-200 shadow-2xl">
                    <div className="flex flex-col h-full">
                        {/* Заголовок */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-white via-white to-gray-50 border-b border-gray-200 px-8 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                                        <CalendarIcon className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            Записи на {selectedDate && formatDateRu(format(selectedDate, 'yyyy-MM-dd'))}
                                            <span className="text-sm font-normal bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                                                {selectedBookings.length} {selectedBookings.length === 1 ? 'запись' : 'записей'}
                                            </span>
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                                            {selectedDate && format(selectedDate, 'EEEE', { locale: ru })}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDate(null)}
                                    className="h-10 w-10 p-0 rounded-xl hover:bg-gray-100 hover:shadow-sm"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Список записей */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-b from-white to-gray-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {selectedBookings.map((booking) => (
                                    <div key={booking.id} className="group relative">
                                        <div className={cn(
                                            "border rounded-2xl p-6 space-y-5 transition-all duration-300 h-full",
                                            "hover:shadow-2xl hover:-translate-y-0.5",
                                            booking.status === 'confirmed' && "bg-gradient-to-br from-white via-white to-emerald-50/30 border-emerald-200/50",
                                            booking.status === 'pending_payment' && "bg-gradient-to-br from-white via-white to-amber-50/30 border-amber-200/50",
                                            booking.status === 'completed' && "bg-gradient-to-br from-white via-white to-blue-50/30 border-blue-200/50",
                                            booking.status === 'cancelled' && "bg-gradient-to-br from-gray-50/30 via-gray-50/20 to-gray-100/30 border-gray-200 opacity-80"
                                        )}>
                                            {/* Верхняя часть - время и статус */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                                                        booking.status === 'confirmed' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200",
                                                        booking.status === 'pending_payment' && "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-200",
                                                        booking.status === 'completed' && "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200",
                                                        booking.status === 'cancelled' && "bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-200"
                                                    )}>
                                                        <Clock className="h-7 w-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                                            {formatTimeSlot(booking.booking_time)}
                                                            <span className="text-sm font-normal bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
                                                                ID: #{booking.id}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1.5">
                                                            {booking.client_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={booking.status} />
                                            </div>

                                            {/* Информация */}
                                            <div className="space-y-4 pt-4 border-t border-gray-200/50">
                                                {/* Услуга и стоимость */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    {booking.product_description && (
                                                        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
                                                            <FileText className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-gray-500 mb-1">Услуга</div>
                                                                <div className="text-sm font-bold text-gray-900 truncate">
                                                                    {booking.product_description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {booking.amount && (
                                                        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
                                                            <DollarSign className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-gray-500 mb-1">Стоимость</div>
                                                                <div className="text-base font-bold text-gray-900">
                                                                    {booking.amount.toLocaleString('ru-RU')} ₽
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Контакты */}
                                                {booking.client_phone && (
                                                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200">
                                                        <Phone className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-gray-500 mb-1">Контакты</div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {booking.client_phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Заметки */}
                                                {booking.notes && (
                                                    <div className="border border-amber-200/50 rounded-xl p-4 bg-gradient-to-r from-amber-50/50 to-amber-100/30">
                                                        <div className="flex items-start gap-3">
                                                            <MessageSquare className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <div className="text-xs font-semibold text-amber-600 mb-2">Заметки клиента</div>
                                                                <div className="text-sm text-amber-800 leading-relaxed">{booking.notes}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Время оплаты */}
                                                {booking.paid_at && (
                                                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl">
                                                        <CreditCard className="h-5 w-5 text-emerald-500" />
                                                        <div className="text-sm text-emerald-700">
                                                            <span className="font-semibold">Оплачено: </span>
                                                            {format(parseISO(booking.paid_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Действия */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-gray-200/50">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onViewDetails(booking)}
                                                        disabled={isProcessing === booking.id}
                                                        className="h-10 px-4 gap-2 hover:shadow-md"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Подробнее
                                                    </Button>

                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => onReschedule(booking)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-10 px-4 gap-2 hover:shadow-md hover:bg-primary-50 hover:text-primary-700"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Перенести
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {booking.status === 'pending_payment' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkPaid(booking.id)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-10 px-4 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-md hover:shadow-lg"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            {isProcessing === booking.id ? 'Обработка...' : 'Оплачено'}
                                                        </Button>
                                                    )}

                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleCancel(booking.id)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-10 px-4 gap-2 hover:shadow-md hover:bg-rose-50 hover:text-rose-700"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                            {isProcessing === booking.id ? 'Отмена...' : 'Отменить'}
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleDelete(booking.id)}
                                                        disabled={isProcessing === booking.id}
                                                        className="h-10 px-4 gap-2 hover:shadow-md hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {isProcessing === booking.id ? 'Удаляем...' : 'Удалить'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Футер */}
                        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-8 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Показано <span className="font-semibold text-gray-900">{selectedBookings.length}</span> из{' '}
                                    <span className="font-semibold text-gray-900">{selectedBookings.length}</span> записей
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setSelectedDate(null)}
                                        className="h-10 px-6 border-gray-300 hover:shadow-sm"
                                    >
                                        Закрыть
                                    </Button>
                                    <Button
                                        className="h-10 px-6 shadow-sm"
                                        onClick={() => {
                                            // Добавить новую запись на эту дату
                                        }}
                                    >
                                        Добавить запись
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}