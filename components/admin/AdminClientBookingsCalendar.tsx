'use client'

import {useMemo, useState} from 'react'
import {addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, isToday, parseISO, startOfMonth} from 'date-fns'
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
    X
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
            className: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: <Clock className="h-3 w-3" />
        },
        confirmed: {
            label: 'Подтверждена',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: <CheckCircle className="h-3 w-3" />
        },
        completed: {
            label: 'Завершена',
            className: 'bg-blue-50 text-blue-700 border-blue-200',
            icon: <CheckCircle className="h-3 w-3" />
        },
        cancelled: {
            label: 'Отменена',
            className: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: <X className="h-3 w-3" />
        },
    }

    const item = map[status]
    return (
        <Badge className={`${item.className} border gap-1.5 px-3 py-1.5 font-medium`}>
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

        if (bookings.some(b => b.status === 'confirmed')) return 'bg-emerald-500'
        if (bookings.some(b => b.status === 'pending_payment')) return 'bg-amber-500'
        if (bookings.some(b => b.status === 'completed')) return 'bg-blue-500'
        if (bookings.some(b => b.status === 'cancelled')) return 'bg-rose-500'

        return 'bg-gray-400'
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
            {/* Навигация по месяцам */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 capitalize">
                        {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Календарь записей клиента</p>
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
                        className="px-4 h-10"
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

            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-3 bg-gray-50 rounded-lg">
                        {day}
                    </div>
                ))}
            </div>

            {/* Дни месяца */}
            <div className="grid grid-cols-7 gap-2">
                {/* Пустые ячейки */}
                {Array.from({ length: emptyCellsStart }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Дни */}
                {daysInMonth.map((day) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isCurrentDay = isToday(day)
                    const dayHasBookings = hasBookings(day)
                    const bookingsCount = getBookingsCount(day)

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => handleDateClick(day)}
                            disabled={!dayHasBookings}
                            className={cn(
                                'aspect-square p-3 rounded-xl border transition-all relative group',
                                'flex flex-col items-center justify-start',
                                isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                isCurrentDay && 'ring-2 ring-primary-500 ring-offset-1',
                                dayHasBookings
                                    ? 'cursor-pointer hover:shadow-lg hover:border-primary-300 bg-white border-gray-200'
                                    : 'border-gray-100 cursor-default bg-gray-50',
                                'hover:scale-[1.02] transition-transform duration-200'
                            )}
                        >
                            <span className={cn(
                                'text-lg font-semibold mb-1',
                                isCurrentDay && 'text-primary-600',
                                !isCurrentMonth && 'text-gray-300'
                            )}>
                                {format(day, 'd')}
                            </span>

                            {dayHasBookings && (
                                <>
                                    <div className={cn(
                                        'w-2 h-2 rounded-full mb-1',
                                        getBookingStatusColor(day)
                                    )} />
                                    {bookingsCount > 1 && (
                                        <div className="absolute top-2 right-2">
                                            <div className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {bookingsCount}
                                            </div>
                                        </div>
                                    )}
                                    <div className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {bookingsCount} запись
                                    </div>
                                </>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Легенда */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 pt-6 border-t">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Подтверждена</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Ожидает оплаты</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Завершена</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Отменена</span>
                </div>
            </div>

            {/* Модальное окно с деталями записи */}
            <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 rounded-2xl border border-gray-200 shadow-2xl">
                    <div className="flex flex-col h-full">
                        {/* Заголовок */}
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-bold text-gray-900">
                                            Записи на {selectedDate && formatDateRu(format(selectedDate, 'yyyy-MM-dd'))}
                                        </DialogTitle>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {selectedBookings.length} {selectedBookings.length === 1 ? 'запись' : 'записей'} на этот день
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDate(null)}
                                    className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Список записей */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            <div className="space-y-4">
                                {selectedBookings.map((booking) => (
                                    <div key={booking.id} className="group relative">
                                        <div className={cn(
                                            "border border-gray-200 rounded-xl p-5 space-y-4 bg-white hover:shadow-xl transition-all duration-300",
                                            "hover:border-primary-200",
                                            booking.status === 'cancelled' && 'opacity-70 bg-gray-50',
                                            booking.status === 'completed' && 'bg-blue-50/50 border-blue-100'
                                        )}>
                                            {/* Верхняя часть - время и статус */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                                                        booking.status === 'confirmed' && "bg-gradient-to-br from-emerald-500 to-emerald-600",
                                                        booking.status === 'pending_payment' && "bg-gradient-to-br from-amber-500 to-amber-600",
                                                        booking.status === 'completed' && "bg-gradient-to-br from-blue-500 to-blue-600",
                                                        booking.status === 'cancelled' && "bg-gradient-to-br from-gray-500 to-gray-600"
                                                    )}>
                                                        <Clock className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            {formatTimeSlot(booking.booking_time)}
                                                        </div>
                                                        <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                                            ID: #{booking.id}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={booking.status} />
                                            </div>

                                            {/* Информация о клиенте */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                                {booking.client_name && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-gray-500 mb-1">Клиент</div>
                                                            <div className="text-sm font-semibold text-gray-900 truncate">
                                                                {booking.client_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking.client_phone && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <Phone className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-gray-500 mb-1">Телефон</div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {booking.client_phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking.product_description && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <FileText className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-gray-500 mb-1">Услуга</div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {booking.product_description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {booking.amount && (
                                                    <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                                                        <DollarSign className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-xs font-medium text-gray-500 mb-1">Стоимость</div>
                                                            <div className="text-sm font-semibold text-gray-900">
                                                                {booking.amount.toLocaleString('ru-RU')} ₽
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Заметки */}
                                            {booking.notes && (
                                                <div className="border border-gray-200 rounded-lg p-3 bg-amber-50/50">
                                                    <div className="flex items-start gap-2">
                                                        <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <div className="text-xs font-medium text-amber-700 mb-1">Заметки клиента</div>
                                                            <div className="text-sm text-amber-800 italic">{booking.notes}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Время оплаты */}
                                            {booking.paid_at && (
                                                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                                    <div className="text-sm text-emerald-700">
                                                        <span className="font-medium">Оплачено:</span>{' '}
                                                        {format(parseISO(booking.paid_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Действия */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => onViewDetails(booking)}
                                                        disabled={isProcessing === booking.id}
                                                        className="h-9 px-4 gap-2 hover:bg-gray-100"
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
                                                            className="h-9 px-4 gap-2 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-300"
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
                                                            className="h-9 px-4 gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            {isProcessing === booking.id ? 'Сохраняем...' : 'Отметить оплату'}
                                                        </Button>
                                                    )}

                                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleCancel(booking.id)}
                                                            disabled={isProcessing === booking.id}
                                                            className="h-9 px-4 gap-2 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
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
                                                        className="h-9 px-4 gap-2 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
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
                        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/95 border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Всего записей: <span className="font-semibold text-gray-900">{selectedBookings.length}</span>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSelectedDate(null)}
                                    className="px-6"
                                >
                                    Закрыть
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}