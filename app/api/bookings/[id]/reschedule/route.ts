import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

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

        return NextResponse.json(booking)

    } catch (error) {
        console.error('Ошибка при получении бронирования:', error)
        return NextResponse.json(
            { error: 'Не удалось получить данные бронирования' },
            { status: 500 }
        )
    }
}

export async function PUT(
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

        // Обновляем бронирование
        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
                date: new_date,
                time: new_time,
                status: 'rescheduled',
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

        // Создаем запись в истории переносов
        const { error: historyError } = await supabase
            .from('booking_reschedule_history')
            .insert({
                booking_id: bookingId,
                old_date: booking.date,
                old_time: booking.time,
                new_date: new_date,
                new_time: new_time,
                rescheduled_by: session.user.id,
                reason: reason || null,
                rescheduled_at: new Date().toISOString()
            })

        if (historyError) {
            console.error('Error creating reschedule history:', historyError)
            // Продолжаем, даже если история не сохранилась
        }

        return NextResponse.json({
            success: true,
            message: 'Бронирование успешно перенесено',
            booking: updatedBooking
        })

    } catch (error) {
        console.error('Ошибка при переносе бронирования:', error)
        return NextResponse.json(
            { error: 'Не удалось перенести бронирование' },
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
        const { action } = body // Например: 'cancel', 'confirm'

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

        // Обработка различных действий
        let updateData = {}
        switch (action) {
            case 'cancel':
                updateData = { status: 'cancelled' }
                break
            case 'confirm':
                updateData = { status: 'confirmed' }
                break
            default:
                return NextResponse.json(
                    { error: 'Неизвестное действие' },
                    { status: 400 }
                )
        }

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
                ...updateData,
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

        return NextResponse.json({
            success: true,
            message: `Бронирование успешно ${action === 'cancel' ? 'отменено' : 'подтверждено'}`,
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