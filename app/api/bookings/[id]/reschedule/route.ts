import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

function toDateStringMsk(date: Date) {
    const msk = new Date(date.getTime() + 3 * 60 * 60 * 1000)
    return msk.toISOString().slice(0, 10)
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const bookingId = Number(id)
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
        }

        // Получаем запись бронирования
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
        }

        // Проверяем права доступа
        const isAdmin = session.user.role === 'admin'
        const isClient = session.user.role === 'client' && booking.client_id === session.user.id

        if (!isAdmin && !isClient) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
        }

        const now = new Date()
        const bookingDateTime = new Date(`${booking.booking_date}T${String(booking.booking_time).slice(0, 5)}:00`)
        const hoursUntilBooking = Math.floor((bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60))

        return NextResponse.json({
            canReschedule: true,
            reasons: null,
            warnings: null,
            minRescheduleDate: toDateStringMsk(now),
            minRescheduleTime: null,
            booking: {
                id: booking.id,
                booking_date: booking.booking_date,
                booking_time: booking.booking_time,
                status: booking.status,
                client_name: booking.client_name,
                product_name: booking.product_name ?? null,
                amount: booking.amount ?? null,
                hours_until_booking: hoursUntilBooking,
                is_admin: isAdmin,
                can_reschedule_until: null,
            },
        })

    } catch (error) {
        console.error('Ошибка при получении бронирования:', error)
        return NextResponse.json(
            { error: 'Не удалось получить данные бронирования' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const bookingId = Number(id)
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
        }

        const body = await request.json()
        const { new_date, new_time, reason } = body

        if (!new_date || !new_time) {
            return NextResponse.json(
                { error: 'Укажите новую дату и время' },
                { status: 400 }
            )
        }

        const normalizedTime =
            typeof new_time === 'string' && new_time.length === 5
                ? `${new_time}:00`
                : new_time

        // Получаем текущую запись бронирования
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (bookingError || !booking) {
            return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 })
        }

        // Проверяем права доступа
        const isAdmin = session.user.role === 'admin'
        const isClient = session.user.role === 'client' && booking.client_id === session.user.id

        if (!isAdmin && !isClient) {
            return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
        }

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
                booking_date: new_date,
                booking_time: normalizedTime,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating booking:', updateError)
            return NextResponse.json(
                { error: 'Не удалось обновить бронирование' },
                { status: 500 }
            )
        }

        const { error: historyError } = await supabase
            .from('booking_reschedule_history')
            .insert({
                booking_id: bookingId,
                old_date: booking.booking_date,
                old_time: booking.booking_time,
                new_date,
                new_time: normalizedTime,
                rescheduled_by: session.user.id,
                reason: reason || null,
                rescheduled_at: new Date().toISOString()
            })

        if (historyError) {
            console.error('Error creating reschedule history:', historyError)
        }

        return NextResponse.json({
            success: true,
            message: 'Бронирование успешно перенесено',
            booking: updatedBooking
        })

    } catch (error) {
        console.error('Ошибка при обновлении бронирования:', error)
        return NextResponse.json(
            { error: 'Не удалось обновить бронирование' },
            { status: 500 }
        )
    }
}