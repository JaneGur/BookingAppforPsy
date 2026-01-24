import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')
        const activeOnly = searchParams.get('active_only') === 'true'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '5')
        const sortBy = searchParams.get('sort_by') || 'created_at'
        const sortOrder = searchParams.get('sort_order') || 'desc'

        const offset = (page - 1) * limit

        let query = supabase
            .from('clients')
            .select('*', { count: 'exact' })
            .order(sortBy, { ascending: sortOrder === 'asc' })

        // Фильтр только активных клиентов (у которых есть записи)
        if (activeOnly) {
            // Получаем клиентов, у которых есть хотя бы одна запись
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('client_id')
                .not('client_id', 'is', null)

            const clientIds = [...new Set(bookingsData?.map((b) => b.client_id).filter(Boolean) || [])]
            if (clientIds.length > 0) {
                query = query.in('id', clientIds)
            } else {
                // Если нет записей, возвращаем пустой результат
                return NextResponse.json({
                    data: [],
                    pagination: {
                        page,
                        limit,
                        totalCount: 0,
                        hasMore: false,
                        totalPages: 0
                    }
                })
            }
        }

        // Применяем пагинацию
        query = query.range(offset, offset + limit - 1)

        const { data, error, count } = await query

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Поиск по имени, телефону, email (на клиенте)
        let filteredData = data ?? []
        if (search) {
            const searchLower = search.toLowerCase()
            filteredData = filteredData.filter(
                (client) =>
                    client.name?.toLowerCase().includes(searchLower) ||
                    client.phone?.includes(search) ||
                    client.email?.toLowerCase().includes(searchLower) ||
                    client.telegram?.toLowerCase().includes(searchLower)
            )
        }

        const totalCount = count || 0
        const hasMore = offset + limit < totalCount

        return NextResponse.json({
            data: filteredData,
            pagination: {
                page,
                limit,
                totalCount,
                hasMore,
                totalPages: Math.ceil(totalCount / limit)
            }
        })
    } catch (error) {
        console.error('Ошибка при получении клиентов:', error)
        return NextResponse.json(
            { error: 'Не удалось получить клиентов' },
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
        const { name, phone, email, telegram, password } = body

        // Валидация
        if (!name || !phone || !password) {
            return NextResponse.json(
                { error: 'Заполните все обязательные поля: имя, телефон, пароль' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Пароль должен содержать минимум 6 символов' },
                { status: 400 }
            )
        }

        // Проверяем, что клиента с таким телефоном еще нет
        const phoneHash = crypto.createHash('sha256').update(phone).digest('hex')
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('phone_hash', phoneHash)
            .single()

        if (existingClient) {
            return NextResponse.json(
                { error: 'Клиент с таким номером телефона уже существует' },
                { status: 400 }
            )
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10)

        // Создаем клиента
        const { data: newClient, error } = await supabase
            .from('clients')
            .insert({
                name,
                phone,
                phone_hash: phoneHash,
                email: email || null,
                telegram: telegram || null,
                password: hashedPassword,
                role: 'client',
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(newClient, { status: 201 })
    } catch (error) {
        console.error('Ошибка при создании клиента:', error)
        return NextResponse.json(
            { error: 'Не удалось создать клиента' },
            { status: 500 }
        )
    }
}
