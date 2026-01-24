import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import { ClientProfile } from '@/types/client'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const clientId = id

        // Получаем клиента
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()

        if (clientError || !client) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404 })
        }

        // Получаем все записи клиента
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*')
            .eq('client_phone', client.phone)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false })

        if (bookingsError) {
            console.error('Bookings error:', bookingsError)
        }

        const bookingsList = bookings || []

        // Вычисляем статистику
        const today = new Date().toISOString().slice(0, 10)
        const totalBookings = bookingsList.length
        const upcomingBookings = bookingsList.filter(
            (b) => b.booking_date >= today && (b.status === 'confirmed' || b.status === 'pending_payment')
        ).length
        const completedBookings = bookingsList.filter((b) => b.status === 'completed').length
        const cancelledBookings = bookingsList.filter((b) => b.status === 'cancelled').length

        const firstBooking = bookingsList.length > 0 ? bookingsList[bookingsList.length - 1] : null
        const lastBooking = bookingsList.length > 0 ? bookingsList[0] : null

        const profile: ClientProfile = {
            client: client as any,
            total_bookings: totalBookings,
            upcoming_bookings: upcomingBookings,
            completed_bookings: completedBookings,
            cancelled_bookings: cancelledBookings,
            first_booking: firstBooking
                ? `${firstBooking.booking_date}T${firstBooking.booking_time}`
                : undefined,
            last_booking: lastBooking ? `${lastBooking.booking_date}T${lastBooking.booking_time}` : undefined,
        }

        return NextResponse.json({ profile, bookings: bookingsList })
    } catch (error) {
        console.error('Ошибка при получении профиля клиента:', error)
        return NextResponse.json(
            { error: 'Не удалось получить профиль клиента' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Удаляем клиента (каскадное удаление записей настроено в БД)
        const { error } = await supabase.from('clients').delete().eq('id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Ошибка при удалении клиента:', error)
        return NextResponse.json(
            { error: 'Не удалось удалить клиента' },
            { status: 500 }
        )
    }
}

