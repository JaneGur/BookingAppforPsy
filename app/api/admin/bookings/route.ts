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
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')
        const clientId = searchParams.get('client_id')

        // Создаем базовый запрос с JOIN к таблице клиентов
        let query = supabase
            .from('bookings')
            .select(`
                *,
                client:clients (
                    id,
                    name,
                    phone,
                    email,
                    telegram,
                    telegram_chat_id,
                    created_at,
                    updated_at
                )
            `)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false })

        // Фильтр по статусу
        if (status) {
            const statuses = status.split(',')
            if (statuses.length === 1) {
                query = query.eq('status', statuses[0])
            } else {
                query = query.in('status', statuses)
            }
        }

        // Фильтр по дате
        if (startDate) {
            query = query.gte('booking_date', startDate)
        }
        if (endDate) {
            query = query.lte('booking_date', endDate)
        }

        // Фильтр по client_id
        if (clientId) {
            query = query.eq('client_id', clientId)
        }

        const { data, error } = await query

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Поиск по имени, телефону, email (на клиенте)
        let filteredData = data ?? []
        if (search) {
            const searchLower = search.toLowerCase()
            filteredData = filteredData.filter(
                (booking) =>
                    booking.client_name?.toLowerCase().includes(searchLower) ||
                    booking.client_phone?.includes(search) ||
                    booking.client_email?.toLowerCase().includes(searchLower) ||
                    booking.client?.name?.toLowerCase().includes(searchLower) ||
                    booking.client?.phone?.includes(search) ||
                    booking.client?.email?.toLowerCase().includes(searchLower)
            )
        }

        return NextResponse.json(filteredData)
    } catch (error) {
        console.error('Ошибка при получении записей:', error)
        return NextResponse.json(
            { error: 'Не удалось получить записи' },
            { status: 500 }
        )
    }
}