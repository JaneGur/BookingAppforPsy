// app/api/bookings/[id]/payment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
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

        const body = await request.json()
        const {
            amount,
            sessionCount,
            discountCategory,
            discountPercentage
        } = body

        // Проверяем, что запись существует и доступна для оплаты
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

        // Проверяем права доступа (только владелец записи может оплатить)
        if (booking.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'Нет прав для оплаты этой записи' },
                { status: 403 }
            )
        }

        // Проверяем статус записи
        if (booking.status !== 'pending_payment') {
            return NextResponse.json(
                { error: 'Запись уже оплачена или отменена' },
                { status: 400 }
            )
        }

        // Здесь будет интеграция с платежной системой (ЮKassa, CloudPayments и т.д.)
        // Пока просто симулируем успешную оплату

        console.log(`Платеж для записи ${bookingId}:`, {
            amount,
            sessionCount,
            discountCategory,
            discountPercentage,
            clientId: session.user.id
        })

        // В реальности здесь:
        // 1. Создаем платеж в платежной системе
        // 2. Сохраняем данные платежа в БД
        // 3. Возвращаем ссылку для оплаты или подтверждаем платеж

        // Пример сохранения данных платежа (нужно создать таблицу payments)
        /*
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                booking_id: bookingId,
                user_id: session.user.id,
                amount,
                session_count: sessionCount,
                discount_category: discountCategory,
                discount_percentage: discountPercentage,
                status: 'pending', // или 'completed' если оплата мгновенная
                payment_data: body
            })
        */

        return NextResponse.json({
            success: true,
            message: 'Платеж обработан',
            paymentId: `pay_${Date.now()}_${bookingId}`,
            // paymentUrl: 'https://payment-gateway.com/...' // ссылка для оплаты
        })

    } catch (error) {
        console.error('Ошибка обработки платежа:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}