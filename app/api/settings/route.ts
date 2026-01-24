import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
        return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json(data)
}
