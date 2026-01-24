import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST() {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

        if (!botToken || !adminChatId) {
            return NextResponse.json(
                {
                    error: 'Telegram не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID в переменные окружения.',
                },
                { status: 400 }
            )
        }

        // Отправляем тестовое сообщение
        const message = `🔔 Тестовое уведомление

✅ Telegram-бот успешно подключен!

Время: ${new Date().toLocaleString('ru-RU', {
            timeZone: 'Europe/Moscow',
            dateStyle: 'medium',
            timeStyle: 'short',
        })}

Система уведомлений работает корректно.`

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: adminChatId,
                text: message,
                parse_mode: 'HTML',
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Telegram API error:', errorData)
            return NextResponse.json(
                {
                    error: `Ошибка Telegram API: ${errorData.description || 'Неизвестная ошибка'}`,
                },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Тестовое уведомление успешно отправлено',
        })
    } catch (error) {
        console.error('Ошибка при отправке тестового уведомления:', error)
        return NextResponse.json(
            { error: 'Не удалось отправить тестовое уведомление' },
            { status: 500 }
        )
    }
}
