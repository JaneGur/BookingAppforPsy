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

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Валидация
        if (!body.name || body.price_rub === undefined) {
            return NextResponse.json(
                { error: 'Название и цена обязательны' },
                { status: 400 }
            )
        }

        // Создаем продукт
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name: body.name,
                    sku: body.sku,
                    description: body.description,
                    price_rub: body.price_rub,
                    is_active: body.is_active ?? true,
                    is_package: body.is_package ?? false,
                    sessions_count: body.sessions_count,
                    is_featured: body.is_featured ?? false,
                    sort_order: body.sort_order ?? 0,
                    discount_percent: body.discount_percent,
                    has_special_categories_discount: body.has_special_categories_discount ?? false,
                    bulk_discount_threshold: body.bulk_discount_threshold,
                    bulk_discount_percent: body.bulk_discount_percent,
                    promo_text: body.promo_text,
                },
            ])
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Ошибка при создании продукта:', error)
        return NextResponse.json(
            { error: 'Не удалось создать продукт' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.id) {
            return NextResponse.json({ error: 'ID продукта обязателен' }, { status: 400 })
        }

        // Обновляем продукт
        const { data, error } = await supabase
            .from('products')
            .update({
                name: body.name,
                sku: body.sku,
                description: body.description,
                price_rub: body.price_rub,
                is_active: body.is_active,
                is_package: body.is_package,
                sessions_count: body.sessions_count,
                is_featured: body.is_featured,
                sort_order: body.sort_order,
                discount_percent: body.discount_percent,
                has_special_categories_discount: body.has_special_categories_discount,
                bulk_discount_threshold: body.bulk_discount_threshold,
                bulk_discount_percent: body.bulk_discount_percent,
                promo_text: body.promo_text,
                updated_at: new Date().toISOString(),
            })
            .eq('id', body.id)
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error)
        return NextResponse.json(
            { error: 'Не удалось обновить продукт' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.id) {
            return NextResponse.json({ error: 'ID продукта обязателен' }, { status: 400 })
        }

        // Деактивируем продукт вместо удаления
        const { error } = await supabase
            .from('products')
            .update({ is_active: false, updated_at: new Date().toISOString() })
            .eq('id', body.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error)
        return NextResponse.json(
            { error: 'Не удалось удалить продукт' },
            { status: 500 }
        )
    }
}
