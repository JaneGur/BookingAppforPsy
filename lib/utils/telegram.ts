/**
 * Утилита для отправки уведомлений в Telegram
 */
import {format, parseISO} from "date-fns";
import {ru} from "date-fns/locale";

interface TelegramMessage {
    text: string;
    parse_mode?: 'Markdown' | 'HTML';
}

/**
 * Отправляет уведомление администратору в Telegram
 */
export async function sendAdminNotification(message: string): Promise<boolean> {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        if (!botToken || !adminChatId) {
            console.warn('⚠️ Telegram не настроен (TELEGRAM_BOT_TOKEN или TELEGRAM_ADMIN_CHAT_ID отсутствуют)');
            return false;
        }

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const payload: TelegramMessage = {
            text: message,
            parse_mode: 'HTML',
        };

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: adminChatId,
                ...payload,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Ошибка отправки в Telegram:', errorData);
            return false;
        }

        console.log('✅ Уведомление в Telegram отправлено успешно');
        return true;
    } catch (error) {
        console.error('❌ Ошибка при отправке уведомления в Telegram:', error);
        return false;
    }
}

/**
 * Отправляет уведомление клиенту в Telegram
 */
export async function sendClientNotification(chatId: string, message: string): Promise<boolean> {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            console.warn('⚠️ Telegram не настроен (TELEGRAM_BOT_TOKEN отсутствует)');
            return false;
        }

        if (!chatId) {
            console.warn('⚠️ Chat ID клиента не указан');
            return false;
        }

        const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const payload: TelegramMessage = {
            text: message,
            parse_mode: 'HTML',
        };

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                ...payload,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Ошибка отправки клиенту в Telegram:', errorData);
            return false;
        }

        console.log('✅ Уведомление клиенту в Telegram отправлено успешно');
        return true;
    } catch (error) {
        console.error('❌ Ошибка при отправке уведомления клиенту в Telegram:', error);
        return false;
    }
}

/**
 * Форматирует уведомление о новой записи
 */
export function formatNewBookingNotification(data: {
    id: number;
    client_name: string;
    client_phone: string;
    client_email?: string;
    booking_date: string;
    booking_time: string;
    product_name?: string;
    product_description?: string;
    amount: number;
}): string {
    const { id, client_name, client_phone, client_email, booking_date, booking_time, product_name, product_description, amount } = data;

    return `
🆕 <b>НОВАЯ ЗАПИСЬ #${id}</b>

👤 <b>Клиент:</b> ${client_name}
📞 <b>Телефон:</b> ${client_phone}
${client_email ? `📧 <b>Email:</b> ${client_email}\n` : ''}
📅 <b>Дата:</b> ${booking_date}
⏰ <b>Время:</b> ${booking_time}
${product_name ? `🎯 <b>Услуга:</b> ${product_name}\n` : ''}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}
💰 <b>Сумма:</b> ${amount.toLocaleString('ru-RU')} ₽
`.trim();
}

/**
 * Форматирует уведомление об отмене записи
 */
export function formatCancelBookingNotification(data: {
    id: number;
    client_name: any;
    booking_date: any;
    booking_time: any;
    cancelled_by: string
    product_description?: string;
}): string {
    const { id, client_name, booking_date, booking_time, product_description } = data;

    return `
❌ <b>ЗАПИСЬ ОТМЕНЕНА #${id}</b>

👤 <b>Клиент:</b> ${client_name}
📅 <b>Дата:</b> ${booking_date}
⏰ <b>Время:</b> ${booking_time}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}
`.trim();
}

/**
 * Форматирует уведомление о переносе записи
 */
export function formatRescheduleBookingNotification(data: {
    id: number;
    client_name: string;
    old_date: string;
    old_time: string;
    new_date: string;
    new_time: string;
    product_description?: string;
}): string {
    const { id, client_name, old_date, old_time, new_date, new_time, product_description } = data;

    return `
🔄 <b>ЗАПИСЬ ПЕРЕНЕСЕНА #${id}</b>

👤 <b>Клиент:</b> ${client_name}

<b>Было:</b>
📅 ${old_date} ⏰ ${old_time}

<b>Стало:</b>
📅 ${new_date} ⏰ ${new_time}
${product_description ? `\n📝 <b>Описание:</b> ${product_description}` : ''}
`.trim();
}

/**
 * Форматирует уведомление об удалении записи
 */
export function formatDeleteBookingNotification(data: {
    id: number;
    client_name: string;
    booking_date: string;
    booking_time: string;
    product_description?: string;
}): string {
    const { id, client_name, booking_date, booking_time, product_description } = data;

    return `
🗑️ <b>ЗАПИСЬ УДАЛЕНА #${id}</b>

👤 <b>Клиент:</b> ${client_name}
📅 <b>Дата:</b> ${booking_date}
⏰ <b>Время:</b> ${booking_time}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}
`.trim();
}

/**
 * Форматирует уведомление о сообщении с главной страницы
 */
export function formatContactFormNotification(data: {
    name: string;
    phone?: string;
    email?: string;
    message: string;
}): string {
    const { name, phone, email, message } = data;

    return `
✉️ <b>НОВОЕ СООБЩЕНИЕ С САЙТА</b>

👤 <b>Имя:</b> ${name}
${phone ? `📞 <b>Телефон:</b> ${phone}\n` : ''}
${email ? `📧 <b>Email:</b> ${email}\n` : ''}
💬 <b>Сообщение:</b>
${message}
`.trim();
}

/**
 * Форматирует уведомление об изменении статуса
 */
export function formatStatusChangeNotification(data: {
    id: number;
    client_name: string;
    old_status: string;
    new_status: string;
    booking_date: string;
    booking_time: string;
    product_description?: string;
}): string {
    const { id, client_name, old_status, new_status, booking_date, booking_time, product_description } = data;

    const statusLabels: Record<string, string> = {
        pending_payment: '⏳ Ожидает оплаты',
        confirmed: '✅ Подтверждена',
        completed: '🎉 Завершена',
        cancelled: '❌ Отменена',
    };

    return `
🔔 <b>СТАТУС ЗАПИСИ ИЗМЕНЁН #${id}</b>

👤 <b>Клиент:</b> ${client_name}
📅 <b>Дата:</b> ${booking_date}
⏰ <b>Время:</b> ${booking_time}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}

<b>Было:</b> ${statusLabels[old_status] || old_status}
<b>Стало:</b> ${statusLabels[new_status] || new_status}
`.trim();
}

/**
 * Форматирует напоминание админу о записи через 1 час
 */
export function formatBookingReminderNotification(data: {
    id: number;
    client_name: string;
    client_phone: string;
    client_email?: string;
    booking_time: string;
    product_name?: string;
    product_description?: string;
}): string {
    const { id, client_name, client_phone, client_email, booking_time, product_name, product_description } = data;

    return `
⏰ <b>НАПОМИНАНИЕ: ЗАПИСЬ ЧЕРЕЗ 1 ЧАС!</b>

📋 <b>Запись #${id}</b>
⏰ <b>Время:</b> ${booking_time} (через ~1 час)
${product_name ? `🎯 <b>Услуга:</b> ${product_name}\n` : ''}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}
👤 <b>Клиент:</b> ${client_name}
📞 <b>Телефон:</b> ${client_phone}
${client_email ? `📧 <b>Email:</b> ${client_email}\n` : ''}
<i>Подготовьтесь к консультации 📝</i>
`.trim();
}

/**
 * Форматирует напоминание клиенту о записи
 */
export function formatClientReminderNotification(data: {
    booking_date: string;
    booking_time: string;
    product_name?: string;
    product_description?: string;
    hoursUntil: number;
}): string {
    const { booking_date, booking_time, product_name, product_description, hoursUntil } = data;
    const timeText = hoursUntil === 24 ? 'завтра' : 'через 1 час';

    return `
🔔 <b>Напоминание о записи</b>

📅 <b>Дата:</b> ${booking_date}
⏰ <b>Время:</b> ${booking_time}
${product_name ? `🎯 <b>Услуга:</b> ${product_name}\n` : ''}
${product_description ? `📝 <b>Описание:</b> ${product_description}\n` : ''}
⏳ <b>До консультации:</b> ${timeText}

Увидимся на консультации! 👋
`.trim();
}

// Добавляем в существующий файл

export async function sendRescheduleNotification(
    bookingId: number,
    clientName: string,
    clientPhone: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string,
    productName?: string,
    productDescription?: string,
    rescheduledBy: 'admin' | 'client' = 'client'
) {
    // Форматируем даты для читаемого отображения
    const oldDateFormatted = format(parseISO(oldDate), 'd MMMM yyyy', { locale: ru })
    const newDateFormatted = format(parseISO(newDate), 'd MMMM yyyy', { locale: ru })

    const message = `🔄 <b>Запись перенесена!</b>\n\n` +
        `📋 <b>ID:</b> ${bookingId}\n` +
        `👤 <b>Клиент:</b> ${clientName}\n` +
        `📞 <b>Телефон:</b> ${clientPhone}\n\n` +
        `⏰ <b>Было:</b> ${oldDateFormatted} ${oldTime}\n` +
        `⏰ <b>Стало:</b> ${newDateFormatted} ${newTime}\n\n` +
        `${productName ? `🎯 <b>Услуга:</b> ${productName}\n` : ''}` +
        `${productDescription ? `📝 <b>Описание:</b> ${productDescription}\n` : ''}` +
        `👤 <b>Перенес:</b> ${rescheduledBy === 'admin' ? 'Администратор' : 'Клиент'}`

    return await sendAdminNotification(message)
}

/**
 * Форматирует уведомление о переносе записи для администратора
 */
export function formatRescheduleNotification(
    bookingId: number,
    clientName: string,
    clientPhone: string,
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string,
    productName?: string,
    productDescription?: string,
    rescheduledBy: 'admin' | 'client' = 'client'
) {
    const oldDateFormatted = format(parseISO(oldDate), 'd MMMM yyyy', { locale: ru })
    const newDateFormatted = format(parseISO(newDate), 'd MMMM yyyy', { locale: ru })

    const message = `🔄 <b>Запись перенесена!</b>\n\n` +
        `📋 <b>ID:</b> ${bookingId}\n` +
        `👤 <b>Клиент:</b> ${clientName}\n` +
        `📞 <b>Телефон:</b> ${clientPhone}\n\n` +
        `⏰ <b>Было:</b> ${oldDateFormatted} ${oldTime}\n` +
        `⏰ <b>Стало:</b> ${newDateFormatted} ${newTime}\n\n` +
        `${productName ? `🎯 <b>Услуга:</b> ${productName}\n` : ''}` +
        `${productDescription ? `📝 <b>Описание:</b> ${productDescription}\n` : ''}` +
        `👤 <b>Перенес:</b> ${rescheduledBy === 'admin' ? 'Администратор' : 'Клиент'}\n` +
        `🕐 <b>Время изменения:</b> ${format(new Date(), 'd MMMM yyyy HH:mm', { locale: ru })}`

    return message
}

/**
 * Форматирует уведомление о переносе записи для клиента
 */
export function formatClientRescheduleNotification(
    oldDate: string,
    oldTime: string,
    newDate: string,
    newTime: string,
    productName?: string,
    productDescription?: string,
    psychologistName: string = 'психолога'
) {
    const oldDateFormatted = format(parseISO(oldDate), 'd MMMM yyyy', { locale: ru })
    const newDateFormatted = format(parseISO(newDate), 'd MMMM yyyy', { locale: ru })

    const message = `🔄 <b>Ваша запись перенесена!</b>\n\n` +
        `⏰ <b>Было:</b> ${oldDateFormatted} ${oldTime}\n` +
        `⏰ <b>Стало:</b> ${newDateFormatted} ${newTime}\n\n` +
        `${productName ? `🎯 <b>Услуга:</b> ${productName}\n` : ''}` +
        `${productDescription ? `📝 <b>Описание:</b> ${productDescription}\n` : ''}` +
        `✅ Запись успешно обновлена.\n\n` +
        `💡 <i>Если у вас возникли вопросы или вы хотите перенести запись повторно, пожалуйста, свяжитесь с администратором.</i>`

    return message
}

/**
 * Форматирует уведомление о невозможности переноса для клиента
 */
export function formatRescheduleDeclinedNotification(
    bookingDate: string,
    bookingTime: string,
    reason: string,
    productName?: string,
    productDescription?: string
) {
    const dateFormatted = format(parseISO(bookingDate), 'd MMMM yyyy', { locale: ru })

    const message = `⛔ <b>Запрос на перенос отклонен</b>\n\n` +
        `📅 <b>Запись:</b> ${dateFormatted} ${bookingTime}\n` +
        `${productName ? `🎯 <b>Услуга:</b> ${productName}\n` : ''}` +
        `${productDescription ? `📝 <b>Описание:</b> ${productDescription}\n` : ''}\n` +
        `❌ <b>Причина:</b> ${reason}\n\n` +
        `ℹ️ <i>Перенос возможен только за 24 часа до консультации.\n` +
        `Если вам нужно изменить время, пожалуйста, свяжитесь с администратором.</i>`

    return message
}

/**
 * Форматирует уведомление об успешном переносе с деталями
 */
export function formatRescheduleSuccessNotification(
    bookingDetails: {
        id: number;
        clientName: string;
        clientPhone: string;
        oldDate: string;
        oldTime: string;
        newDate: string;
        newTime: string;
        productName?: string;
        productDescription?: string;
        amount?: number;
    },
    rescheduledBy: 'admin' | 'client'
) {
    const oldDateFormatted = format(parseISO(bookingDetails.oldDate), 'd MMMM yyyy', { locale: ru })
    const newDateFormatted = format(parseISO(bookingDetails.newDate), 'd MMMM yyyy', { locale: ru })

    const message = `✅ <b>Перенос успешно выполнен</b>\n\n` +
        `📋 <b>ID записи:</b> ${bookingDetails.id}\n` +
        `👤 <b>Клиент:</b> ${bookingDetails.clientName}\n` +
        `📞 <b>Телефон:</b> ${bookingDetails.clientPhone}\n\n` +
        `⏰ <b>Было:</b> ${oldDateFormatted} ${bookingDetails.oldTime}\n` +
        `⏰ <b>Стало:</b> ${newDateFormatted} ${bookingDetails.newTime}\n\n` +
        `${bookingDetails.productName ? `🎯 <b>Услуга:</b> ${bookingDetails.productName}\n` : ''}` +
        `${bookingDetails.productDescription ? `📝 <b>Описание:</b> ${bookingDetails.productDescription}\n` : ''}` +
        `${bookingDetails.amount ? `💰 <b>Сумма:</b> ${bookingDetails.amount.toLocaleString('ru-RU')} ₽\n` : ''}` +
        `👤 <b>Инициатор:</b> ${rescheduledBy === 'admin' ? 'Администратор' : 'Клиент'}\n` +
        `🕐 <b>Время изменения:</b> ${format(new Date(), 'd MMMM yyyy HH:mm', { locale: ru })}`

    return message
}
