import { NextRequest, NextResponse } from 'next/server'

interface NotificationPayload {
    chat_id: string;
    message: string;
}

/**
 * Имитирует отправку уведомления в Telegram.
 * В реальном приложении здесь будет логика запроса к Telegram Bot API.
 */
export async function POST(request: NextRequest) {
    try {
        const body: NotificationPayload = await request.json()
        const { chat_id, message } = body

        if (!chat_id || !message) {
            return NextResponse.json({ error: 'Необходим ID чата и сообщение' }, { status: 400 })
        }

        console.log(`--- TELEGRAM NOTIFICATION ---`)
        console.log(`Recipient: ${chat_id}`)
        console.log(`Message: ${message}`)
        console.log(`-----------------------------`)

        // Здесь будет реальная логика отправки
        // const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
        // await fetch(telegramApiUrl, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ chat_id, text: message, parse_mode: 'Markdown' })
        // })

        return NextResponse.json({ success: true, message: 'Уведомление успешно отправлено (имитация).' })
    } catch (error) {
        console.error('Ошибка при отправке уведомления:', error)
        return NextResponse.json({ error: 'Не удалось отправить уведомление' }, { status: 500 })
    }
}