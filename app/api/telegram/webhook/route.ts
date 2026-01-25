// app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Проверяем, что это сообщение
        if (!body.message) {
            return NextResponse.json({ ok: true });
        }

        const { message } = body;
        const chatId = message.chat.id;
        const text = message.text;
        const username = message.from?.username;

        // Проверяем, что это команда /start с токеном
        if (!text || !text.startsWith('/start ')) {
            return NextResponse.json({ ok: true });
        }

        // Извлекаем токен
        const token = text.split(' ')[1];

        if (!token) {
            // Отправляем сообщение пользователю
            await sendTelegramMessage(chatId,
                '⚠️ Для подключения используйте ссылку из личного кабинета.'
            );
            return NextResponse.json({ ok: true });
        }

        const supabase = createServiceRoleSupabaseClient();

        // Ищем токен в базе
        const { data: tokenData, error: tokenError } = await supabase
            .from('telegram_connection_tokens')
            .select('client_id, expires_at, used')
            .eq('token', token)
            .maybeSingle();

        if (tokenError || !tokenData) {
            await sendTelegramMessage(chatId,
                '❌ Неверная ссылка подключения. Запросите новую ссылку в личном кабинете.'
            );
            return NextResponse.json({ ok: true });
        }

        // Проверяем срок действия
        if (new Date(tokenData.expires_at) < new Date()) {
            await sendTelegramMessage(chatId,
                '⏰ Ссылка устарела. Запросите новую ссылку в личном кабинете.'
            );
            return NextResponse.json({ ok: true });
        }

        // Проверяем, не использован ли токен
        if (tokenData.used) {
            await sendTelegramMessage(chatId,
                '⚠️ Эта ссылка уже была использована.'
            );
            return NextResponse.json({ ok: true });
        }

        // Обновляем клиента - сохраняем chat_id
        const { error: updateError } = await supabase
            .from('clients')
            .update({
                telegram_chat_id: chatId.toString(),
                telegram: username || null,
            })
            .eq('id', tokenData.client_id);

        if (updateError) {
            console.error('Error updating client:', updateError);
            await sendTelegramMessage(chatId,
                '❌ Ошибка подключения. Попробуйте позже.'
            );
            return NextResponse.json({ ok: true });
        }

        // Помечаем токен как использованный
        await supabase
            .from('telegram_connection_tokens')
            .update({ used: true })
            .eq('token', token);

        // Отправляем подтверждение
        await sendTelegramMessage(chatId,
            '✅ <b>Telegram успешно подключен!</b>\n\n' +
            '🔔 Теперь вы будете получать уведомления о записях здесь.\n\n' +
            '💡 Чтобы отключить уведомления, зайдите в личный кабинет.'
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json({ ok: true });
    }
}

// Вспомогательная функция для отправки сообщений
async function sendTelegramMessage(chatId: number, text: string): Promise<boolean> {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            console.warn('TELEGRAM_BOT_TOKEN not set');
            return false;
        }

        const response = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: 'HTML',
                }),
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error sending Telegram message:', error);
        return false;
    }
}