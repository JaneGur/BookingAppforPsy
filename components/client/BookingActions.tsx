'use client'

import { useState, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { differenceInHours } from 'date-fns'
import { Loader2, Calendar, Clock } from 'lucide-react'
import { Booking } from '@/types/booking'
import { RescheduleBookingModal } from '@/components/client/RescheduleBookingModal'

/* =========================
   SimpleModal
========================= */

interface SimpleModalProps {
    title: string
    onClose: () => void
    onConfirm: () => void
    children: ReactNode
    isLoading?: boolean
}

const SimpleModal = ({
                         title,
                         onClose,
                         onConfirm,
                         children,
                         isLoading = false,
                     }: SimpleModalProps) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    if (!mounted) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>

                <div className="px-6 py-5 space-y-4">{children}</div>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Отмена
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Отмена...
                            </>
                        ) : (
                            'Подтвердить'
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

/* =========================
   BookingActions
========================= */

interface BookingActionsProps {
    booking: Booking
}

export function BookingActions({ booking }: BookingActionsProps) {
    const router = useRouter()

    const [mounted, setMounted] = useState(false)
    const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [isCancelModalOpen, setCancelModalOpen] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [optimisticStatus, setOptimisticStatus] = useState<Booking['status'] | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    const bookingDateTime = new Date(
        `${booking.booking_date}T${booking.booking_time}`
    )

    const hoursUntilBooking = Math.max(
        0,
        differenceInHours(bookingDateTime, new Date())
    )

    const canModify = hoursUntilBooking >= 24

    const handleReschedule = () => {
        // Открываем полноценное модальное окно переноса (с выбором даты/времени)
        setRescheduleModalOpen(true)
    }

    const handleCancel = async () => {
        setIsCancelling(true)
        setError(null)

        setOptimisticStatus('cancelled')
        setCancelModalOpen(false)

        try {
            const res = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            })

            if (!res.ok) throw new Error('Не удалось отменить запись')

            router.refresh()

        } catch (err) {
            setOptimisticStatus(null)
            setError(err instanceof Error ? err.message : 'Ошибка')

            alert('Не удалось отменить запись. Пожалуйста, попробуйте еще раз.')

        } finally {
            setIsCancelling(false)
        }
    }

    // Если запись уже отменена
    if (optimisticStatus === 'cancelled' || booking.status === 'cancelled') {
        return (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm font-medium text-red-600">
                    ❌ Запись отменена
                </span>
            </div>
        )
    }

    if (!canModify) {
        return (
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <p className="font-medium">Изменение невозможно</p>
                <p className="text-xs mt-0.5">До начала консультации менее 24 часов</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    onClick={() => setRescheduleModalOpen(true)}
                    disabled={isCancelling}
                    className="px-4 py-2.5 text-sm font-medium text-teal-700 hover:text-teal-800 disabled:opacity-50 hover:bg-teal-50 rounded-lg border border-teal-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Calendar size={16} className="text-teal-600" />
                    Перенести
                </button>

                <button
                    onClick={() => setCancelModalOpen(true)}
                    disabled={isCancelling}
                    className="px-4 py-2.5 text-sm font-medium text-red-700 hover:text-red-800 disabled:opacity-50 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-2"
                >
                    {isCancelling ? (
                        <Loader2 size={16} className="animate-spin text-red-600" />
                    ) : (
                        <span className="text-red-600">✕</span>
                    )}
                    Отменить
                </button>
            </div>

            {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            {isRescheduleModalOpen && mounted && createPortal(
                <RescheduleBookingModal
                    booking={booking}
                    open={isRescheduleModalOpen}
                    onClose={() => {
                        setRescheduleModalOpen(false)
                        // после переноса обновляем текущую страницу
                        router.refresh()
                    }}
                    onSuccess={(updated) => {
                        // оптимистично обновляем текущую карточку, если родитель использует данные напрямую
                        if (booking.id === updated.id) {
                            booking.booking_date = updated.booking_date
                            booking.booking_time = updated.booking_time
                        }
                    }}
                />,
                document.body
            )}

            {isCancelModalOpen && (
                <SimpleModal
                    title="Отмена записи"
                    onClose={() => setCancelModalOpen(false)}
                    onConfirm={handleCancel}
                    isLoading={isCancelling}
                >
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-3">Текущая запись</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span>{new Date(booking.booking_date).toLocaleDateString('ru-RU', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Clock size={16} className="text-gray-500" />
                                    <span>{booking.booking_time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <div className="flex items-start gap-2">
                                <Clock size={18} className="text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-800">
                                        До консультации {hoursUntilBooking} {hoursUntilBooking === 1 ? 'час' : hoursUntilBooking < 5 ? 'часа' : 'часов'}
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Отмена возможна не позднее, чем за 24 часа до начала
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-start gap-2">
                                <span className="text-red-600">⚠️</span>
                                <div>
                                    <p className="font-medium text-red-800">Это действие необратимо</p>
                                    <p className="text-sm text-red-700 mt-1">
                                        После отмены запись нельзя будет восстановить.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </SimpleModal>
            )}
        </>
    )
}