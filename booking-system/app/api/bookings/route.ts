// booking-system/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { normalizePhone } from '@/lib/utils/phone'

// Временное хранилище (в реальном приложении - Supabase)
const bookings: any[] = []

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const {
            booking_date,
            booking_time,
            client_name,
            client_phone,
            client_email,
            client_telegram,
            notes,
            product_id = 1,
            status = 'pending_payment',
        } = body

        // Валидация обязательных полей
        if (!booking_date || !booking_time || !client_name || !client_phone) {
            return NextResponse.json(
                { error: 'Заполните все обязательные поля' },
                { status: 400 }
            )
        }

        // Нормализация телефона
        const normalizedPhone = normalizePhone(client_phone)

        // Создание новой записи
        const newBooking = {
            id: bookings.length + 1,
            booking_date,
            booking_time,
            client_name,
            client_phone: normalizedPhone,
            client_email,
            client_telegram,
            notes,
            product_id,
            status,
            amount: 3000, // Цена консультации
            phone_hash: Buffer.from(normalizedPhone).toString('base64'),
            created_at: new Date().toISOString(),
        }

        bookings.push(newBooking)

        console.log('Создана новая запись:', newBooking)

        // В реальном приложении здесь:
        // 1. Сохранение в Supabase
        // 2. Отправка уведомления в Telegram
        // 3. Отправка email/SMS клиенту

        return NextResponse.json(newBooking, { status: 201 })
    } catch (error) {
        console.error('Ошибка при создании записи:', error)
        return NextResponse.json(
            { error: 'Не удалось создать запись' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const phone = searchParams.get('phone')

        if (phone) {
            const normalizedPhone = normalizePhone(phone)
            const clientBookings = bookings.filter(
                (b) => b.client_phone === normalizedPhone
            )
            return NextResponse.json(clientBookings)
        }

        // Вернуть все записи (только для админа)
        return NextResponse.json(bookings)
    } catch (error) {
        console.error('Ошибка при получении записей:', error)
        return NextResponse.json(
            { error: 'Не удалось получить записи' },
            { status: 500 }
        )
    }
}