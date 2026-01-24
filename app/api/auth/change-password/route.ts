import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { supabase } from '@/lib/db'

export async function PATCH(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
        current_password?: string
        new_password?: string
    } | null

    const currentPassword = String(body?.current_password ?? '')
    const newPassword = String(body?.new_password ?? '')

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Не заполнены поля пароля' }, { status: 400 })
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Новый пароль должен быть не короче 6 символов' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
        .from('clients')
        .select('id, password')
        .eq('id', session.user.id)
        .single()

    if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    if (!user?.password) {
        return NextResponse.json({ error: 'Пароль не установлен' }, { status: 400 })
    }

    const ok = await bcrypt.compare(currentPassword, user.password)

    if (!ok) {
        return NextResponse.json({ error: 'Текущий пароль неверный' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    const { error: updateError } = await supabase
        .from('clients')
        .update({ password: hashed, updated_at: new Date().toISOString() })
        .eq('id', session.user.id)

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}
