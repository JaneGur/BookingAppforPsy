'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addDays, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Ban, Calendar, Clock, X, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'

interface BlockedSlot {
    id: number
    slot_date: string
    slot_time: string
    reason?: string
    created_at: string
}

export default function BlockingPage() {
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [reason, setReason] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const today = startOfDay(new Date())

    // Загружаем заблокированные слоты
    const loadBlockedSlots = async () => {
        setIsLoading(true)
        try {
            const startDate = format(monthStart, 'yyyy-MM-dd')
            const endDate = format(monthEnd, 'yyyy-MM-dd')

            const res = await fetch(`/api/admin/blocked-slots?start_date=${startDate}&end_date=${endDate}`)
            if (res.ok) {
                const data = (await res.json()) as BlockedSlot[]
                setBlockedSlots(data)
            }
        } catch (error) {
            console.error('Failed to load blocked slots:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBlockedSlots()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth])

    // Группируем слоты по датам
    const slotsByDate = useMemo(() => {
        const map = new Map<string, BlockedSlot[]>()
        blockedSlots.forEach((slot) => {
            const date = slot.slot_date
            if (!map.has(date)) {
                map.set(date, [])
            }
            map.get(date)!.push(slot)
        })
        return map
    }, [blockedSlots])

    // Получаем все слоты дня (для определения полностью заблокированных дней)
    const getDaySlots = (date: Date) => {
        // Это упрощенная версия - в реальности нужно получать из настроек
        const slots: string[] = []
        for (let hour = 9; hour < 18; hour++) {
            slots.push(`${String(hour).padStart(2, '0')}:00`)
        }
        return slots
    }

    const handleBlockDay = async (date: string) => {
        if (!confirm(`Заблокировать весь день ${format(parseISO(date), 'd MMMM yyyy', { locale: ru })}?`)) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/admin/blocked-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot_date: date,
                    block_entire_day: true,
                    reason: reason || 'Весь день заблокирован',
                }),
            })

            if (res.ok) {
                setReason('')
                setShowForm(false)
                loadBlockedSlots()
            }
        } catch (error) {
            console.error('Failed to block day:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBlockSlot = async () => {
        if (!selectedDate || !selectedTime) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/admin/blocked-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slot_date: selectedDate,
                    slot_time: selectedTime,
                    reason: reason || null,
                }),
            })

            if (res.ok) {
                setSelectedDate(null)
                setSelectedTime(null)
                setReason('')
                setShowForm(false)
                loadBlockedSlots()
            }
        } catch (error) {
            console.error('Failed to block slot:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить эту блокировку?')) return

        try {
            const res = await fetch(`/api/admin/blocked-slots/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                loadBlockedSlots()
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">🚫 Блокировки</h1>
                            <p className="text-sm text-gray-600">Управление заблокированными днями и слотами</p>
                        </div>
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить блокировку
                        </Button>
                    </div>
                </div>

                {/* Форма блокировки */}
                {showForm && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle>Новая блокировка</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Дата *</label>
                                    <Input
                                        type="date"
                                        value={selectedDate || ''}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        min={format(today, 'yyyy-MM-dd')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Время</label>
                                    <Input
                                        type="time"
                                        value={selectedTime || ''}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        placeholder="Оставьте пустым для блокировки всего дня"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Оставьте пустым, чтобы заблокировать весь день
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Причина</label>
                                    <Input
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Причина блокировки (необязательно)"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setShowForm(false)} className="flex-1">
                                    Отмена
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (selectedTime) {
                                            handleBlockSlot()
                                        } else if (selectedDate) {
                                            handleBlockDay(selectedDate)
                                        }
                                    }}
                                    disabled={!selectedDate || isSubmitting}
                                    className="flex-1"
                                    size="lg"
                                >
                                    {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Календарь */}
                <Card className="booking-card">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
                                <Calendar className="w-5 h-5 text-primary-500 flex-shrink-0" />
                                <span className="truncate">Заблокированные дни</span>
                            </CardTitle>
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                                <div className="text-sm font-medium text-gray-700 capitalize">
                                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const newMonth = new Date(currentMonth)
                                            newMonth.setMonth(newMonth.getMonth() - 1)
                                            setCurrentMonth(newMonth)
                                        }}
                                        className="h-8 w-8 flex-shrink-0"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const newMonth = new Date(currentMonth)
                                            newMonth.setMonth(newMonth.getMonth() + 1)
                                            setCurrentMonth(newMonth)
                                        }}
                                        className="h-8 w-8 flex-shrink-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {/* Заголовки дней недели */}
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                                <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 pb-1 sm:pb-2">
                                    {day}
                                </div>
                            ))}
                            
                            {Array.from({ length: monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1 }).map(
                                (_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                )
                            )}

                            {monthDays.map((date) => {
                                const dateStr = format(date, 'yyyy-MM-dd')
                                const isPast = date < today
                                const daySlots = slotsByDate.get(dateStr) || []
                                const isFullyBlocked = daySlots.length > 0

                                return (
                                    <button
                                        key={date.toISOString()}
                                        type="button"
                                        onClick={() => {
                                            if (!isPast) {
                                                setSelectedDate(dateStr)
                                                setShowForm(true)
                                            }
                                        }}
                                        disabled={isPast}
                                        className={cn(
                                            'aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl border transition-all flex flex-col items-center justify-center',
                                            !isPast && 'hover:border-primary-300 hover:shadow-md cursor-pointer',
                                            isFullyBlocked && 'bg-red-50 border-red-200',
                                            !isFullyBlocked && !isPast && 'bg-white border-gray-200',
                                            isPast && 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <div className="text-center w-full">
                                            <div
                                                className={cn(
                                                    'text-sm sm:text-lg md:text-xl font-bold',
                                                    isFullyBlocked ? 'text-red-700' : isPast ? 'text-gray-400' : 'text-gray-900'
                                                )}
                                            >
                                                {format(date, 'd')}
                                            </div>
                                            {isFullyBlocked && (
                                                <div className="text-[9px] sm:text-xs text-red-600 mt-0.5 sm:mt-1 truncate">
                                                    {daySlots.length} сл
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Список заблокированных слотов */}
                <Card className="booking-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-primary-500" />
                            Заблокированные слоты
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4 py-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <Skeleton className="h-6 w-48" />
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {Array.from({ length: 6 }).map((_, j) => (
                                                <Skeleton key={j} className="h-16 rounded-lg" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : blockedSlots.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Нет заблокированных слотов</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Array.from(slotsByDate.entries())
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([date, slots]) => (
                                        <div key={date} className="booking-card p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-gray-900">
                                                    {format(parseISO(date), 'd MMMM yyyy', { locale: ru })}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        slots.forEach((slot) => handleDelete(slot.id))
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Удалить все
                                                </Button>
                                            </div>
                                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                {slots.map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {slot.slot_time}
                                                            </div>
                                                            {slot.reason && (
                                                                <div className="text-xs text-gray-500">{slot.reason}</div>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDelete(slot.id)}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

