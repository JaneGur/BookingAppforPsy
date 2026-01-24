// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import { formatDeleteBookingNotification } from '@/lib/utils/telegram'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

async function getBookingOr404(id: number): Promise<
    | { error: string; status: 500 | 404 }
    | { booking: any; status: 200 }
> {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle()

    if (error) {
        return { error: error.message, status: 500 as const }
    }

    if (!data) {
        return { error: 'Запись не найдена', status: 404 as const }
    }

    return { booking: data, status: 200 as const }
}

// Получить одну запись
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)

    const result = await getBookingOr404(bookingId)
    if (!('booking' in result)) {
        return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { booking } = result

    // Проверяем права доступа
    if (session.user.role !== 'admin' && booking.client_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(booking)
}

// Обновить запись
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)

    const existing = await getBookingOr404(bookingId)
    if (!('booking' in existing)) {
        return NextResponse.json({ error: existing.error }, { status: existing.status })
    }

    // Проверяем права доступа
    if (session.user.role !== 'admin' && existing.booking.client_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const update = {
            ...body,
            updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
            .from('bookings')
            .update(update)
            .eq('id', bookingId)
            .select('*')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (_error) {
        return NextResponse.json({ error: 'Не удалось обновить запись' }, { status: 500 })
    }
}

// УДАЛИТЬ ЗАПИСЬ ПОЛНОСТЬЮ (только для админов)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Только админы могут удалять записи полностью
    if (session.user.role !== 'admin') {
        return NextResponse.json(
            { error: 'Только администраторы могут удалять записи' },
            { status: 403 }
        )
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)

    if (isNaN(bookingId)) {
        return NextResponse.json(
            { error: 'Неверный ID записи' },
            { status: 400 }
        )
    }

    try {
        // Получаем запись перед удалением для уведомлений
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) {
            return NextResponse.json(
                { error: 'Запись не найдена' },
                { status: 404 }
            )
        }

        console.log(`[DELETE] Полное удаление записи ${bookingId}`)

        // Полное удаление из базы данных
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', bookingId)

        if (deleteError) {
            console.error('Ошибка при удалении записи:', deleteError)
            return NextResponse.json(
                { error: 'Не удалось удалить запись' },
                { status: 500 }
            )
        }

        // Отправляем уведомление админу о полном удалении
        await formatDeleteBookingNotification({
            id: bookingId,
            client_name: booking.client_name,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
        })

        console.log(`[DELETE] Запись ${bookingId} успешно удалена из базы`)

        return NextResponse.json({
            success: true,
            message: 'Запись полностью удалена',
            deletedId: bookingId
        })

    } catch (error) {
        console.error('Ошибка в DELETE endpoint:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}