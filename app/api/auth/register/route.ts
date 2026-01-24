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

        // Проверяем email если указан
        if (email) {
            const { data: existingByEmail, error: existingByEmailError } = await supabase
                .from('clients')
                .select('id')
                .eq('email', email)
                .maybeSingle()

            if (existingByEmailError) {
                return NextResponse.json({ error: existingByEmailError.message }, { status: 500 })
            }

            if (existingByEmail) {
                return NextResponse.json({ error: 'Пользователь с таким email уже существует' }, { status: 409 })
            }
        }

        // Проверяем уникальность телефона
        const { data: existingByPhone, error: existingByPhoneError } = await supabase
            .from('clients')
            .select('id')
            .eq('phone', phone)
            .maybeSingle()

        if (existingByPhoneError) {
            return NextResponse.json({ error: existingByPhoneError.message }, { status: 500 })
        }

        if (existingByPhone) {
            return NextResponse.json({ error: 'Пользователь с таким телефоном уже существует' }, { status: 409 })
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10)

        // Создаем клиента
        const { data, error } = await supabase
            .from('clients')
            .insert([
                {
                    name,
                    email: email || null,
                    phone,
                    phone_hash,
                    password: hashedPassword,
                    telegram: telegram || null,
                    role: 'client',
                },
            ])
            .select('id, name, email')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // 🎯 ОТПРАВЛЯЕМ WELCOME EMAIL
        if (email) {
            // Запускаем отправку email асинхронно (не блокируем ответ)
            sendWelcomeEmail({
                to: email,
                userName: name,
            }).catch((emailError) => {
                // Логируем ошибку, но не прерываем регистрацию
                console.error('Failed to send welcome email:', emailError);
            });
        }

        return NextResponse.json({
            id: data.id,
            message: email
                ? 'Регистрация успешна! Проверьте почту для подтверждения.'
                : 'Регистрация успешна!'
        }, { status: 201 })
    } catch (e) {
        console.error('Register error:', e)
        return NextResponse.json({ error: 'Не удалось зарегистрироваться' }, { status: 500 })
    }
}