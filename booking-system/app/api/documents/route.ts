import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const docType = searchParams.get('doc_type')

    let query = supabase.from('documents').select('*').eq('is_active', true)

    if (docType) {
        query = query.eq('doc_type', docType)
    }

    const { data, error } = await query.order('id', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}
