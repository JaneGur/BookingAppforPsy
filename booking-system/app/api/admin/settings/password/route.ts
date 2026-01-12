import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { currentPassword, newPassword, confirmPassword } = body

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Пароль должен быть не менее 6 символов' }, { status: 400 })
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'Новые пароли не совпадают' }, { status: 400 })
        }

        // Получаем текущего пользователя
        const { data: user, error: userError } = await supabase
            .from('clients')
            .select('password')
            .eq('id', session.user.id)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
        }

        if (!user.password) {
            return NextResponse.json({ error: 'Пароль не установлен' }, { status: 400 })
        }

        // Проверяем текущий пароль
        const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 })
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Обновляем пароль
        const { error: updateError } = await supabase
            .from('clients')
            .update({ password: hashedPassword, updated_at: new Date().toISOString() })
            .eq('id', session.user.id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Ошибка при смене пароля:', error)
        return NextResponse.json(
            { error: 'Не удалось сменить пароль' },
            { status: 500 }
        )
    }
}

