// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function POST(req: NextRequest) {
    console.log('=== CONTACT FORM SUBMISSION START ===');

    try {
        const { name, email, phone, message } = await req.json();

        console.log('Received form data:', { name, email, phone, message });

        // Валидация
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Пожалуйста, укажите ваше имя' },
                { status: 400 }
            );
        }

        if (!email || !email.trim()) {
            return NextResponse.json(
                { error: 'Пожалуйста, укажите ваш email' },
                { status: 400 }
            );
        }

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: 'Пожалуйста, напишите сообщение' },
                { status: 400 }
            );
        }

        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Пожалуйста, укажите корректный email адрес' },
                { status: 400 }
            );
        }

        // Получаем переменные окружения
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        console.log('Telegram config:', {
            hasBotToken: !!botToken,
            hasChatId: !!chatId
        });

        if (!botToken || !chatId) {
            console.error('Missing Telegram configuration');
            return NextResponse.json(
                { error: 'Ошибка конфигурации сервера' },
                { status: 500 }
            );
        }

        // Форматируем сообщение для Telegram
        const telegramMessage = `
📬 *НОВОЕ СООБЩЕНИЕ С САЙТА*

*👤 Имя:* ${name.trim()}
*📧 Email:* ${email.trim()}
*📞 Телефон:* ${phone ? phone.trim() : 'не указан'}

*💬 Сообщение:*
${message.trim()}

---
🕐 *Отправлено:* ${new Date().toLocaleString('ru-RU')}
        `.trim();

        console.log('Sending to Telegram:', telegramMessage);

        // Отправляем в Telegram
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await axios.post(telegramUrl, {
            chat_id: chatId,
            text: telegramMessage,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
        });

        console.log('Telegram response:', response.data);

        if (!response.data.ok) {
            console.error('Telegram API error:', response.data);
            return NextResponse.json(
                { error: 'Не удалось отправить сообщение в Telegram' },
                { status: 500 }
            );
        }

        // Также можно отправить уведомление клиенту на email (опционально)
        // (используя ваш существующий Resend setup)

        console.log('=== CONTACT FORM SUBMISSION SUCCESS ===');

        return NextResponse.json({
            success: true,
            message: 'Сообщение успешно отправлено! Я свяжусь с вами в ближайшее время.'
        });

    } catch (error) {
        console.error('Contact form error:', error);

        // Типизируем ошибку
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error('Axios error details:', {
                message: axiosError.message,
                response: axiosError.response?.data,
                status: axiosError.response?.status
            });

            return NextResponse.json(
                {
                    error: 'Ошибка соединения с Telegram API',
                    details: process.env.NODE_ENV === 'development' ? axiosError.message : undefined
                },
                { status: 500 }
            );
        }

        // Обработка других ошибок
        const err = error as Error;
        return NextResponse.json(
            {
                error: 'Произошла ошибка при отправке сообщения',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            },
            { status: 500 }
        );
    }
}