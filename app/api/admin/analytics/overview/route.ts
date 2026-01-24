import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
        const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
        const today = format(now, 'yyyy-MM-dd')

        // Предстоящие события (будущие записи)
        const { data: upcoming, error: upcomingError } = await supabase
            .from('bookings')
            .select('*')
            .gte('booking_date', today)
            .in('status', ['confirmed', 'pending_payment'])
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true })
            .limit(10)

        // Недельная статистика
        const { data: weekBookings, error: weekError } = await supabase
            .from('bookings')
            .select('*')
            .gte('booking_date', weekStart)
            .lte('booking_date', weekEnd)

        // Месячная статистика
        const { data: monthBookings, error: monthError } = await supabase
            .from('bookings')
            .select('*')
            .gte('booking_date', monthStart)
            .lte('booking_date', monthEnd)

        if (upcomingError || weekError || monthError) {
            return NextResponse.json(
                { error: 'Ошибка при получении данных' },
                { status: 500 }
            )
        }

        const weekStats = {
            total: weekBookings?.length || 0,
            confirmed: weekBookings?.filter((b) => b.status === 'confirmed').length || 0,
            completed: weekBookings?.filter((b) => b.status === 'completed').length || 0,
            revenue: weekBookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
        }

        const monthStats = {
            total: monthBookings?.length || 0,
            confirmed: monthBookings?.filter((b) => b.status === 'confirmed').length || 0,
            completed: monthBookings?.filter((b) => b.status === 'completed').length || 0,
            revenue: monthBookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
        }

        return NextResponse.json({
            upcoming: upcoming || [],
            weekStats,
            monthStats,
        })
    } catch (error) {
        console.error('Ошибка при получении обзора:', error)
        return NextResponse.json(
            { error: 'Не удалось получить обзор' },
            { status: 500 }
        )
    }
}

