'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { differenceInHours } from 'date-fns'
import { Booking } from '@/types/booking'
import { Loader2 } from 'lucide-react'

interface BookingActionsProps {
    booking: Booking
}

import { ReactNode } from 'react'

interface SimpleModalProps {
    title: string;
    onClose: () => void;
    onConfirm: () => void;
    children: ReactNode;
}

// TODO: Заменить этот компонент на полноценную UI-библиотеку (Shadcn, Headless UI)
const SimpleModal = ({ title, onClose, onConfirm, children }: SimpleModalProps) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">{title}</h3>
            <div className="mb-6">{children}</div>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium rounded-md border"
                >
                    Отмена
                </button>
                <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                    Подтвердить
                </button>
            </div>
        </div>
    </div>
)


export function BookingActions({ booking }: BookingActionsProps) {
    const router = useRouter()
    const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false)
    const [isCancelModalOpen, setCancelModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const canModify = () => {
        const now = new Date()
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`)
        return differenceInHours(bookingDateTime, now) >= 24
    }

    const handleReschedule = async () => {
        setIsLoading(true)
        setError(null)
        // Логика переноса пока не реализована, т.к. требует UI для выбора новой даты/времени.
        // Пока просто показываем alert.
        alert('Перенаправление на страницу выбора нового времени...')
        setIsLoading(false)
        setRescheduleModalOpen(false)
        // router.push(`/booking/reschedule?bookingId=${booking.id}`)
    }

    const handleCancel = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            })
            if (!res.ok) {
                throw new Error('Не удалось отменить запись')
            }
            // Обновляем страницу, чтобы увидеть изменения
            router.refresh()
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Произошла неизвестная ошибка')
            }
        } finally {
            setIsLoading(false)
            setCancelModalOpen(false)
        }
    }

    const hoursUntilBooking = canModify() 
        ? Math.floor(differenceInHours(new Date(`${booking.booking_date}T${booking.booking_time}`), new Date()))
        : 0

    if (!canModify()) {
        return (
            <div className="text-sm text-gray-500">
                <p>Перенос и отмена возможны не позднее, чем за 24 часа до консультации</p>
                <p className="text-xs mt-1">До начала консультации осталось менее 24 часов</p>
            </div>
        )
    }

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => setRescheduleModalOpen(true)}
                    disabled={isLoading}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 disabled:opacity-50"
                >
                    Перенести
                </button>
                <button
                    onClick={() => setCancelModalOpen(true)}
                    disabled={isLoading}
                    className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Отменить'}
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {isRescheduleModalOpen && (
                <SimpleModal
                    title="Перенос записи"
                    onClose={() => setRescheduleModalOpen(false)}
                    onConfirm={handleReschedule}
                >
                    <p className="mb-2">Вы можете перенести запись на другое время.</p>
                    <p className="text-sm text-gray-600">
                        Перенос возможен не позднее, чем за 24 часа до текущей записи. 
                        До начала консультации осталось: {hoursUntilBooking} {hoursUntilBooking === 1 ? 'час' : hoursUntilBooking < 5 ? 'часа' : 'часов'}.
                    </p>
                </SimpleModal>
            )}

            {isCancelModalOpen && (
                <SimpleModal
                    title="Отмена записи"
                    onClose={() => setCancelModalOpen(false)}
                    onConfirm={handleCancel}
                >
                    <p className="mb-2">Вы уверены, что хотите отменить эту запись?</p>
                    <p className="text-sm text-gray-600 mb-2">
                        Отмена возможна не позднее, чем за 24 часа до консультации. 
                        До начала консультации осталось: {hoursUntilBooking} {hoursUntilBooking === 1 ? 'час' : hoursUntilBooking < 5 ? 'часа' : 'часов'}.
                    </p>
                    <p className="text-sm text-red-600 font-medium">Это действие необратимо.</p>
                </SimpleModal>
            )}
        </>
    )
}