'use client'

import {useEffect, useMemo, useState} from 'react'
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Booking} from '@/types/booking'
import {useAvailableSlotsForReschedule, useRescheduleBooking, useRescheduleInfo,} from '@/lib/hooks'
import {AlertTriangle, Calendar, CalendarDays, ChevronRight, Clock, Loader2, MessageSquare, Send,} from 'lucide-react'
import {format, parseISO} from 'date-fns'
import {ru} from 'date-fns/locale'
import {cn} from "@/lib/utils/cn"
import {formatTimeSlot} from '@/lib/utils/date'

interface RescheduleBookingModalProps {
    booking: Booking | null
    open: boolean
    onClose: () => void
    onSuccess?: (booking: Booking) => void
}

export function RescheduleBookingModal({
                                           booking,
                                           open,
                                           onClose,
                                           onSuccess,
                                       }: RescheduleBookingModalProps) {
    const bookingId = booking?.id
    const info = useRescheduleInfo(bookingId)
    const reschedule = useRescheduleBooking()

    const originalDate = booking ? String(booking.booking_date) : ''
    const originalTime = booking ? formatTimeSlot(String(booking.booking_time)) : ''

    const [selectedDate, setSelectedDate] = useState(originalDate)
    const [selectedTime, setSelectedTime] = useState(originalTime)
    const [note, setNote] = useState('')
    const [sendClientTelegram, setSendClientTelegram] = useState(true)
    const [localError, setLocalError] = useState<string | null>(null)

    useEffect(() => {
        if (open && booking) {
            setSelectedDate(String(booking.booking_date))
            setSelectedTime(formatTimeSlot(String(booking.booking_time)))
            setNote('')
            setSendClientTelegram(true)
            setLocalError(null)
        }
    }, [open, booking])

    const minDate = info.data?.minRescheduleDate
    const slotsQuery = useAvailableSlotsForReschedule({
        date: selectedDate,
        originalDate,
        originalTime,
    })

    const availableSlots = slotsQuery.data ?? []

    useEffect(() => {
        if (selectedDate && selectedDate !== originalDate) {
            setSelectedTime('')
        }
    }, [selectedDate, originalDate])

    useEffect(() => {
        if (!availableSlots.length) return
        if (!selectedTime || !availableSlots.includes(selectedTime)) {
            setSelectedTime(availableSlots[0])
        }
    }, [availableSlots, selectedTime])

    const formattedCurrent = useMemo(() => {
        if (!booking) return ''
        try {
            return `${format(
                parseISO(String(booking.booking_date)),
                'd MMMM yyyy',
                { locale: ru }
            )} ${originalTime}`
        } catch {
            return `${booking.booking_date} ${booking.booking_time}`
        }
    }, [booking])

    const canReschedule = info.data?.canReschedule ?? true
    const isLoading = info.isLoading || slotsQuery.isLoading
    const canSubmit =
        !!bookingId &&
        !!selectedDate &&
        !!selectedTime &&
        !reschedule.isPending

    async function handleSubmit() {
        if (!bookingId) return
        setLocalError(null)

        try {
            const resp = await reschedule.mutateAsync({
                bookingId,
                newDate: selectedDate,
                newTime: selectedTime,
                reason: note || null,
                notifyTelegram: sendClientTelegram,
            })
            if (resp?.booking) {
                onSuccess?.(resp.booking)
            }
            onClose()
        } catch (e) {
            setLocalError(
                e instanceof Error ? e.message : 'Не удалось перенести запись'
            )
        }
    }

    const reasons = info.data?.reasons ?? null
    if (!booking) return null

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
            <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-primary-foreground">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <CalendarDays className="h-6 w-6" />
                            </div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">
                                Перенос записи
                            </DialogTitle>
                        </div>
                        <p className="text-primary-foreground/80 text-sm">
                            Выберите новую дату и время для записи клиента
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Current booking card */}
                    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Текущая запись
                                </div>
                                <div className="text-lg font-semibold">
                                    {formattedCurrent}
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                    <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                                    <span>Перенос на новую дату ниже</span>
                                    <ChevronRight className="h-3 w-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Restrictions warning */}
                    {reasons?.length ? (
                        <div className="rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent p-5">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-destructive/20 rounded-xl">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-destructive mb-2">
                                        Перенос недоступен
                                    </div>
                                    <ul className="space-y-2">
                                        {reasons.map((r) => (
                                            <li key={r} className="flex items-start gap-2 text-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5"></div>
                                                <span>{r}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Date & time selection */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Date selection */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="h-4 w-4 text-primary" />
                                </div>
                                <label className="text-sm font-semibold">
                                    Выберите дату
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={minDate ?? undefined}
                                    disabled={!canReschedule}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full h-12 rounded-xl border-2 border-border bg-background px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Time selection */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <label className="text-sm font-semibold">
                                    Выберите время
                                </label>
                            </div>

                            <div className="min-h-[48px] rounded-xl border-2 border-border bg-background p-2.5">
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Загрузка доступных слотов...</span>
                                    </div>
                                ) : slotsQuery.isError ? (
                                    <div className="text-center py-2 text-sm text-destructive">
                                        Ошибка загрузки слотов
                                    </div>
                                ) : availableSlots.length ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {availableSlots.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                disabled={!canReschedule}
                                                onClick={() => setSelectedTime(t)}
                                                className={cn(
                                                    'rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    'focus:outline-none focus:ring-2 focus:ring-primary/40',
                                                    t === selectedTime
                                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105'
                                                        : 'bg-muted hover:bg-muted/80 hover:scale-[1.02] active:scale-95'
                                                )}
                                                aria-pressed={t === selectedTime}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-3 text-sm text-muted-foreground">
                                        Нет доступных слотов на выбранную дату
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comment section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <label className="text-sm font-semibold">
                                Причина переноса (опционально)
                            </label>
                        </div>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Напишите причину переноса для клиента..."
                            className="w-full min-h-[100px] rounded-xl border-2 border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Telegram notification toggle */}
                    <div className={cn(
                        "rounded-2xl border-2 p-4 transition-all duration-200",
                        sendClientTelegram
                            ? "border-primary/30 bg-primary/5"
                            : "border-border hover:border-primary/20"
                    )}>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={sendClientTelegram}
                                    onChange={(e) => setSendClientTelegram(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className={cn(
                                    "h-6 w-11 rounded-full transition-all duration-200",
                                    "peer-checked:bg-primary bg-muted"
                                )}>
                                    <div className={cn(
                                        "h-5 w-5 rounded-full bg-white shadow-lg transition-all duration-200",
                                        "transform translate-x-0.5 translate-y-0.5",
                                        sendClientTelegram && "translate-x-5"
                                    )} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Send className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                    Уведомить клиента в Telegram
                                </span>
                            </div>
                        </label>
                        <p className="text-xs text-muted-foreground mt-2 ml-14">
                            Клиент получит автоматическое уведомление о переносе записи
                        </p>
                    </div>

                    {/* Error message */}
                    {localError && (
                        <div className="rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent p-4">
                            <div className="flex items-center gap-2 text-destructive font-medium mb-1">
                                <AlertTriangle className="h-4 w-4" />
                                Ошибка
                            </div>
                            <p className="text-sm">{localError}</p>
                        </div>
                    )}
                </div>

                {/* Footer with actions */}
                <DialogFooter className="px-6 md:px-8 py-5 bg-muted/30 border-t gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={reschedule.isPending}
                        className="flex-1 sm:flex-none px-6 rounded-xl border"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || !canReschedule}
                        className={cn(
                            "flex-1 sm:flex-none px-8 rounded-xl",
                            "bg-gradient-to-r from-primary to-primary/90",
                            "hover:from-primary/90 hover:to-primary",
                            "shadow-lg shadow-primary/20",
                            "transition-all duration-200",
                            "hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]",
                            "active:scale-95"
                        )}
                    >
                        {reschedule.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Перенос...
                            </>
                        ) : (
                            <>
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Перенести запись
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}