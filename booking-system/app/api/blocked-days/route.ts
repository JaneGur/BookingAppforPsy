import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'

function getTodayMskISODate(): string {
    const nowMsk = new Date(Date.now() + 3 * 60 * 60 * 1000)
    return nowMsk.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Параметры start_date и end_date обязательны' },
                { status: 400 }
            )
        }

        // Получаем заблокированные дни (когда весь день заблокирован)
        // Это дни, где все слоты заблокированы или есть специальная запись в blocked_days
        // Пока используем blocked_slots для определения полностью заблокированных дней

        let supabase
        try {
            supabase = createServiceRoleSupabaseClient()
        } catch (e) {
            return NextResponse.json(
                { error: 'Заблокированные дни недоступны: не настроен серверный доступ к базе (SUPABASE_SERVICE_ROLE_KEY).' },
                { status: 503 }
            )
        }

        const { data: blockedSlots, error } = await supabase
            .from('blocked_slots')
            .select('slot_date, slot_time')
            .gte('slot_date', startDate)
            .lte('slot_date', endDate)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Группируем по датам и определяем полностью заблокированные дни
        // (если все слоты дня заблокированы)
        const blockedDays = new Set<string>()

        // Получаем настройки для определения всех слотов дня
        const { data: settings } = await supabase
            .from('settings')
            .select('work_start, work_end, session_duration')
            .eq('id', 1)
            .maybeSingle()

        if (settings) {
            const workStart = String(settings.work_start ?? '09:00:00').slice(0, 5)
            const workEnd = String(settings.work_end ?? '18:00:00').slice(0, 5)
            const duration = Number(settings.session_duration ?? 60)

            // Вычисляем количество слотов в дне
            const startMin = parseInt(workStart.split(':')[0]) * 60 + parseInt(workStart.split(':')[1])
            const endMin = parseInt(workEnd.split(':')[0]) * 60 + parseInt(workEnd.split(':')[1])
            const slotsPerDay = Math.floor((endMin - startMin) / duration)

            // Группируем заблокированные слоты по датам
            const blockedByDate = new Map<string, number>()
            blockedSlots?.forEach((slot: { slot_date: string; slot_time: string }) => {
                const count = blockedByDate.get(slot.slot_date) || 0
                blockedByDate.set(slot.slot_date, count + 1)
            })

            // Если все слоты дня заблокированы, считаем день заблокированным
            blockedByDate.forEach((count, date) => {
                if (count >= slotsPerDay) {
                    blockedDays.add(date)
                }
            })
        }

        return NextResponse.json(Array.from(blockedDays))
    } catch (error) {
        console.error('Ошибка при получении заблокированных дней:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}

