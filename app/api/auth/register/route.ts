// app/api/auth/register/route.ts (ОБНОВЛЕННАЯ ВЕРСИЯ)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { normalizePhone, validatePhone } from '@/lib/utils/phone'
import { sendWelcomeEmail } from '@/lib/emails/email'

export async function POST(request: NextRequest) {
    try {
        let supabase
        try {
            supabase = createServiceRoleSupabaseClient()
        } catch (e) {
            return NextResponse.json(
                { error: 'Регистрация недоступна: не настроен серверный доступ к базе (SUPABASE_SERVICE_ROLE_KEY).' },
                { status: 503 }
            )
        }

        const body = (await request.json()) as {
            name?: string
            email?: string
            phone?: string
            password?: string
            telegram?: string
        }

        const name = (body.name ?? '').trim()
        const email = (body.email ?? '').trim().toLowerCase()
        const phoneRaw = (body.phone ?? '').trim()
        const password = String(body.password ?? '')
        const telegram = (body.telegram ?? '').trim()

        // Валидация
        if (!name || !phoneRaw || !password) {
            return NextResponse.json({ error: 'Не заполнены обязательные поля' }, { status: 400 })
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Пароль должен быть не короче 6 символов' }, { status: 400 })
        }

        if (!validatePhone(phoneRaw)) {
            return NextResponse.json({ error: 'Некорректный номер телефона' }, { status: 400 })
        }

        const phone = normalizePhone(phoneRaw)
        const phone_hash = createHash('sha256').update(phone).digest('hex')

        // Проверяем телефон и определяем статус клиента
        const { data: existingByPhone, error: existingByPhoneError } = await supabase
            .from('clients')
            .select('id, password, name, email')
            .eq('phone', phone)
            .maybeSingle()

        if (existingByPhoneError) {
            return NextResponse.json({ error: existingByPhoneError.message }, { status: 500 })
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10)

        let clientData: any
        let isNewClient = false
        let clientId: string
        let clientName: string
        let clientEmail: string | null

        // Приоритет: проверяем по телефону, потом по email
        if (existingByPhone) {
            // Клиент найден по телефону
            if (existingByPhone.password) {
                return NextResponse.json({
                    error: 'Пользователь с таким телефоном уже зарегистрирован. Используйте вход.'
                }, { status: 409 })
            }
            // Обновляем существующего клиента найденного по телефону
            clientData = {
                name: existingByPhone.name || name,
                email: email || existingByPhone.email,
                password: hashedPassword,
                telegram: telegram || null,
                updated_at: new Date().toISOString()
            }

            const { data: updatedClient, error: updateError } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', existingByPhone.id)
                .select('id, name, email')
                .single()

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500 })
            }

            clientId = updatedClient.id
            clientName = updatedClient.name
            clientEmail = updatedClient.email
        } else if (email) {
            // Проверяем по email только если не нашли по телефону (case-insensitive)
            const { data: existingByEmail, error: existingByEmailError } = await supabase
                .from('clients')
                .select('id, password, name, email')
                .ilike('email', email)
                .maybeSingle()

            if (existingByEmailError) {
                return NextResponse.json({ error: existingByEmailError.message }, { status: 500 })
            }

            if (existingByEmail) {
                if (existingByEmail.password) {
                    return NextResponse.json({
                        error: 'Пользователь с таким email уже зарегистрирован. Используйте вход.'
                    }, { status: 409 })
                }
                // Обновляем существующего клиента найденного по email
                clientData = {
                    name: existingByEmail.name || name,
                    phone: phone,
                    phone_hash: phone_hash,
                    password: hashedPassword,
                    telegram: telegram || null,
                    updated_at: new Date().toISOString()
                }

                const { data: updatedClient, error: updateError } = await supabase
                    .from('clients')
                    .update(clientData)
                    .eq('id', existingByEmail.id)
                    .select('id, name, email')
                    .single()

                if (updateError) {
                    return NextResponse.json({ error: updateError.message }, { status: 500 })
                }

                clientId = updatedClient.id
                clientName = updatedClient.name
                clientEmail = updatedClient.email
            } else {
                // Создаем нового клиента
                isNewClient = true
                clientData = {
                    name,
                    email: email || null,
                    phone,
                    phone_hash,
                    password: hashedPassword,
                    telegram: telegram || null,
                    role: 'client',
                }

                const { data: newClient, error: insertError } = await supabase
                    .from('clients')
                    .insert([clientData])
                    .select('id, name, email')
                    .single()

                if (insertError) {
                    return NextResponse.json({ error: insertError.message }, { status: 500 })
                }

                clientId = newClient.id
                clientName = newClient.name
                clientEmail = newClient.email
            }
        } else {
            // Создаем нового клиента (без email)
            isNewClient = true
            clientData = {
                name,
                email: null,
                phone,
                phone_hash,
                password: hashedPassword,
                telegram: telegram || null,
                role: 'client',
            }

            const { data: newClient, error: insertError } = await supabase
                .from('clients')
                .insert([clientData])
                .select('id, name, email')
                .single()

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500 })
            }

            clientId = newClient.id
            clientName = newClient.name
            clientEmail = newClient.email
        }

        // 🎯 ОТПРАВЛЯЕМ WELCOME EMAIL
        if (clientEmail) {
            // Запускаем отправку email асинхронно (не блокируем ответ)
            sendWelcomeEmail({
                to: clientEmail,
                userName: clientName,
            }).catch((emailError) => {
                // Логируем ошибку, но не прерываем регистрацию
                console.error('Failed to send welcome email:', emailError);
            });
        }

        const message = isNewClient
            ? (clientEmail
                ? 'Регистрация успешна! Проверьте почту для подтверждения.'
                : 'Регистрация успешна!')
            : 'Аккаунт успешно создан! Теперь вы можете войти в систему.';

        return NextResponse.json({
            id: clientId,
            message,
            isNewClient
        }, { status: 201 })
    } catch (e) {
        console.error('Register error:', e)
        return NextResponse.json({ error: 'Не удалось зарегистрироваться' }, { status: 500 })
    }
}