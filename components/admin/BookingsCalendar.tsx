'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'

interface BookingsCalendarProps {
    bookings: Booking[]
    currentDate: Date
    onDateChange: (date: Date) => void
    onDayClick: (date: string, bookings: Booking[]) => void
}

export function BookingsCalendar({ bookings, currentDate, onDateChange, onDayClick }: BookingsCalendarProps) {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    // Группируем записи по датам
    const bookingsByDate = useMemo(() => {
        const map = new Map<string, Booking[]>()
        bookings.forEach((booking) => {
            const dateKey = booking.booking_date
            if (!map.has(dateKey)) {
                map.set(dateKey, [])
            }
            map.get(dateKey)!.push(booking)
        })
        return map
    }, [bookings])

    const getStatusColor = (status: Booking['status']) => {
        switch (status) {
            case 'pending_payment':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'confirmed':
                return 'bg-green-100 text-green-800 border-green-300'
            case 'completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-300'
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    const handlePreviousMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() - 1)
        onDateChange(newDate)
    }

    const handleNextMonth = () => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + 1)
        onDateChange(newDate)
    }

    const handleToday = () => {
        onDateChange(new Date())
    }

    return (
        <Card className="booking-card border-2">
            <CardContent className="p-6">
                {/* Заголовок календаря */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {format(currentDate, 'LLLL yyyy', { locale: ru })}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleToday}>
                            Сегодня
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handlePreviousMonth}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Дни недели */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                        <div key={day} className="text-center text-sm font-bold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Календарная сетка */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const dayBookings = bookingsByDate.get(dateKey) || []
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isToday = isSameDay(day, new Date())
                        const hasBookings = dayBookings.length > 0

                        // Группируем по статусам
                        const statusCounts = dayBookings.reduce((acc, b) => {
                            acc[b.status] = (acc[b.status] || 0) + 1
                            return acc
                        }, {} as Record<string, number>)

                        return (
                            <button
                                key={dateKey}
                                onClick={() => hasBookings && onDayClick(dateKey, dayBookings)}
                                className={cn(
                                    'min-h-[100px] p-2 rounded-xl border-2 transition-all text-left',
                                    isCurrentMonth 
                                        ? 'bg-white hover:shadow-lg hover:scale-105' 
                                        : 'bg-gray-50 opacity-40',
                                    isToday && 'ring-2 ring-primary-500',
                                    hasBookings ? 'border-primary-200 cursor-pointer' : 'border-gray-200'
                                )}
                                disabled={!hasBookings}
                            >
                                {/* Номер дня */}
                                <div className={cn(
                                    'text-sm font-bold mb-2',
                                    isToday 
                                        ? 'text-white bg-primary-600 w-7 h-7 rounded-full flex items-center justify-center' 
                                        : 'text-gray-900'
                                )}>
                                    {format(day, 'd')}
                                </div>

                                {/* Записи */}
                                {hasBookings && (
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-primary-600 mb-1">
                                            {dayBookings.length} {dayBookings.length === 1 ? 'запись' : 'записей'}
                                        </div>
                                        {Object.entries(statusCounts).map(([status, count]) => (
                                            <div
                                                key={status}
                                                className={cn(
                                                    'text-xs px-2 py-1 rounded-lg border font-medium truncate',
                                                    getStatusColor(status as Booking['status'])
                                                )}
                                            >
                                                {count} {status === 'pending_payment' && '⏳'}
                                                {status === 'confirmed' && '✓'}
                                                {status === 'completed' && '✓'}
                                                {status === 'cancelled' && '✕'}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Легенда */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
                            <span className="text-gray-700">Ожидает оплаты</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                            <span className="text-gray-700">Подтверждена</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-100 border-2 border-emerald-300"></div>
                            <span className="text-gray-700">Завершена</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                            <span className="text-gray-700">Отменена</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
