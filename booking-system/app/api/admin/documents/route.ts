import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data ?? [])
    } catch (error) {
        console.error('Ошибка при получении документов:', error)
        return NextResponse.json(
            { error: 'Не удалось получить документы' },
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
        const { doc_type, title, url } = body

        if (!doc_type || !title || !url) {
            return NextResponse.json({ error: 'Все поля обязательны' }, { status: 400 })
        }

        if (!['offer', 'policy'].includes(doc_type)) {
            return NextResponse.json({ error: 'Неверный тип документа' }, { status: 400 })
        }

        // Деактивируем старый активный документ того же типа
        await supabase
            .from('documents')
            .update({ is_active: false })
            .eq('doc_type', doc_type)
            .eq('is_active', true)

        // Создаем новый документ
        const { data, error } = await supabase
            .from('documents')
            .insert([
                {
                    doc_type,
                    title,
                    url,
                    is_active: true,
                },
            ])
            .select('*')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('Ошибка при создании документа:', error)
        return NextResponse.json(
            { error: 'Не удалось создать документ' },
            { status: 500 }
        )
    }
}

