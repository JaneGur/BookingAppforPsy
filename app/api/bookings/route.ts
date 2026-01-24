// booking-system/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { normalizePhone } from '@/lib/utils/phone'
import { supabase } from '@/lib/db'
import { createHash } from 'crypto'
import { auth } from '@/auth'
import { sendAdminNotification, sendClientNotification, formatNewBookingNotification } from '@/lib/utils/telegram'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

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

        // Шаг 1: Проверка существования клиента
        let clientId: string | undefined = undefined
        let telegramChatId: string | null = null
        let existingClientId: string | undefined = undefined

        // Проверяем клиента по phone_hash
        const { data: existingClient, error: clientQueryError } = await supabase
            .from('clients')
            .select('id, telegram_chat_id')
            .eq('phone_hash', phone_hash)
            .maybeSingle()

        if (clientQueryError) {
            console.error('Error querying client:', clientQueryError)
        }

        if (existingClient) {
            // Клиент существует, используем его ID
            clientId = existingClient.id
            telegramChatId = existingClient.telegram_chat_id || null
            existingClientId = existingClient.id
        } else {
            // Шаг 2: Создание нового клиента
            const newClientData: any = {
                name: normalizedName,
                phone: normalizedPhone,
                phone_hash: phone_hash,
                email: otherFields.client_email || null,
                telegram: otherFields.client_telegram || null,
                role: 'client'
            }

            // Создаем нового клиента без явного указания ID - база сгенерирует автоматически
            const { data: newClient, error: createClientError } = await supabase
                .from('clients')
                .insert([newClientData])
                .select('id, telegram_chat_id')
                .single()

            if (createClientError) {
                // Если ошибка дублирования (клиент уже создался в другой сессии), находим его
                if (createClientError.code === '23505') {
                    const { data: duplicateClient } = await supabase
                        .from('clients')
                        .select('id, telegram_chat_id')
                        .eq('phone_hash', phone_hash)
                        .single()

                    if (duplicateClient) {
                        clientId = duplicateClient.id
                        telegramChatId = duplicateClient.telegram_chat_id || null
                        existingClientId = duplicateClient.id
                    } else {
                        console.error('Duplicate client error but client not found:', createClientError)
                        return NextResponse.json(
                            { error: 'Ошибка при создании клиента' },
                            { status: 500 }
                        )
                    }
                } else {
                    console.error('Error creating client:', createClientError)
                    return NextResponse.json(
                        { error: 'Ошибка при создании клиента' },
                        { status: 500 }
                    )
                }
            } else if (newClient) {
                // Успешно создали нового клиента
                clientId = newClient.id
                telegramChatId = newClient.telegram_chat_id || null
            }
        }

        // Шаг 3: Получение ID клиента для записи
        let finalClientId = clientId

        // Если администратор создает запись, и клиент существует, но не авторизован,
        // мы все равно используем существующий clientId
        if (session?.user?.role === 'admin' && existingClientId) {
            finalClientId = existingClientId
        }

        // Шаг 5: Создание записи
        const bookingData: any = {
            booking_date,
            booking_time,
            client_name: normalizedName,
            client_phone: normalizedPhone,
            phone_hash,
            product_id: Number(product_id),
            amount,
            telegram_chat_id: telegramChatId,
            ...otherFields
        }

        // Добавляем client_id только если он определен
        if (finalClientId) {
            bookingData.client_id = finalClientId
        }

        // Также добавляем client_id из сессии если пользователь авторизован как клиент
        // и мы не нашли клиента по телефону
        if (session?.user?.role === 'client' && session.user.id && !existingClientId) {
            bookingData.client_id = session.user.id
        }

        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData])
            .select()

        if (error) {
            console.error('Supabase error:', error)

            // Если ошибка дублирования записи
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'На это время уже есть запись' },
                    { status: 409 }
                )
            }

            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const newBooking = data[0];

        // Получаем название продукта для уведомления
        const { data: productData } = await supabase
            .from('products')
            .select('name')
            .eq('id', Number(product_id))
            .single();

        // Отправляем уведомление админу в Telegram
        await sendAdminNotification(
            formatNewBookingNotification({
                id: newBooking.id,
                client_name: normalizedName,
                client_phone: normalizedPhone,
                client_email: otherFields.client_email,
                booking_date,
                booking_time,
                product_name: productData?.name,
                amount,
            })
        );

        // Отправляем уведомление клиенту в Telegram (если подключен)
        if (telegramChatId) {
            const bookingDateFormatted = format(parseISO(booking_date), 'd MMMM yyyy', { locale: ru });
            const clientMessage = `✅ <b>Запись создана!</b>\n\n📅 <b>Дата:</b> ${bookingDateFormatted}\n⏰ <b>Время:</b> ${booking_time}\n${productData?.name ? `🎯 <b>Услуга:</b> ${productData.name}\n` : ''}💰 <b>Сумма:</b> ${amount.toLocaleString('ru-RU')} ₽\n\n⏳ Ожидайте подтверждения записи.`;

            await sendClientNotification(telegramChatId, clientMessage);
        }

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