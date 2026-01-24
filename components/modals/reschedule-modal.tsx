// components/modals/reschedule-modal.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Booking } from '@/types/booking'
import {
    useAvailableSlotsForReschedule,
    useRescheduleBooking,
    useRescheduleInfo,
} from '@/lib/hooks'
import {
    Calendar,
    Clock,
    Loader2,
    AlertTriangle,
    ArrowRightLeft,
    Sparkles,
    CalendarDays,
    Zap,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import { format, parseISO, isBefore, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'

interface RescheduleModalProps {
    booking: Booking
    open: boolean
    onClose: () => void
}

function RescheduleModalContent({ booking, open, onClose }: RescheduleModalProps) {
    const bookingId = booking.id
    const info = useRescheduleInfo(bookingId)
    const reschedule = useRescheduleBooking()

    const originalDate = String(booking.booking_date)
    const originalTime = String(booking.booking_time).slice(0, 5)

    const [selectedDate, setSelectedDate] = useState(originalDate)
    const [selectedTime, setSelectedTime] = useState(originalTime)
    const [localError, setLocalError] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (open) {
            setSelectedDate(originalDate)
            setSelectedTime(originalTime)
            setLocalError(null)
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 500)
        }
    }, [open, originalDate, originalTime])

    const minDate = info.data?.minRescheduleDate
    const slotsQuery = useAvailableSlotsForReschedule({
        date: selectedDate,
        originalDate,
        originalTime,
    })

    const availableSlots = slotsQuery.data ?? []

    const formattedCurrent = useMemo(() => {
        try {
            const date = parseISO(originalDate)
            return {
                date: format(date, 'd MMMM yyyy', { locale: ru }),
                day: format(date, 'EEEE', { locale: ru }),
                time: originalTime,
                fullDateTime: `${format(date, 'd MMMM yyyy', { locale: ru })} в ${originalTime}`,
                isToday: isBefore(date, addDays(new Date(), 1)) && !isBefore(date, new Date())
            }
        } catch {
            return null
        }
    }, [originalDate, originalTime])

    const formattedSelectedDate = useMemo(() => {
        if (!selectedDate) return null
        try {
            const date = parseISO(selectedDate)
            return {
                date: format(date, 'd MMMM yyyy', { locale: ru }),
                day: format(date, 'EEEE', { locale: ru }),
                fullDate: format(date, 'd MMMM yyyy', { locale: ru }),
                isFuture: isBefore(new Date(), date)
            }
        } catch {
            return null
        }
    }, [selectedDate])

    const reasons = info.data?.reasons ?? null
    const warnings = info.data?.warnings ?? null
    const canReschedule = info.data?.canReschedule ?? true
    const isLoading = info.isLoading || slotsQuery.isLoading
    const canSubmit = !!selectedDate && !!selectedTime && !reschedule.isPending

    const handleSubmit = async () => {
        setLocalError(null)
        try {
            setIsAnimating(true)
            const resp = await reschedule.mutateAsync({
                bookingId,
                newDate: selectedDate,
                newTime: selectedTime,
            })
            if (resp?.success) onClose()
        } catch (e) {
            setLocalError(
                e instanceof Error ? e.message : 'Не удалось перенести запись'
            )
        } finally {
            setIsAnimating(false)
        }
    }

    const isDateChanged = selectedDate !== originalDate
    const isTimeChanged = selectedTime !== originalTime

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
            <DialogContent className="max-w-3xl overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-50/30" />
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-r from-primary/15 to-blue-300/15 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-r from-cyan-300/15 to-blue-300/15 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                >
                    <DialogHeader className="relative border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-2.5 shadow-lg">
                                <ArrowRightLeft className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    Перенос записи
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    ID: {booking.id} • {booking.client_name || 'Клиент'}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6">
                        <AnimatePresence>
                            {isAnimating && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-3xl"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative">
                                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 animate-pulse text-yellow-500" />
                                        </div>
                                        <p className="text-sm font-medium">Обработка переноса...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-6">
                            {/* Timeline comparison */}
                            <div className="relative mb-8">
                                <motion.div
                                    animate={{ x: [0, 8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary to-blue-500 p-3 shadow-xl"
                                >
                                    <ArrowRightLeft className="h-5 w-5 text-white" />
                                </motion.div>

                                <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

                                <div className="grid grid-cols-2 gap-8">
                                    {/* Current booking */}
                                    <div className="relative">
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="h-full rounded-2xl border-2 border-border/50 bg-gradient-to-br from-background to-muted/20 p-5 shadow-lg"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-red-50 p-2">
                                                        <CalendarDays className="h-5 w-5 text-red-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-red-600">
                                                            Текущая запись
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Будет освобождена
                                                        </div>
                                                    </div>
                                                </div>
                                                {formattedCurrent?.isToday && (
                                                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            Сегодня
                          </span>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-2xl font-bold">{formattedCurrent?.time}</div>
                                                    <div className="text-sm text-muted-foreground">часов</div>
                                                </div>

                                                <div className="rounded-xl bg-gradient-to-r from-red-50/50 to-red-50/30 p-3">
                                                    <div className="text-sm font-medium text-red-800">
                                                        {formattedCurrent?.fullDateTime}
                                                    </div>
                                                    <div className="mt-1 text-xs text-red-600">
                                                        {formattedCurrent?.day}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 rounded-lg bg-gradient-to-r from-red-100/50 to-red-50/50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                    <div className="text-sm font-semibold text-red-700">
                                                        Этот слот станет свободным
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* New booking */}
                                    <div className="relative">
                                        <motion.div
                                            initial={{ x: 20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className={cn(
                                                "h-full rounded-2xl border-2 p-5 shadow-lg transition-all duration-300",
                                                (isDateChanged || isTimeChanged)
                                                    ? "border-primary/40 bg-gradient-to-br from-primary/5 to-blue-50/20"
                                                    : "border-border/40 bg-gradient-to-br from-background to-muted/20"
                                            )}
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="rounded-lg bg-gradient-to-r from-primary/10 to-blue-100 p-2">
                                                        <Zap className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                                                            Новая запись
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {isDateChanged || isTimeChanged ? 'Выбрано' : 'Выберите время'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {formattedSelectedDate?.isFuture && (
                                                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                            Будущее
                          </span>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-baseline gap-2">
                                                    <div className={cn(
                                                        "text-2xl font-bold",
                                                        selectedTime ? "text-primary" : "text-muted-foreground"
                                                    )}>
                                                        {selectedTime || "— : —"}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">часов</div>
                                                </div>

                                                <div className={cn(
                                                    "rounded-xl p-3",
                                                    isDateChanged
                                                        ? "bg-gradient-to-r from-primary/10 to-blue-50/30"
                                                        : "bg-gradient-to-r from-muted/30 to-muted/20"
                                                )}>
                                                    <div className={cn(
                                                        "text-sm font-medium",
                                                        isDateChanged ? "text-primary" : "text-muted-foreground"
                                                    )}>
                                                        {formattedSelectedDate?.fullDate || "Выберите дату"}
                                                    </div>
                                                    {formattedSelectedDate && (
                                                        <div className="mt-1 text-xs text-primary">
                                                            {formattedSelectedDate.day}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {(isDateChanged || isTimeChanged) && (
                                                <motion.div
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="mt-4 rounded-lg bg-gradient-to-r from-green-100/50 to-green-50/50 p-3"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <div className="text-sm font-semibold text-green-700">
                                                            Этот слот будет занят
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    </div>
                                </div>
                            </div>

                            {/* Ограничения и предупреждения */}
                            <div className="space-y-4">
                                {/* API error */}
                                {info.isError && (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-destructive" />
                                            <div>
                                                <div className="font-medium text-destructive">
                                                    Ошибка проверки
                                                </div>
                                                <div className="text-sm text-destructive/70">
                                                    {(info.error as any)?.message ||
                                                        'Не удалось проверить возможность переноса'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Hard restrictions */}
                                {reasons?.length ? (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-4"
                                    >
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-destructive/20 p-2">
                                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-destructive">
                                                    Перенос невозможен
                                                </div>
                                                <div className="text-sm text-destructive/70">
                                                    Обнаружены ограничения
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            {reasons.map((r, i) => (
                                                <motion.li
                                                    key={r}
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-destructive" />
                                                    <span className="text-destructive">{r}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ) : null}

                                {/* Warnings */}
                                {warnings?.length ? (
                                    <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                        className="rounded-xl border border-yellow-300/40 bg-gradient-to-br from-yellow-100/40 to-yellow-50/30 p-4"
                                    >
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="rounded-lg bg-yellow-200/60 p-2">
                                                <AlertTriangle className="h-5 w-5 text-yellow-700" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-yellow-800">
                                                    Рекомендации
                                                </div>
                                                <div className="text-sm text-yellow-700/70">
                                                    Для лучшего результата
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            {warnings.map((w, i) => (
                                                <motion.li
                                                    key={w}
                                                    initial={{ x: -10, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <div className="mt-1.5 h-2 w-2 rounded-full bg-yellow-500" />
                                                    <span className="text-yellow-800">{w}</span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ) : null}
                            </div>

                            {/* Выбор даты и времени */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Date selector */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Выберите новую дату
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            min={minDate ?? undefined}
                                            disabled={!canReschedule}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="h-12 w-full rounded-xl border-2 border-border bg-background/50 px-4 text-sm font-medium backdrop-blur-sm transition-all hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50"
                                        />
                                        {formattedSelectedDate && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 flex items-center gap-2"
                                            >
                                                <div className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                                                    {formattedSelectedDate.day}
                                                </div>
                                                <span className="text-sm font-medium">{formattedSelectedDate.date}</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                {/* Time slots */}
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Выберите время
                                    </label>
                                    <div className="rounded-xl border-2 border-border bg-background/50 p-3 backdrop-blur-sm">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center justify-center py-6">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                                <p className="text-sm text-muted-foreground">Загрузка доступного времени...</p>
                                            </div>
                                        ) : availableSlots.length ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {availableSlots.map((time, idx) => {
                                                    const [hour] = time.split(':')
                                                    const isMorning = parseInt(hour) < 12
                                                    const isEvening = parseInt(hour) >= 18

                                                    return (
                                                        <motion.button
                                                            key={time}
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: idx * 0.03 }}
                                                            type="button"
                                                            disabled={!canReschedule}
                                                            onClick={() => setSelectedTime(time)}
                                                            className={cn(
                                                                "relative h-12 rounded-xl border-2 font-medium transition-all duration-300",
                                                                time === selectedTime
                                                                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                                    : "border-border bg-background hover:border-primary/40 hover:shadow-md",
                                                                isMorning && "hover:bg-blue-50/50",
                                                                isEvening && "hover:bg-purple-50/50",
                                                                "disabled:opacity-50 disabled:cursor-not-allowed"
                                                            )}
                                                        >
                                                            {time}
                                                            {time === selectedTime && (
                                                                <motion.div
                                                                    layoutId="timeIndicator"
                                                                    className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-primary to-blue-500"
                                                                />
                                                            )}
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                                <p className="text-sm font-medium text-muted-foreground">Нет доступных слотов</p>
                                                <p className="text-xs text-muted-foreground/60 mt-1">Выберите другую дату</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Local error */}
                            {localError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-destructive/10 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        <div>
                                            <div className="font-medium text-destructive">Ошибка переноса</div>
                                            <div className="text-sm text-destructive/70">{localError}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex gap-3">
                            <Button
                                variant="ghost"
                                className="h-12 flex-1 rounded-xl border-2 border-border hover:bg-muted"
                                onClick={onClose}
                                disabled={reschedule.isPending}
                            >
                                Отмена
                            </Button>
                            <Button
                                className={cn(
                                    "h-12 flex-1 rounded-xl text-white shadow-md transition-all duration-300",
                                    canSubmit && !reschedule.isPending && canReschedule
                                        ? "bg-gradient-to-r from-primary via-primary/90 to-primary hover:shadow-lg hover:shadow-primary/25"
                                        : "bg-muted"
                                )}
                                onClick={handleSubmit}
                                disabled={!canSubmit || !canReschedule}
                            >
                                {reschedule.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Обработка...
                                    </>
                                ) : (
                                    'Подтвердить перенос'
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    )
}

export function RescheduleModalPortal({ booking, open, onClose }: RescheduleModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <RescheduleModalContent booking={booking} open={open} onClose={onClose} />,
        document.body
    )
}