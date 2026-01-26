'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
    Send,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { cn } from "@/lib/utils/cn"
import { formatTimeSlot } from '@/lib/utils/date'


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
            <DialogContent className="max-w-xl rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Перенос записи
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current booking */}
                    <div className="rounded-2xl bg-muted/40 p-4">
                        <div className="text-xs text-muted-foreground mb-1">
                            Текущая запись
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formattedCurrent}
                        </div>
                    </div>

                    {/* Restrictions */}
                    {reasons?.length ? (
                        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                            <div className="mb-2 flex items-center gap-2 font-semibold text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                Перенос недоступен
                            </div>
                            <ul className="list-disc space-y-1 pl-5 text-destructive">
                                {reasons.map((r) => (
                                    <li key={r}>{r}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {/* Date & time */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                Новая дата
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                min={minDate ?? undefined}
                                disabled={!canReschedule}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="h-11 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                Новое время
                            </label>

                            <div className="min-h-[44px] rounded-xl border bg-background p-2">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Загрузка слотов…
                                    </div>
                                ) : slotsQuery.isError ? (
                                    <div className="text-sm text-destructive">
                                        {(slotsQuery.error as Error)?.message || 'Не удалось загрузить слоты'}
                                    </div>
                                ) : availableSlots.length ? (
                                    <div className="flex flex-wrap gap-2">
                                        {availableSlots.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                disabled={!canReschedule}
                                                onClick={() =>
                                                    setSelectedTime(t)
                                                }
                                                className={cn(
                                                    'rounded-lg px-3 py-2 text-sm font-medium transition',
                                                    t === selectedTime
                                                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/40 shadow'
                                                        : 'bg-muted hover:bg-muted/70'
                                                )}
                                                aria-pressed={t === selectedTime}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Нет доступных слотов
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Комментарий
                        </label>
                        <Input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Причина переноса (опционально)"
                        />
                    </div>

                    {/* Notify */}
                    <label className="flex items-center gap-3 rounded-xl border p-3 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sendClientTelegram}
                            onChange={(e) =>
                                setSendClientTelegram(e.target.checked)
                            }
                        />
                        <Send className="h-4 w-4 text-primary" />
                        Уведомить клиента в Telegram
                    </label>

                    {/* Error */}
                    {localError && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {localError}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-6 gap-2">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={reschedule.isPending}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || !canReschedule}
                    >
                        {reschedule.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Перенос…
                            </>
                        ) : (
                            'Перенести'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}