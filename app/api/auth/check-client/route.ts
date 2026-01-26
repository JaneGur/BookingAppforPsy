import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'
import { normalizePhone } from '@/lib/utils/phone'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { phone, email } = body

        if (!phone && !email) {
            return NextResponse.json({ error: 'Требуется телефон или email' }, { status: 400 })
        }

        const supabase = createServiceRoleSupabaseClient()

        let clientData = null

        if (phone) {
            const normalizedPhone = normalizePhone(phone)
            const { data } = await supabase
                .from('clients')
                .select('id, name, email, phone, password')
                .eq('phone', normalizedPhone)
                .maybeSingle()

            clientData = data
        } else if (email) {
            const normalizedEmail = email.toLowerCase().trim()
            const { data } = await supabase
                .from('clients')
                .select('id, name, email, phone, password')
                .ilike('email', normalizedEmail)
                .maybeSingle()

            clientData = data
        }

        if (!clientData) {
            return NextResponse.json({
                exists: false,
                hasPassword: false,
                message: 'Клиент не найден'
            })
        }

        return NextResponse.json({
            exists: true,
            hasPassword: !!clientData.password,
            client: {
                id: clientData.id,
                name: clientData.name,
                email: clientData.email,
                phone: clientData.phone
            },
            // message: clientData.password
            //     ? 'Клиент уже зарегистрирован. Используйте вход.'
            //     : 'Клиент существует но без пароля. Завершите регистрацию.'
        })

    } catch (error) {
        console.error('Check client error:', error)
        return NextResponse.json({ error: 'Ошибка проверки клиента' }, { status: 500 })
    }
}
