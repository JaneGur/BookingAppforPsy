import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { normalizePhone } from '@/lib/utils/phone'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const phone = searchParams.get('phone')

        if (!phone) {
            return NextResponse.json({ error: 'phone is required' }, { status: 400 })
        }

        const normalizedPhone = normalizePhone(phone)
        const today = new Date().toISOString().slice(0, 10)

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_phone', normalizedPhone)
            .in('status', ['confirmed', 'pending_payment'])
            .gte('booking_date', today)
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true })
            .limit(1)
            .maybeSingle()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data ?? null)
    } catch (e) {
        console.error('Upcoming booking error:', e)
        return NextResponse.json({ error: 'Не удалось получить ближайшую запись' }, { status: 500 })
    }
}
