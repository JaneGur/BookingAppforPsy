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
        const statuses = searchParams.get('statuses')?.split(',') || []

        // Получаем все записи за период
        let bookingsQuery = supabase
            .from('bookings')
            .select('*, products(name, price_rub)')

        if (startDate) {
            bookingsQuery = bookingsQuery.gte('booking_date', startDate)
        }
        if (endDate) {
            bookingsQuery = bookingsQuery.lte('booking_date', endDate)
        }
        if (statuses.length > 0) {
            bookingsQuery = bookingsQuery.in('status', statuses)
        }

        const { data: bookings, error: bookingsError } = await bookingsQuery

        if (bookingsError) {
            return NextResponse.json({ error: bookingsError.message }, { status: 500 })
        }

        // Статистика по продуктам
        const productStats = new Map<
            number,
            { name: string; orders: number; revenue: number; product_id: number }
        >()

        bookings?.forEach((booking: any) => {
            const productId = booking.product_id
            const product = booking.products
            const productName = product?.name || `Продукт #${productId}`
            const amount = booking.amount || booking.products?.price_rub || 0

            if (!productStats.has(productId)) {
                productStats.set(productId, {
                    name: productName,
                    orders: 0,
                    revenue: 0,
                    product_id: productId,
                })
            }

            const stats = productStats.get(productId)!
            stats.orders += 1
            stats.revenue += amount
        })

        // Сортируем по популярности (количество заказов)
        const sortedProducts = Array.from(productStats.values()).sort((a, b) => b.orders - a.orders)

        // Общая статистика
        const totalOrders = bookings?.length || 0
        const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.amount || 0), 0) || 0

        // Статистика по статусам
        const statusStats = {
            pending_payment: bookings?.filter((b: any) => b.status === 'pending_payment').length || 0,
            confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
            completed: bookings?.filter((b: any) => b.status === 'completed').length || 0,
            cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length || 0,
        }

        return NextResponse.json({
            products: sortedProducts,
            totalOrders,
            totalRevenue,
            statusStats,
        })
    } catch (error) {
        console.error('Ошибка при получении аналитики:', error)
        return NextResponse.json(
            { error: 'Не удалось получить аналитику' },
            { status: 500 }
        )
    }
}

