import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')

        let query = supabase
            .from('blocked_slots')
            .select('*')
            .order('slot_date', { ascending: true })
            .order('slot_time', { ascending: true })

        if (startDate) {
            query = query.gte('slot_date', startDate)
        }
        if (endDate) {
            query = query.lte('slot_date', endDate)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data ?? [])
    } catch (error) {
        console.error('Ошибка при получении заблокированных слотов:', error)
        return NextResponse.json(
            { error: 'Не удалось получить заблокированные слоты' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { slot_date, slot_time, reason, block_entire_day } = body

        if (!slot_date) {
            return NextResponse.json({ error: 'slot_date is required' }, { status: 400 })
        }

        // Если блокируем весь день, получаем все слоты дня
        if (block_entire_day) {
            const { data: settings } = await supabase
                .from('settings')
                .select('work_start, work_end, session_duration')
                .eq('id', 1)
                .maybeSingle()

            if (!settings) {
                return NextResponse.json({ error: 'Settings not found' }, { status: 500 })
            }

            const workStart = String(settings.work_start ?? '09:00:00').slice(0, 5)
            const workEnd = String(settings.work_end ?? '18:00:00').slice(0, 5)
            const duration = Number(settings.session_duration ?? 60)

            const startMin = parseInt(workStart.split(':')[0]) * 60 + parseInt(workStart.split(':')[1])
            const endMin = parseInt(workEnd.split(':')[0]) * 60 + parseInt(workEnd.split(':')[1])
            const slots: string[] = []

            for (let m = startMin; m + duration <= endMin; m += duration) {
                const hours = Math.floor(m / 60)
                const minutes = m % 60
                slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
            }

            // Создаем блокировки для всех слотов
            const slotsToInsert = slots.map((time) => ({
                slot_date,
                slot_time: time,
                reason: reason || 'Весь день заблокирован',
            }))

            const { data, error } = await supabase
                .from('blocked_slots')
                .upsert(slotsToInsert, { onConflict: 'slot_date,slot_time', ignoreDuplicates: false })
                .select('*')

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json(data)
        } else {
            // Блокируем один слот
            if (!slot_time) {
                return NextResponse.json({ error: 'slot_time is required' }, { status: 400 })
            }

            const { data, error } = await supabase
                .from('blocked_slots')
                .upsert(
                    {
                        slot_date,
                        slot_time,
                        reason: reason || null,
                    },
                    { onConflict: 'slot_date,slot_time' }
                )
                .select('*')
                .single()

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 })
            }

            return NextResponse.json(data)
        }
    } catch (error) {
        console.error('Ошибка при создании блокировки:', error)
        return NextResponse.json(
            { error: 'Не удалось создать блокировку' },
            { status: 500 }
        )
    }
}

