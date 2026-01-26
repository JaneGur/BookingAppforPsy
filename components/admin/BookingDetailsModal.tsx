'use client'

import { useState } from 'react'
import {
    X, Calendar, Clock, User, Phone, Mail, MessageSquare, DollarSign,
    FileText, CheckCircle, XCircle, Edit, Trash2, Ban
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Booking } from '@/types/booking'
import { cn } from '@/lib/utils/cn'
import { formatDateRu, formatTimeSlot } from '@/lib/utils/date'
import {format, parseISO} from "date-fns";
import {ru} from "date-fns/locale";

interface BookingDetailsModalProps {
    booking: Booking | null
    open: boolean
    onClose: () => void
    onEdit?: (booking: Booking) => void
    onDelete?: (id: number) => void
    onCancel?: (id: number) => void  // ← ДОБАВЬТЕ ЭТО
    onReschedule?: (booking: Booking) => void
    onStatusChange?: (id: number, status: Booking['status']) => void
}

function StatusBadge({ status }: { status: Booking['status'] }) {
    const base = 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md'
    const map: Record<Booking['status'], { label: string; className: string; icon: string }> = {
        pending_payment: { label: 'Ожидает оплаты', className: 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800 border-2 border-yellow-300', icon: '⏳' },
        confirmed: { label: 'Подтверждена', className: 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border-2 border-green-300', icon: '✓' },
        completed: { label: 'Завершена', className: 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border-2 border-emerald-300', icon: '✓' },
        cancelled: { label: 'Отменена', className: 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 border-2 border-red-300', icon: '✕' },
    }
    const item = map[status]
    return <span className={cn(base, item.className)}><span className="text-lg">{item.icon}</span> {item.label}</span>
}

export function BookingDetailsModal({
                                        booking,
                                        onClose,
                                        onEdit,
                                        onDelete,
                                        onCancel,  // ← ДОБАВЬТЕ ЭТО
                                        onReschedule,
                                        onStatusChange
                                    }: BookingDetailsModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false) // ← ДОБАВЬТЕ ЭТО
    const [isChangingStatus, setIsChangingStatus] = useState(false)

    if (!booking) return null

    const handleDelete = async () => {
        if (!confirm('Полностью удалить эту запись из базы данных? Это действие необратимо.')) return
        setIsDeleting(true)
        try {
            await onDelete?.(booking.id)
            onClose()
        } finally {
            setIsDeleting(false)
        }
    }

    // ← ДОБАВЬТЕ ЭТУ ФУНКЦИЮ
    const handleCancelBooking = async () => {
        if (!confirm('Отменить эту запись? Запись будет помечена как отмененная, но останется в истории.')) return
        setIsCancelling(true)
        try {
            await onCancel?.(booking.id)
            onClose()
        } finally {
            setIsCancelling(false)
        }
    }

    const handleStatusChange = async (newStatus: Booking['status']) => {
        if (!confirm(`Изменить статус на "${newStatus}"?`)) return
        setIsChangingStatus(true)
        try {
            await onStatusChange?.(booking.id, newStatus)
            onClose()
        } finally {
            setIsChangingStatus(false)
        }
    }

    return (
        <Dialog open={!!booking} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                        Детали записи #{booking.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Статус */}
                    <div className="flex items-center justify-between">
                        <StatusBadge status={booking.status} />
                        <div className="text-sm text-gray-500">
                            Создано: {booking.created_at && format(parseISO(booking.created_at), 'd MMM yyyy, HH:mm', { locale: ru })}
                        </div>
                    </div>

                    {/* Дата и время */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="booking-card p-4 border-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-600">Дата</div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {formatDateRu(booking.booking_date)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="booking-card p-4 border-2">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                    <Clock className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-gray-600">Время</div>
                                    <div className="text-lg font-bold text-gray-900">{formatTimeSlot(booking.booking_time)}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Информация о клиенте */}
                    <div className="booking-card p-5 border-2 space-y-3">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary-600" />
                            Информация о клиенте
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-700">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{booking.client_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{booking.client_phone}</span>
                            </div>
                            {booking.client_email && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span>{booking.client_email}</span>
                                </div>
                            )}
                            {booking.client_telegram && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <MessageSquare className="h-4 w-4 text-gray-400" />
                                    <span>{booking.client_telegram}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Сумма */}
                    <div className="booking-card p-5 border-2 bg-gradient-to-br from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Сумма</div>
                                    <div className="text-2xl font-bold text-green-700">
                                        {(booking.amount || 0).toLocaleString('ru-RU')} ₽
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Примечания */}
                    {booking.notes && (
                        <div className="booking-card p-5 border-2">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
                                <FileText className="h-5 w-5 text-primary-600" />
                                Примечания
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{booking.notes}</p>
                        </div>
                    )}

                    {/* Быстрые действия */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-900">Быстрые действия</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <Button
                                    onClick={() => onReschedule?.(booking)}
                                    variant="secondary"
                                    title="Перенести дату/время записи"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Перенести
                                </Button>
                            )}
                            {booking.status === 'pending_payment' && (
                                <Button
                                    onClick={() => handleStatusChange('confirmed')}
                                    disabled={isChangingStatus}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Подтвердить оплату
                                </Button>
                            )}
                            {booking.status === 'confirmed' && (
                                <Button
                                    onClick={() => handleStatusChange('completed')}
                                    disabled={isChangingStatus}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Завершить
                                </Button>
                            )}
                            {/* ← ИЗМЕНИТЕ ЭТУ КНОПКУ */}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                                <>
                                    {/* Кнопка отмены через специальный endpoint */}
                                    <Button
                                        onClick={handleCancelBooking}
                                        disabled={isCancelling}
                                        variant="secondary"
                                        title="Отменить запись (остается в истории)"
                                    >
                                        <Ban className="h-4 w-4 mr-2" />
                                        {isCancelling ? 'Отмена...' : 'Отменить'}
                                    </Button>
                                    {/* Кнопка изменения статуса на cancelled через onStatusChange */}
                                    {/*<Button*/}
                                    {/*    onClick={() => handleStatusChange('cancelled')}*/}
                                    {/*    disabled={isChangingStatus}*/}
                                    {/*    variant="secondary"*/}
                                    {/*    title="Изменить статус на 'отменено'"*/}
                                    {/*>*/}
                                    {/*    <XCircle className="h-4 w-4 mr-2" />*/}
                                    {/*    {isChangingStatus ? 'Изменение...' : 'Отменить (статус)'}*/}
                                    {/*</Button>*/}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-0 border-t-2 border-gray-100">
                    <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                            {onEdit && (
                                <Button variant="ghost" onClick={() => onEdit(booking)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Редактировать
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-red-600 hover:bg-red-50"
                                    title="Полностью удалить запись из базы"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {isDeleting ? 'Удаление...' : 'Удалить'}
                                </Button>
                            )}
                        </div>
                        <Button variant="secondary" onClick={onClose}>
                            Закрыть
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}