import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotification } from '@/lib/utils/telegram'

interface NotificationPayload {
    chat_id?: string;
    message: string;
}

/**
 * API эндпоинт для отправки уведомлений в Telegram.
 * Если chat_id не указан, отправляет админу.
 */
export async function POST(request: NextRequest) {
    try {
        const body: NotificationPayload = await request.json()
        const { message } = body

        if (!message) {
            return NextResponse.json({ error: 'Сообщение обязательно' }, { status: 400 })
        }

        // Всегда отправляем админу (chat_id игнорируется, используется TELEGRAM_ADMIN_CHAT_ID из .env)
        const success = await sendAdminNotification(message);

        if (!success) {
            return NextResponse.json(
                { error: 'Telegram не настроен или произошла ошибка при отправке' }, 
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Уведомление успешно отправлено в Telegram' 
        });
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error)
        return NextResponse.json({ error: 'Не удалось отправить уведомление' }, { status: 500 })
    }
}