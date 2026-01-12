import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Только админ или сам клиент может обновлять
        const { id } = await params
        const isAdmin = session.user.role === 'admin'
        const isOwnProfile = session.user.id === id

        if (!isAdmin && !isOwnProfile) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { name, email, telegram } = body

        const updateData: any = {
            updated_at: new Date().toISOString(),
        }

        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email || null
        if (telegram !== undefined) updateData.telegram = telegram || null

        const { data, error } = await supabase
            .from('clients')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Ошибка при обновлении клиента:', error)
        return NextResponse.json(
            { error: 'Не удалось обновить клиента' },
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

