import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // Измените здесь
) {
    try {
        const params = await context.params // Добавьте эту строку
        const session = await auth()
        const bookingId = Number(params.id) // Используйте params из await

        if (!session?.user) {
            return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
        }

        // Получаем запись для проверки прав
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('client_id')
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

        // Получаем историю переносов
        const { data: history, error } = await supabase
            .from('booking_reschedule_history')
            .select('*')
            .eq('booking_id', bookingId)
            .order('rescheduled_at', { ascending: false })

        if (error) {
            console.error('Error fetching reschedule history:', error)
            return NextResponse.json({ error: 'Не удалось получить историю' }, { status: 500 })
        }

        return NextResponse.json(history || [])

    } catch (error) {
        console.error('Ошибка при получении истории переносов:', error)
        return NextResponse.json(
            { error: 'Не удалось получить историю' },
            { status: 500 }
        )
    }
}