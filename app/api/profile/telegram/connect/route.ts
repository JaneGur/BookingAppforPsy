// app/api/profile/telegram/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { supabase as anonSupabase } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let supabase = anonSupabase;
        try {
            supabase = createServiceRoleSupabaseClient();
        } catch (error) {
            console.warn('Service role key not set, fallback to anon supabase:', error);
        }

        // Проверяем, не подключен ли уже Telegram
        const { data: client } = await supabase
            .from('clients')
            .select('telegram_chat_id')
            .eq('id', session.user.id)
            .single();

        if (client?.telegram_chat_id) {
            return NextResponse.json({ 
                error: 'Telegram уже подключен' 
            }, { status: 400 });
        }

        // Генерируем уникальный токен
        const token = crypto.randomBytes(32).toString('hex');

        // Сохраняем токен (действителен 1 час)
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 час
        
        const { error: tokenError } = await supabase
            .from('telegram_connection_tokens')
            .insert({
                client_id: session.user.id,
                token,
                expires_at: expiresAt.toISOString(),
            });

        if (tokenError) {
            console.error('Error creating token:', tokenError);
            return NextResponse.json({ 
                error: 'Ошибка создания токена' 
            }, { status: 500 });
        }

        const botUsername = process.env.TELEGRAM_BOT_USERNAME;
        if (!botUsername || botUsername === 'your_bot') {
            return NextResponse.json({
                error: 'Telegram bot не настроен (TELEGRAM_BOT_USERNAME).'
            }, { status: 500 });
        }

        // Формируем ссылку на бота
        const telegramLink = `https://t.me/${botUsername}?start=${token}`;

        return NextResponse.json({
            success: true,
            telegramLink,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Error generating Telegram link:', error);
        return NextResponse.json({ 
            error: 'Ошибка сервера' 
        }, { status: 500 });
    }
}
