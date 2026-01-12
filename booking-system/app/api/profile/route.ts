import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/db'

export async function GET() {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, phone_hash, telegram, telegram_chat_id, created_at, updated_at')
        .eq('id', session.user.id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
    const session = await auth()

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json().catch(() => null)) as {
        name?: string
        email?: string
        telegram?: string
    } | null

    const name = (body?.name ?? '').trim()
    const email = (body?.email ?? '').trim().toLowerCase()
    const telegram = (body?.telegram ?? '').trim()

    if (!name) {
        return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 })
    }

    const update: Record<string, unknown> = {
        name,
        updated_at: new Date().toISOString(),
    }

    update.email = email || null
    update.telegram = telegram || null

    const { data, error } = await supabase
        .from('clients')
        .update(update)
        .eq('id', session.user.id)
        .select('id, name, email, phone, phone_hash, telegram, telegram_chat_id, created_at, updated_at')
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
