'use client'

import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import {cn} from "@/lib/utils/cn";

interface RescheduleBookingModalProps {
    booking: Booking
    open: boolean
    onClose: () => void
}

export function RescheduleBookingModal({
                                           booking,
                                           open,
                                           onClose,
                                       }: RescheduleBookingModalProps) {
    const bookingId = booking.id
    const info = useRescheduleInfo(bookingId)
    const reschedule = useRescheduleBooking()

    const originalDate = String(booking.booking_date)
    const originalTime = String(booking.booking_time).slice(0, 5)

    const [selectedDate, setSelectedDate] = useState(originalDate)
    const [selectedTime, setSelectedTime] = useState(originalTime)
    const [localError, setLocalError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            setSelectedDate(originalDate)
            setSelectedTime(originalTime)
            setLocalError(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, bookingId])

    const minDate = info.data?.minRescheduleDate
    const slotsQuery = useAvailableSlotsForReschedule({
        date: selectedDate,
        originalDate,
        originalTime,
    })

    const availableSlots = slotsQuery.data ?? []

    const formattedCurrent = useMemo(() => {
        try {
            return `${format(
                parseISO(originalDate),
                'd MMMM yyyy',
                { locale: ru }
            )} ${originalTime}`
        } catch {
            return `${originalDate} ${originalTime}`
        }
    }, [originalDate, originalTime])

    const reasons = info.data?.reasons ?? null
    const warnings = info.data?.warnings ?? null
    const canReschedule = info.data?.canReschedule ?? true
    const isLoading = info.isLoading || slotsQuery.isLoading
    const canSubmit =
        !!selectedDate && !!selectedTime && !reschedule.isPending

    async function handleSubmit() {
        setLocalError(null)
        try {
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
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
            <DialogContent className="max-w-xl rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        Перенос записи
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Current */}
                    <div className="rounded-2xl bg-muted/40 p-4">
                        <div className="mb-1 text-xs text-muted-foreground">
                            Текущая запись
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formattedCurrent}
                        </div>
                    </div>

                    {/* API error */}
                    {info.isError && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {(info.error as any)?.message ||
                                'Не удалось проверить возможность переноса'}
                        </div>
                    )}

                    {/* Hard restrictions */}
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

                    {/* Warnings */}
                    {warnings?.length ? (
                        <div className="rounded-2xl border border-yellow-300/40 bg-yellow-100/60 p-4 text-sm text-yellow-900">
                            <div className="mb-1 font-semibold">
                                Обратите внимание
                            </div>
                            <ul className="list-disc space-y-1 pl-5">
                                {warnings.map((w) => (
                                    <li key={w}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {/* Date / time */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
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
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="h-4 w-4 text-primary" />
                                Новое время
                            </label>

                            <div className="min-h-[44px] rounded-xl border bg-background p-2">
                                {isLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Загрузка слотов…
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
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-muted hover:bg-muted/70'
                                                )}
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

                    {/* Local error */}
                    {localError && (
                        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            {localError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={onClose}
                            disabled={reschedule.isPending}
                        >
                            Отмена
                        </Button>
                        <Button
                            className="flex-1"
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
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
