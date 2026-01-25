// booking-system/app/api/slots/available/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'

function pad2(n: number) {
    return String(n).padStart(2, '0')
}

function timeToMinutes(t: string) {
    const [h, m] = t.split(':').map((v) => Number(v))
    return h * 60 + m
}

function minutesToTime(m: number) {
    const h = Math.floor(m / 60)
    const mm = m % 60
    return `${pad2(h)}:${pad2(mm)}`
}

function normalizeTime(value: string) {
    const [h, m] = String(value).split(':')
    if (!h || !m) return String(value).slice(0, 5)
    return `${pad2(Number(h))}:${pad2(Number(m))}`
}

function getTodayMskISODate(): string {
    const nowMsk = new Date(Date.now() + 3 * 60 * 60 * 1000)
    return nowMsk.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get('date')

        if (!date) {
            return NextResponse.json(
                { error: 'Параметр date обязателен' },
                { status: 400 }
            )
        }

        // Валидация формата даты
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { error: 'Неверный формат даты. Используйте YYYY-MM-DD' },
                { status: 400 }
            )
        }

        const todayMsk = getTodayMskISODate()
        const startAllowedUtc = Date.parse(`${todayMsk}T00:00:00+03:00`)
        const requestedDayUtc = Date.parse(`${date}T00:00:00+03:00`)
        const maxAllowedUtc = startAllowedUtc + 30 * 24 * 60 * 60 * 1000

        if (Number.isNaN(requestedDayUtc)) {
            return NextResponse.json({ error: 'Неверная дата' }, { status: 400 })
        }

        if (requestedDayUtc < startAllowedUtc || requestedDayUtc > maxAllowedUtc) {
            return NextResponse.json(
                { error: 'Дата вне доступного диапазона (сегодня + 30 дней)' },
                { status: 400 }
            )
        }

        let supabase
        try {
            supabase = createServiceRoleSupabaseClient()
        } catch (e) {
            return NextResponse.json(
                { error: 'Слоты недоступны: не настроен серверный доступ к базе (SUPABASE_SERVICE_ROLE_KEY).' },
                { status: 503 }
            )
        }

        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('work_start, work_end, session_duration')
            .eq('id', 1)
            .maybeSingle()

        if (settingsError) {
            return NextResponse.json({ error: settingsError.message }, { status: 500 })
        }

        const workStart = String(settings?.work_start ?? '09:00:00').slice(0, 5)
        const workEnd = String(settings?.work_end ?? '18:00:00').slice(0, 5)
        const duration = Number(settings?.session_duration ?? 60)

        const startMin = timeToMinutes(workStart)
        const endMin = timeToMinutes(workEnd)
        const allSlots: string[] = []

        for (let m = startMin; m + duration <= endMin; m += duration) {
            allSlots.push(minutesToTime(m))
        }

        const [{ data: bookings, error: bookingsError }, { data: blocked, error: blockedError }] = await Promise.all([
            supabase
                .from('bookings')
                .select('booking_time')
                .eq('booking_date', date)
                .neq('status', 'cancelled'),
            supabase.from('blocked_slots').select('slot_time').eq('slot_date', date),
        ])

        if (bookingsError) {
            return NextResponse.json({ error: bookingsError.message }, { status: 500 })
        }

        if (blockedError) {
            return NextResponse.json({ error: blockedError.message }, { status: 500 })
        }

        const taken = new Set<string>()
            ; (bookings ?? []).forEach((b: { booking_time?: string }) => {
                if (b.booking_time) {
                    taken.add(normalizeTime(b.booking_time))
                }
            })
            ; (blocked ?? []).forEach((b: { slot_time?: string }) => {
                if (b.slot_time) {
                    taken.add(normalizeTime(b.slot_time))
                }
            })

        const minLeadUtc = Date.now() + 60 * 60 * 1000

        const availableSlots = allSlots.filter((time) => {
            if (taken.has(time)) return false

            const slotUtc = Date.parse(`${date}T${time}:00+03:00`)
            if (Number.isNaN(slotUtc)) return false

            return slotUtc >= minLeadUtc
        })

        return NextResponse.json(availableSlots)
    } catch (error) {
        console.error('Ошибка при получении слотов:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}