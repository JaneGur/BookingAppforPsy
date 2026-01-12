import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Получаем все продукты (включая неактивные) для админа
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data ?? [])
    } catch (error) {
        console.error('Ошибка при получении продуктов:', error)
        return NextResponse.json(
            { error: 'Не удалось получить продукты' },
            { status: 500 }
        )
    }
}

