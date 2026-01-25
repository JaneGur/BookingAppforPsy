import { Resend } from 'resend';
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import { render } from '@react-email/render';
import ResetPasswordEmail from "@/components/emails/ResetPasswordEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeEmailParams {
    to: string;
    userName: string;
}

interface SendPasswordResetEmailProps {
    to: string;
    userName: string;
    resetToken: string;
}

export async function sendWelcomeEmail({ to, userName }: SendWelcomeEmailParams) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Спокойные люди <onboarding@resend.dev>',
            to: [to],
            subject: '🌿 Добро пожаловать! Ваш аккаунт создан',
            react: WelcomeEmail({
                userName,
                userEmail: to,
                loginUrl: `https://booking-app-for-psy.vercel.app/login`,
            }),
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error };
        }

        console.log('✅ Welcome email sent:', data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('Email send exception:', error);
        return { success: false, error };
    }
}

export async function sendBookingConfirmationEmail({
                                                       to,
                                                       userName,
                                                       bookingDate,
                                                       bookingTime,
                                                   }: {
    to: string;
    userName: string;
    bookingDate: string;
    bookingTime: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Спокойные люди <onboarding@resend.dev>',
            to: [to],
            subject: '✅ Запись подтверждена!',
            html: `
                <h1>Здравствуйте, ${userName}!</h1>
                <p>Ваша запись успешно подтверждена:</p>
                <p><strong>📅 Дата:</strong> ${bookingDate}</p>
                <p><strong>🕐 Время:</strong> ${bookingTime}</p>
                <p>Мы отправим вам напоминание за день до консультации.</p>
                <p>С уважением,<br/>Ваш арт-терапевт Анна</p>
            `,
        });

        if (error) {
            console.error('Booking email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Booking email exception:', error);
        return { success: false, error };
    }
}

export async function sendBookingCreatedEmail({
                                                 to,
                                                 userName,
                                                 bookingDate,
                                                 bookingTime,
                                                 productName,
                                                 productDescription,
                                                 amount,
                                             }: {
    to: string;
    userName: string;
    bookingDate: string;
    bookingTime: string;
    productName: string;
    productDescription?: string;
    amount: number;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Арт-терапия <onboarding@resend.dev>',
            to: [to],
            subject: '🆕 Запись создана',
            html: `
                <h2>Здравствуйте, ${userName}!</h2>
                <p>Ваша запись успешно создана.</p>
                <p><strong>📅 Дата:</strong> ${bookingDate}</p>
                <p><strong>🕐 Время:</strong> ${bookingTime}</p>
                <p><strong>🎯 Услуга:</strong> ${productName}</p>
                ${productDescription ? `<p><strong>📝 Описание:</strong> ${productDescription}</p>` : ''}
                <p><strong>💰 Сумма:</strong> ${amount.toLocaleString('ru-RU')} ₽</p>
                <p>Мы отправим напоминания перед консультацией.</p>
            `,
        });

        if (error) {
            console.error('Booking created email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Booking created email exception:', error);
        return { success: false, error };
    }
}

export async function sendBookingStatusEmail({
                                                to,
                                                userName,
                                                bookingDate,
                                                bookingTime,
                                                productName,
                                                productDescription,
                                                statusLabel,
                                                subject,
                                            }: {
    to: string;
    userName: string;
    bookingDate: string;
    bookingTime: string;
    productName: string;
    productDescription?: string;
    statusLabel: string;
    subject: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Арт-терапия <onboarding@resend.dev>',
            to: [to],
            subject,
            html: `
                <h2>Здравствуйте, ${userName}!</h2>
                <p><strong>Статус записи:</strong> ${statusLabel}</p>
                <p><strong>📅 Дата:</strong> ${bookingDate}</p>
                <p><strong>🕐 Время:</strong> ${bookingTime}</p>
                <p><strong>🎯 Услуга:</strong> ${productName}</p>
                ${productDescription ? `<p><strong>📝 Описание:</strong> ${productDescription}</p>` : ''}
            `,
        });

        if (error) {
            console.error('Booking status email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Booking status email exception:', error);
        return { success: false, error };
    }
}

export async function sendBookingReminderEmail({
                                                   to,
                                                   userName,
                                                   bookingDate,
                                                   bookingTime,
                                                   productName,
                                                   productDescription,
                                               }: {
    to: string;
    userName: string;
    bookingDate: string;
    bookingTime: string;
    productName: string;
    productDescription?: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Арт-терапия <onboarding@resend.dev>',
            to: [to],
            subject: '⏰ Напоминание о завтрашней консультации',
            html: `
                <!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Напоминание о консультации</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f9fbfa;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 16px;
                            overflow: hidden;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 20px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                        }
                        .header p {
                            margin: 10px 0 0;
                            opacity: 0.9;
                            font-size: 16px;
                        }
                        .content {
                            padding: 40px;
                        }
                        .reminder-icon {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .reminder-icon span {
                            font-size: 48px;
                            display: inline-block;
                        }
                        .booking-details {
                            background: #f8fafc;
                            border-radius: 12px;
                            padding: 24px;
                            margin: 30px 0;
                            border: 1px solid #e2e8f0;
                        }
                        .detail-item {
                            display: flex;
                            align-items: center;
                            margin-bottom: 15px;
                            padding-bottom: 15px;
                            border-bottom: 1px solid #e2e8f0;
                        }
                        .detail-item:last-child {
                            margin-bottom: 0;
                            padding-bottom: 0;
                            border-bottom: none;
                        }
                        .detail-icon {
                            width: 40px;
                            height: 40px;
                            background: #4fa893;
                            border-radius: 10px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-right: 15px;
                            color: white;
                        }
                        .detail-content h3 {
                            margin: 0 0 5px 0;
                            font-size: 16px;
                            color: #64748b;
                        }
                        .detail-content p {
                            margin: 0;
                            font-size: 18px;
                            font-weight: 600;
                            color: #1e293b;
                        }
                        .preparation {
                            background: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 30px 0;
                        }
                        .preparation h3 {
                            color: #92400e;
                            margin-top: 0;
                            margin-bottom: 10px;
                        }
                        .preparation ul {
                            margin: 0;
                            padding-left: 20px;
                            color: #92400e;
                        }
                        .preparation li {
                            margin-bottom: 8px;
                        }
                        .footer {
                            text-align: center;
                            padding-top: 30px;
                            border-top: 1px solid #e2e8f0;
                            color: #64748b;
                            font-size: 14px;
                        }
                        .contact-info {
                            margin-top: 20px;
                            padding: 20px;
                            background: #f1f5f9;
                            border-radius: 12px;
                        }
                        .contact-info a {
                            color: #4fa893;
                            text-decoration: none;
                            font-weight: 500;
                        }
                        .contact-info a:hover {
                            text-decoration: underline;
                        }
                        @media (max-width: 600px) {
                            .content {
                                padding: 20px;
                            }
                            .header h1 {
                                font-size: 24px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⏰ Напоминание</h1>
                            <p>Завтра состоится ваша консультация</p>
                        </div>
                        <div class="content">
                            <div class="reminder-icon">
                                <span>🔔</span>
                            </div>
                            <h2 style="text-align: center; color: #1e293b; margin-bottom: 20px;">
                                Здравствуйте, ${userName}!
                            </h2>
                            <p style="text-align: center; color: #64748b; font-size: 16px; margin-bottom: 30px;">
                                Напоминаем, что завтра состоится ваша консультация. Пожалуйста, проверьте детали ниже.
                            </p>
                            
                            <div class="booking-details">
                                <div class="detail-item">
                                    <div class="detail-icon">📅</div>
                                    <div class="detail-content">
                                        <h3>Дата</h3>
                                        <p>${bookingDate}</p>
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-icon">🕐</div>
                                    <div class="detail-content">
                                        <h3>Время</h3>
                                        <p>${bookingTime}</p>
                                    </div>
                                </div>
                                <div class="detail-item">
                                    <div class="detail-icon">🎯</div>
                                    <div class="detail-content">
                                        <h3>Тип консультации</h3>
                                        <p>${productName}</p>
                                        ${productDescription ? `<p style="margin: 8px 0 0; color: #475569; font-size: 14px;">${productDescription}</p>` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="preparation">
                                <h3>📋 Подготовка к сессии:</h3>
                                <ul>
                                    <li>Проверьте стабильность интернет-соединения</li>
                                    <li>Подготовьте тихое и комфортное место</li>
                                    <li>Можете заранее подумать о вопросах или темах для обсуждения</li>
                                    <li>Приготовьте бумагу и художественные материалы (если потребуется)</li>
                                </ul>
                            </div>
                            
                            <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                                <h3 style="color: #1e40af; margin-top: 0;">💡 Важно</h3>
                                <p style="color: #1e40af; margin-bottom: 0;">
                                    Консультация проходит онлайн. Ссылка для подключения будет отправлена за 15 минут до начала.
                                </p>
                            </div>
                            
                            <div class="contact-info">
                                <h3 style="margin-top: 0; color: #334155;">Нужна помощь?</h3>
                                <p style="margin-bottom: 10px;">
                                    Если у вас возникли вопросы или нужно перенести консультацию, пожалуйста, свяжитесь со мной:
                                </p>
                                <p style="margin-bottom: 5px;">
                                    📧 Email: <a href="mailto:spokludi@yandex.ru">spokludi@yandex.ru</a>
                                </p>
                                <p style="margin-bottom: 0;">
                                    📱 Telegram: <a href="https://t.me/arts_psi" target="_blank">@arts_psi</a>
                                </p>
                            </div>
                        </div>
                        <div class="footer">
                            <p>С уважением,<br><strong>Анна</strong><br>Ваш арт-терапевт</p>
                            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                                Это автоматическое напоминание. Пожалуйста, не отвечайте на это письмо.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Booking reminder email error:', error);
            return { success: false, error };
        }

        console.log('✅ Booking reminder email sent:', data?.id);
        return { success: true, data };
    } catch (error) {
        console.error('Booking reminder email exception:', error);
        return { success: false, error };
    }
}

export async function sendPasswordResetEmail({
                                                 to,
                                                 userName,
                                                 resetToken,
                                             }: SendPasswordResetEmailProps) {
    const resetUrl = `https://booking-app-for-psy.vercel.app/reset-password?token=${resetToken}`;

    try {
        // Создаем props для компонента
        const emailProps = {
            userName,
            resetUrl,
        };

        // Рендерим React-компонент в HTML
        const html = await render(ResetPasswordEmail(emailProps));

        const { data, error } = await resend.emails.send({
            from: 'Арт-терапия <onboarding@resend.dev>',
            to: [to],
            subject: '🔐 Восстановление пароля',
            html,
        });

        if (error) {
            console.error('Reset email error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Reset email exception:', error);
        return { success: false, error };
    }
}