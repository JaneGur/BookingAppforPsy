// app/api/profile/telegram/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabase } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Отключаем Telegram (очищаем chat_id и username)
        const { error } = await supabase
            .from('clients')
            .update({
                telegram_chat_id: null,
                telegram: null,
            })
            .eq('id', session.user.id);

        if (error) {
            console.error('Error disconnecting Telegram:', error);
            return NextResponse.json({ 
                error: 'Ошибка отключения Telegram' 
            }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            message: 'Telegram успешно отключен' 
        });
    } catch (error) {
        console.error('Error disconnecting Telegram:', error);
        return NextResponse.json({ 
            error: 'Ошибка сервера' 
        }, { status: 500 });
    }
}
