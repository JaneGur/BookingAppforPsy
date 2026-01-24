// app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import {
    sendAdminNotification,
    sendClientNotification,
    formatCancelBookingNotification
} from '@/lib/utils/telegram'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('=== CANCEL ENDPOINT ВЫЗВАН ===')

    const session = await auth()
    console.log('Session exists:', !!session)
    console.log('User ID:', session?.user?.id)
    console.log('User Role:', session?.user?.role)
    console.log('User Email:', session?.user?.email)

    if (!session) {
        console.log('❌ Нет сессии, возвращаем 401')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = parseInt(id, 10)
    console.log('Booking ID from params:', id, 'Parsed:', bookingId)

    if (isNaN(bookingId)) {
        console.log('❌ Неверный ID записи:', id)
        return NextResponse.json(
            { error: 'Неверный ID записи' },
            { status: 400 }
        )
    }

    try {
        console.log(`🔍 Получаем запись ${bookingId} из базы...`)

        // Получаем текущую запись
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        console.log('Fetch result:', { booking: !!booking, fetchError })

        if (fetchError) {
            console.error('❌ Ошибка получения записи из Supabase:', fetchError)
            console.error('Supabase error details:', fetchError.message, fetchError.details, fetchError.hint)
            return NextResponse.json(
                { error: 'Запись не найдена', details: fetchError.message },
                { status: 404 }
            )
        }

        if (!booking) {
            console.error('❌ Запись не найдена (booking is null)')
            return NextResponse.json(
                { error: 'Запись не найдена' },
                { status: 404 }
            )
        }

        console.log('📋 Данные записи:', {
            id: booking.id,
            client_id: booking.client_id,
            client_name: booking.client_name,
            status: booking.status,
            session_user_id: session.user.id
        })

        // Проверяем права доступа
        const isAdmin = session.user.role === 'admin'
        const isOwner = booking.client_id === session.user.id

        console.log('🔐 Проверка прав:', { isAdmin, isOwner, client_id: booking.client_id, session_user_id: session.user.id })

        if (!isAdmin && !isOwner) {
            console.log('❌ Нет прав доступа для отмены')
            return NextResponse.json(
                { error: 'Нет прав для отмены этой записи' },
                { status: 403 }
            )
        }

        // Проверяем, не отменена ли уже запись
        if (booking.status === 'cancelled') {
            console.log('⚠️ Запись уже отменена')
            return NextResponse.json(
                { error: 'Запись уже отменена' },
                { status: 400 }
            )
        }

        console.log(`🔄 Обновляем статус записи ${bookingId} на "cancelled"...`)

        // Обновляем статус на cancelled
        const updateData = {
            status: 'cancelled',
            updated_at: new Date().toISOString(),
            cancelled_by: session.user.id,
            cancelled_at: new Date().toISOString()
        }

        console.log('📝 Данные для обновления:', updateData)

        const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId)
            .select('*')
            .single()

        console.log('Update result:', { updatedBooking: !!updatedBooking, updateError })

        if (updateError) {
            console.error('❌ Ошибка при отмене записи в Supabase:', updateError)
            console.error('Supabase update error details:', updateError.message, updateError.details, updateError.hint)
            return NextResponse.json(
                { error: 'Не удалось отменить запись', details: updateError.message },
                { status: 500 }
            )
        }

        console.log(`✅ Запись ${bookingId} успешно обновлена в базе`)

        try {
            // Отправляем уведомление админу
            console.log('📨 Отправка уведомления админу...')
            const adminMessage = formatCancelBookingNotification({
                id: bookingId,
                client_name: booking.client_name,
                booking_date: booking.booking_date,
                booking_time: booking.booking_time,
                cancelled_by: session.user.name || session.user.email || 'Пользователь'
            })

            await sendAdminNotification(adminMessage)
            console.log('✅ Уведомление админу отправлено')
        } catch (telegramError) {
            console.error('⚠️ Ошибка отправки Telegram уведомления админу:', telegramError)
            // Не прерываем выполнение из-за ошибки Telegram
        }

        // Отправляем уведомление клиенту в Telegram (если подключен)
        if (booking.telegram_chat_id) {
            try {
                console.log('📨 Отправка уведомления клиенту...')
                const bookingDateFormatted = format(parseISO(booking.booking_date), 'd MMMM yyyy', { locale: ru })
                const cancelledByText = isOwner ? 'вами' : 'администратором'

                const clientMessage = `❌ <b>Запись отменена</b>\n\n📅 <b>Дата:</b> ${bookingDateFormatted}\n⏰ <b>Время:</b> ${booking.booking_time}\n\nЗапись была отменена ${cancelledByText}.\n\nЕсли у вас есть вопросы, свяжитесь с нами.`

                await sendClientNotification(booking.telegram_chat_id, clientMessage)
                console.log('✅ Уведомление клиенту отправлено')
            } catch (telegramError) {
                console.error('⚠️ Ошибка отправки Telegram уведомления клиенту:', telegramError)
                // Не прерываем выполнение
            }
        } else {
            console.log('ℹ️ У клиента нет telegram_chat_id, пропускаем уведомление')
        }

        console.log(`🎉 [CANCEL] Запись ${bookingId} успешно отменена пользователем ${session.user.id}`)

        return NextResponse.json({
            success: true,
            message: 'Запись успешно отменена',
            booking: updatedBooking
        })

    } catch (error) {
        console.error('🔥 Критическая ошибка в CANCEL endpoint:', error)
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}

// Также можно добавить GET для получения информации о возможности отмены
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('=== CANCEL GET ENDPOINT ВЫЗВАН ===')

    const session = await auth()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const { data: booking, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single()

        if (error || !booking) {
            return NextResponse.json(
                { error: 'Запись не найдена' },
                { status: 404 }
            )
        }

        // Проверяем права доступа
        const isAdmin = session.user.role === 'admin'
        const isOwner = booking.client_id === session.user.id
        const canCancel = (isAdmin || isOwner) && booking.status !== 'cancelled'

        return NextResponse.json({
            canCancel,
            booking,
            userRole: session.user.role,
            isOwner
        })

    } catch (error) {
        console.error('Ошибка в GET cancel endpoint:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}