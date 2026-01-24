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

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_phone', normalizedPhone)
            .eq('status', 'pending_payment')
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true })
            .maybeSingle()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data ?? null)
    } catch (e) {
        console.error('Pending booking error:', e)
        return NextResponse.json({ error: 'Не удалось получить заказ' }, { status: 500 })
    }
}
