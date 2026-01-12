import { NextRequest, NextResponse } from 'next/server'
import { Booking } from '@/types/booking'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

// Вспомогательная функция для отправки уведомлений (имитация)
async function sendTelegramNotification(message: string) {
    try {
        // В реальном приложении URL должен быть в .env
        await fetch('http://localhost:3000/api/telegram/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: 'CLIENT_CHAT_ID', message }), // ID чата нужно будет получать
        })
    } catch (error) {
        console.error('Не удалось отправить Telegram-уведомление:', error)
    }
}

async function getBookingOr404(id: number) {
    const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle()

    if (error) {
        return { error: error.message, status: 500 as const }
    }

    if (!data) {
        return { error: 'Запись не найдена', status: 404 as const }
    }

    return { booking: data as Booking, status: 200 as const }
}

function canAccess(session: Awaited<ReturnType<typeof auth>>, booking: Booking) {
    if (!session?.user?.id) return false
    if (session.user.role === 'admin') return true
    return booking.client_id === session.user.id
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

    if (!canAccess(session, result.booking)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(result.booking)
}

// Обновить запись (для переноса)
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

    if (!canAccess(session, existing.booking)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const body = await request.json()
        const update: Partial<Booking> = {
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

// Отменить (удалить) запись
export async function DELETE(
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

    if (!canAccess(session, existing.booking)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select('*')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Запись ${bookingId} отменена`)

    // Отправляем уведомление
    await sendTelegramNotification(
        `Ваша запись #${bookingId} была успешно отменена.`
    )

    return NextResponse.json(data)
}