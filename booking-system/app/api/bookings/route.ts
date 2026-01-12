// booking-system/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { normalizePhone } from '@/lib/utils/phone'
import { supabase } from '@/lib/db'
import { createHash } from 'crypto'
import { auth } from '@/auth'

async function sendTelegramNotification(message: string) {
    // Implement actual Telegram notification logic here
    console.log('Sending Telegram notification:', message)
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        const body = await request.json()

        const {
            booking_date,
            booking_time,
            client_name,
            client_phone,
            product_id,
            ...otherFields
        } = body

        if (!booking_date || !booking_time || !client_name || !client_phone || !product_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(String(booking_date))) {
            return NextResponse.json({ error: 'Invalid booking_date' }, { status: 400 })
        }

        const timeRegex = /^\d{2}:\d{2}$/
        if (!timeRegex.test(String(booking_time))) {
            return NextResponse.json({ error: 'Invalid booking_time' }, { status: 400 })
        }

        const normalizedName = String(client_name).trim()
        if (!normalizedName) {
            return NextResponse.json({ error: 'Invalid client_name' }, { status: 400 })
        }

        const normalizedPhone = normalizePhone(client_phone)
        const phone_hash = createHash('sha256').update(normalizedPhone).digest('hex')

        const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, price_rub, is_active')
            .eq('id', Number(product_id))
            .maybeSingle()

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 })
        }

        if (!product || !product.is_active) {
            return NextResponse.json({ error: 'Product not found' }, { status: 400 })
        }

        const amount = Number(product.price_rub)

        const { data, error } = await supabase
            .from('bookings')
            .insert([
                {
                    booking_date,
                    booking_time,
                    client_name: normalizedName,
                    client_phone: normalizedPhone,
                    phone_hash,
                    product_id: Number(product_id),
                    amount,
                    client_id: session?.user?.role === 'client' ? session.user.id : undefined,
                    ...otherFields,
                },
            ])
            .select()

        if (error) {
            console.error('Supabase error:', error)
            const status = error.code === '23505' ? 409 : 500
            return NextResponse.json({ error: error.message }, { status })
        }

        const newBooking = data[0];

        await sendTelegramNotification(
            `Новая запись!\nДата: ${booking_date}\nВремя: ${booking_time}\nКлиент: ${client_name}`
        )

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
        const { searchParams } = new URL(request.url)
        const phone = searchParams.get('phone')

        let query = supabase.from('bookings').select('*')

        if (phone) {
            const normalizedPhone = normalizePhone(phone)
            query = query.eq('client_phone', normalizedPhone)
        }

        const { data, error } = await query

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Ошибка при получении записей:', error)
        return NextResponse.json(
            { error: 'Не удалось получить записи' },
            { status: 500 }
        )
    }
}