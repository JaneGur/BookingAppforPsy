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
    Sparkles,
    CalendarDays,
    Filter,
    Menu,
    ChevronDown,
    ChevronUp
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
            label: 'Оплата',
            className: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm',
            icon: <Clock className="h-3 w-3" />
        },
        confirmed: {
            label: 'Подтв.',
            className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm',
            icon: <CheckCircle className="h-3 w-3" />
        },
        completed: {
            label: 'Завершена',
            className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm',
            icon: <CheckCircle className="h-3 w-3" />
        },
        cancelled: {
            label: 'Отмена',
            className: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm',
            icon: <X className="h-3 w-3" />
        },
    }

    const item = map[status]
    return (
        <Badge className={`${item.className} gap-1.5 px-2 py-1 font-medium shadow-sm text-xs`}>
            {item.icon}
            <span className="hidden sm:inline">{item.label}</span>
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
    const [showLegend, setShowLegend] = useState(false)
    const [showCalendarControls, setShowCalendarControls] = useState(false)

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
        <div className="space-y-4 md:space-y-6">
            {/* Заголовок и управление - мобильная версия */}
            <div className="bg-gradient-to-r from-white via-white to-gray-50 border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm">
                <div className="space-y-4">
                    {/* Заголовок */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                                <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-gray-900">
                                    Календарь
                                </h1>
                                <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-primary-500" />
                                    <span className="capitalize">
                                        {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Мобильное меню */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCalendarControls(!showCalendarControls)}
                            className="md:hidden h-9 w-9 p-0"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Статистика */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-primary-50 to-primary-100/30 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700">
                                {bookings.length} {bookings.length === 1 ? 'запись' : 'записей'}
                            </span>
                        </div>
                        {/*<Button*/}
                        {/*    variant="ghost"*/}
                        {/*    size="sm"*/}
                        {/*    onClick={() => setShowLegend(!showLegend)}*/}
                        {/*    className="h-7 px-2 text-xs"*/}
                        {/*>*/}
                        {/*    <Filter className="h-3.5 w-3.5 mr-1" />*/}
                        {/*    Легенда*/}
                        {/*</Button>*/}
                    </div>

                    {/* Управление календарем - мобильная версия */}
                    {showCalendarControls && (
                        <div className="md:hidden space-y-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Режим просмотра</span>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={`px-2 text-xs ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                                    >
                                        Сетка
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('compact')}
                                        className={`px-2 text-xs ${viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
                                    >
                                        Компактно
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handlePrevMonth}
                                    className="h-9 w-9 p-0 flex-1"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setCurrentMonth(new Date())}
                                    className="h-9 px-3 flex-2"
                                >
                                    Сегодня
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleNextMonth}
                                    className="h-9 w-9 p-0 flex-1"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Управление календарем - десктоп */}
                    <div className="hidden md:flex flex-wrap items-center justify-between gap-3">
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

            {/* Заголовки дней недели - адаптивные */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                    <div
                        key={day}
                        className={cn(
                            "text-center text-xs md:text-sm font-semibold py-2 md:py-3 rounded-lg",
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
                "grid gap-1 md:gap-2",
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
                                'group transition-all duration-300 active:scale-95',
                                viewMode === 'grid' ? 'aspect-square p-1.5 md:p-3 rounded-xl md:rounded-2xl border relative min-h-[44px]' : 'p-3 md:p-4 rounded-xl border relative',
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
                                viewMode === 'grid' ? 'items-center justify-start' : 'items-start justify-between gap-2 md:gap-3'
                            )}>
                                {/* Дата и день недели */}
                                <div className={cn(
                                    "flex items-center gap-1 md:gap-2",
                                    viewMode === 'grid' ? 'flex-col' : 'justify-between w-full'
                                )}>
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <span className={cn(
                                            "font-bold",
                                            viewMode === 'grid' ? 'text-lg md:text-2xl' : 'text-base md:text-xl',
                                            isCurrentDay && 'text-primary-600',
                                            !isCurrentMonth && 'text-gray-300',
                                            isWeekendDay && !isCurrentDay && 'text-blue-600'
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {viewMode === 'compact' && (
                                            <span className="text-xs md:text-sm font-medium text-gray-500">
                                                {format(day, 'EEEE', { locale: ru })}
                                            </span>
                                        )}
                                    </div>

                                    {viewMode === 'grid' && (
                                        <span className="text-[10px] md:text-xs font-medium text-gray-500 uppercase">
                                            {format(day, 'EEE', { locale: ru })}
                                        </span>
                                    )}
                                </div>

                                {/* Индикаторы записей */}
                                {dayHasBookings && (
                                    <div className={cn(
                                        "flex items-center gap-1 md:gap-2",
                                        viewMode === 'grid' ? 'flex-col mt-1 md:mt-2' : 'flex-row justify-between w-full'
                                    )}>
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <div className={cn(
                                                "w-2 h-2 md:w-3 md:h-3 rounded-full shadow-sm",
                                                getBookingStatusColor(day)
                                            )} />
                                            {viewMode === 'compact' && (
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {bookingsCount} {bookingsCount === 1 ? 'запись' : 'записи'}
                                                </span>
                                            )}
                                        </div>

                                        {bookingsCount > 1 && viewMode === 'grid' && (
                                            <div className="absolute top-1 md:top-3 right-1 md:right-3">
                                                <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white text-[8px] md:text-xs font-bold flex items-center justify-center shadow-md">
                                                    {bookingsCount}
                                                </div>
                                            </div>
                                        )}

                                        {viewMode === 'compact' && (
                                            <div className="flex items-center gap-1 md:gap-2">
                                                {bookingsByDate.get(format(day, 'yyyy-MM-dd'))?.slice(0, 2).map((booking) => (
                                                    <div key={booking.id} className="flex items-center gap-1 px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 rounded-lg">
                                                        <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-500" />
                                                        <span className="text-[10px] md:text-xs font-medium text-gray-700">
                                                            {formatTimeSlot(booking.booking_time)}
                                                        </span>
                                                    </div>
                                                ))}
                                                {bookingsCount > 2 && (
                                                    <div className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-100 rounded-lg text-[10px] md:text-xs font-medium text-gray-500">
                                                        +{bookingsCount - 2}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {viewMode === 'grid' && (
                                            <div className="text-[8px] md:text-[10px] text-gray-500 mt-0.5 md:mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {bookingsCount} запись
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Праздничный/выходной индикатор */}
                                {isWeekendDay && viewMode === 'grid' && !dayHasBookings && (
                                    <div className="absolute bottom-1 text-[8px] md:text-[10px] text-blue-400 font-medium">
                                        Выходной
                                    </div>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Легенда и статистика - мобильная версия */}
            {(showLegend || window.innerWidth >= 768) && (
                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-500" />
                            <h3 className="text-base md:text-lg font-semibold text-gray-900">Статусы записей</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLegend(false)}
                            className="md:hidden h-7 w-7 p-0"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                                <span className="text-xs md:text-sm font-semibold text-emerald-800">Подтверждена</span>
                            </div>
                            <div className="text-xs md:text-sm text-emerald-700">
                                {bookings.filter(b => b.status === 'confirmed').length} записей
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
                                <span className="text-xs md:text-sm font-semibold text-amber-800">Оплата</span>
                            </div>
                            <div className="text-xs md:text-sm text-amber-700">
                                {bookings.filter(b => b.status === 'pending_payment').length} записей
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"></div>
                                <span className="text-xs md:text-sm font-semibold text-blue-800">Завершена</span>
                            </div>
                            <div className="text-xs md:text-sm text-blue-700">
                                {bookings.filter(b => b.status === 'completed').length} записей
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-rose-50 to-rose-100/50 border border-rose-200 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1.5 md:gap-2 mb-0.5 md:mb-1">
                                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-rose-400 to-rose-500"></div>
                                <span className="text-xs md:text-sm font-semibold text-rose-800">Отменена</span>
                            </div>
                            <div className="text-xs md:text-sm text-rose-700">
                                {bookings.filter(b => b.status === 'cancelled').length} записей
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно с деталями записи - мобильная адаптация */}
            <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-full md:max-w-5xl max-h-[90vh] md:max-h-[90vh] overflow-hidden p-0 rounded-none md:rounded-3xl border-0 md:border border-gray-200 shadow-none md:shadow-2xl">
                    <div className="flex flex-col h-full bg-white">
                        {/* Заголовок - мобильный */}
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-white via-white to-gray-50 border-b border-gray-200 px-4 md:px-8 py-3 md:py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md md:shadow-lg">
                                        <CalendarIcon className="h-5 w-5 md:h-7 md:w-7 text-white" />
                                    </div>
                                    <div className="max-w-[calc(100%-100px)]">
                                        <DialogTitle className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                                            {selectedDate && formatDateRu(format(selectedDate, 'yyyy-MM-dd'))}
                                        </DialogTitle>
                                        <p className="text-xs md:text-sm text-gray-500 mt-0.5 flex items-center gap-1 md:gap-2">
                                            <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                                            <span className="truncate">
                                                {selectedDate && format(selectedDate, 'EEEE', { locale: ru })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-medium bg-primary-100 text-primary-700 px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                                        {selectedBookings.length}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedDate(null)}
                                        className="h-8 w-8 md:h-10 md:w-10 p-0 rounded-lg md:rounded-xl hover:bg-gray-100"
                                    >
                                        <X className="h-4 w-4 md:h-5 md:w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Список записей */}
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 bg-gradient-to-b from-white to-gray-50/50">
                            <div className="space-y-4 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-6">
                                {selectedBookings.map((booking) => (
                                    <div key={booking.id} className="group relative">
                                        <div className={cn(
                                            "border rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5 transition-all duration-300",
                                            "hover:shadow-xl md:hover:shadow-2xl md:hover:-translate-y-0.5",
                                            booking.status === 'confirmed' && "bg-gradient-to-br from-white via-white to-emerald-50/30 border-emerald-200/50",
                                            booking.status === 'pending_payment' && "bg-gradient-to-br from-white via-white to-amber-50/30 border-amber-200/50",
                                            booking.status === 'completed' && "bg-gradient-to-br from-white via-white to-blue-50/30 border-blue-200/50",
                                            booking.status === 'cancelled' && "bg-gradient-to-br from-gray-50/30 via-gray-50/20 to-gray-100/30 border-gray-200 opacity-80"
                                        )}>
                                            {/* Верхняя часть - время и статус */}
                                            <div className="flex items-start justify-between gap-3 md:gap-4">
                                                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md md:shadow-lg",
                                                        booking.status === 'confirmed' && "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-200",
                                                        booking.status === 'pending_payment' && "bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-200",
                                                        booking.status === 'completed' && "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200",
                                                        booking.status === 'cancelled' && "bg-gradient-to-br from-gray-500 to-gray-600 shadow-gray-200"
                                                    )}>
                                                        <Clock className="h-5 w-5 md:h-7 md:w-7 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                                                            {formatTimeSlot(booking.booking_time)}
                                                        </div>
                                                        <div className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1.5 truncate">
                                                            {booking.client_name}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={booking.status} />
                                            </div>

                                            {/* Информация */}
                                            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-200/50">
                                                {/* Услуга и стоимость */}
                                                <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4">
                                                    {booking.product_description && (
                                                        <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200">
                                                            <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-gray-500 mb-0.5 md:mb-1">Услуга</div>
                                                                <div className="text-sm font-bold text-gray-900 truncate">
                                                                    {booking.product_description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {booking.amount && (
                                                        <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200">
                                                            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-xs font-semibold text-gray-500 mb-0.5 md:mb-1">Стоимость</div>
                                                                <div className="text-sm md:text-base font-bold text-gray-900">
                                                                    {booking.amount.toLocaleString('ru-RU')} ₽
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Контакты */}
                                                {booking.client_phone && (
                                                    <div className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-gray-200">
                                                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-semibold text-gray-500 mb-0.5 md:mb-1">Контакты</div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {booking.client_phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Заметки */}
                                                {booking.notes && (
                                                    <div className="border border-amber-200/50 rounded-lg md:rounded-xl p-3 md:p-4 bg-gradient-to-r from-amber-50/50 to-amber-100/30">
                                                        <div className="flex items-start gap-2 md:gap-3">
                                                            <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1">
                                                                <div className="text-xs font-semibold text-amber-600 mb-1 md:mb-2">Заметки клиента</div>
                                                                <div className="text-xs md:text-sm text-amber-800 leading-relaxed line-clamp-3">
                                                                    {booking.notes}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Время оплаты */}
                                                {booking.paid_at && (
                                                    <div className="flex items-center gap-2 md:gap-3 px-3 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg md:rounded-xl">
                                                        <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
                                                        <div className="text-xs md:text-sm text-emerald-700">
                                                            <span className="font-semibold">Оплачено: </span>
                                                            {format(parseISO(booking.paid_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Действия - мобильная адаптация */}
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-3 pt-4 border-t border-gray-200/50">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onViewDetails(booking)}
                                                        disabled={isProcessing === booking.id}
                                                        className="h-8 md:h-10 px-3 md:px-4 gap-2 text-xs md:text-sm hover:shadow-sm"
                                                    >
                                                        <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                        Подробнее
                                                    </Button>

                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => onReschedule(booking)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-8 md:h-10 px-3 md:px-4 gap-2 text-xs md:text-sm hover:shadow-sm hover:bg-primary-50 hover:text-primary-700"
                                                        >
                                                            <Edit className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                                                            className="h-8 md:h-10 px-3 md:px-4 gap-2 text-xs md:text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-sm md:shadow-md"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                            {isProcessing === booking.id ? '...' : 'Оплата'}
                                                        </Button>
                                                    )}

                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleCancel(booking.id)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-8 md:h-10 px-3 md:px-4 gap-2 text-xs md:text-sm hover:shadow-sm hover:bg-rose-50 hover:text-rose-700"
                                                        >
                                                            <Ban className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                            {isProcessing === booking.id ? '...' : 'Отмена'}
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleDelete(booking.id)}
                                                        disabled={isProcessing === booking.id}
                                                        className="h-8 md:h-10 px-3 md:px-4 gap-2 text-xs md:text-sm hover:shadow-sm hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                                        {isProcessing === booking.id ? '...' : 'Удалить'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Футер - мобильный */}
                        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-4 md:px-8 py-3 md:py-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                                <div className="text-xs md:text-sm text-gray-500">
                                    <span className="font-semibold text-gray-900">{selectedBookings.length}</span> записей
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setSelectedDate(null)}
                                        className="h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm border-gray-300 hover:shadow-sm flex-1"
                                    >
                                        Закрыть
                                    </Button>
                                    {/*<Button*/}
                                    {/*    className="h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm shadow-sm flex-1"*/}
                                    {/*    onClick={() => {*/}
                                    {/*        // Добавить новую запись на эту дату*/}
                                    {/*    }}*/}
                                    {/*>*/}
                                    {/*    Добавить*/}
                                    {/*</Button>*/}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}