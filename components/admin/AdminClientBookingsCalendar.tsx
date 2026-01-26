'use client'

import { useState, useMemo } from 'react'
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    isToday, 
    addMonths,
    parseISO
} from 'date-fns'
import { ru } from 'date-fns/locale'
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar as CalendarIcon, 
    Clock, 
    X,
    Edit,
    Trash2,
    CheckCircle,
    Ban,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'
import { formatDateRu, formatTimeSlot } from '@/lib/utils/date'
import { toast } from 'sonner'

interface AdminClientBookingsCalendarProps {
    bookings: Booking[]
    onReschedule: (booking: Booking) => void
    onViewDetails: (booking: Booking) => void
    onMarkPaid: (bookingId: number) => Promise<void>
    onCancel: (bookingId: number) => Promise<void>
    onDelete: (bookingId: number) => Promise<void>
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold'
    
    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: { 
            label: 'Ожидает оплаты', 
            className: 'bg-yellow-100 text-yellow-800 border border-yellow-300', 
            icon: '⏳' 
        },
        confirmed: { 
            label: 'Подтверждена', 
            className: 'bg-green-100 text-green-800 border border-green-300', 
            icon: '✓' 
        },
        completed: { 
            label: 'Завершена', 
            className: 'bg-emerald-100 text-emerald-800 border border-emerald-300', 
            icon: '✓' 
        },
        cancelled: { 
            label: 'Отменена', 
            className: 'bg-red-100 text-red-800 border border-red-300', 
            icon: '✕' 
        },
    }

    const item = map[status]
    return (
        <span className={`${base} ${item.className}`}>
            <span>{item.icon}</span> {item.label}
        </span>
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
        
        if (bookings.some(b => b.status === 'confirmed')) return 'bg-green-500'
        if (bookings.some(b => b.status === 'pending_payment')) return 'bg-yellow-500'
        if (bookings.some(b => b.status === 'completed')) return 'bg-emerald-500'
        if (bookings.some(b => b.status === 'cancelled')) return 'bg-red-500'
        
        return 'bg-gray-500'
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
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                </h3>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handlePrevMonth}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3"
                    >
                        Сегодня
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleNextMonth}
                        className="h-9 w-9 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Заголовки дней недели */}
            <div className="grid grid-cols-7 gap-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
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
                                'aspect-square p-2 rounded-xl border-2 transition-all relative',
                                'flex flex-col items-center justify-center',
                                isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                                isCurrentDay && 'ring-2 ring-primary-400 ring-offset-2',
                                dayHasBookings && 'cursor-pointer hover:border-primary-400 hover:shadow-md bg-white',
                                !dayHasBookings && 'border-gray-100 cursor-default',
                                dayHasBookings ? 'border-primary-200' : 'border-gray-100'
                            )}
                        >
                            <span className={cn(
                                'text-lg font-semibold',
                                isCurrentDay && 'text-primary-600'
                            )}>
                                {format(day, 'd')}
                            </span>
                            
                            {dayHasBookings && (
                                <div className="absolute bottom-1 flex items-center gap-1">
                                    <div className={cn(
                                        'w-2 h-2 rounded-full',
                                        getBookingStatusColor(day)
                                    )} />
                                    {bookingsCount > 1 && (
                                        <span className="text-[10px] font-bold text-gray-600">
                                            {bookingsCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Легенда */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-4 border-t">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Подтверждена</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span>Ожидает оплаты</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Завершена</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Отменена</span>
                </div>
            </div>

            {/* Модальное окно с деталями записи */}
            <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <CalendarIcon className="h-6 w-6 text-primary-600" />
                                {selectedDate && formatDateRu(format(selectedDate, 'yyyy-MM-dd'))}
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDate(null)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {selectedBookings.map((booking) => (
                            <div key={booking.id} className="border-2 border-gray-200 rounded-xl p-5 space-y-4 bg-white hover:shadow-lg transition-shadow">
                                {/* Заголовок */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {formatTimeSlot(booking.booking_time)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Запись #{booking.id}
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>

                                {/* Детали */}
                                <div className="space-y-3 text-sm border-t border-b border-gray-100 py-3">
                                    {booking.product_description && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-semibold text-gray-700 min-w-[100px]">Услуга:</span>
                                            <span className="text-gray-900 font-medium flex-1">{booking.product_description}</span>
                                        </div>
                                    )}
                                    {booking.amount && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-semibold text-gray-700 min-w-[100px]">Стоимость:</span>
                                            <span className="text-gray-900 font-bold">
                                                {booking.amount.toLocaleString('ru-RU')} ₽
                                            </span>
                                        </div>
                                    )}
                                    {booking.notes && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-semibold text-gray-700 min-w-[100px]">Заметки:</span>
                                            <span className="text-gray-600 italic flex-1">{booking.notes}</span>
                                        </div>
                                    )}
                                    {booking.paid_at && (
                                        <div className="flex items-start gap-2">
                                            <span className="font-semibold text-gray-700 min-w-[100px]">Оплачено:</span>
                                            <span className="text-green-600 font-medium">
                                                {format(parseISO(booking.paid_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Действия */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onViewDetails(booking)}
                                        disabled={isProcessing === booking.id}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Полные детали
                                    </Button>
                                    
                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => onReschedule(booking)}
                                            disabled={isProcessing === booking.id}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Перенести
                                        </Button>
                                    )}

                                    {booking.status === 'pending_payment' && (
                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkPaid(booking.id)}
                                            disabled={isProcessing === booking.id}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {isProcessing === booking.id ? 'Обработка...' : 'Оплачено'}
                                        </Button>
                                    )}

                                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={isProcessing === booking.id}
                                        >
                                            <Ban className="h-4 w-4 mr-2" />
                                            {isProcessing === booking.id ? 'Обработка...' : 'Отменить'}
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(booking.id)}
                                        disabled={isProcessing === booking.id}
                                        className="hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        {isProcessing === booking.id ? 'Удаление...' : 'Удалить'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
