import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!data) {
            return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Ошибка при получении настроек:', error)
        return NextResponse.json(
            { error: 'Не удалось получить настройки' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { work_start, work_end, session_duration, format, info_contacts, info_additional } = body

        // Валидация
        if (work_start && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(work_start)) {
            return NextResponse.json({ error: 'Неверный формат времени начала работы' }, { status: 400 })
        }
        if (work_end && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(work_end)) {
            return NextResponse.json({ error: 'Неверный формат времени окончания работы' }, { status: 400 })
        }
        if (session_duration !== undefined && (session_duration < 15 || session_duration > 180)) {
            return NextResponse.json(
                { error: 'Длительность сессии должна быть от 15 до 180 минут' },
                { status: 400 }
            )
        }

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (work_start !== undefined) updateData.work_start = work_start
        if (work_end !== undefined) updateData.work_end = work_end
        if (session_duration !== undefined) updateData.session_duration = session_duration
        if (format !== undefined) updateData.format = format
        if (info_contacts !== undefined) updateData.info_contacts = info_contacts
        if (info_additional !== undefined) updateData.info_additional = info_additional

        const { data, error } = await supabase
            .from('settings')
            .update(updateData)
            .eq('id', 1)
            .select('*')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Ошибка при обновлении настроек:', error)
        return NextResponse.json(
            { error: 'Не удалось обновить настройки' },
            { status: 500 }
        )
    }
}

