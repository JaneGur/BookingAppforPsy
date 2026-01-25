// app/api/cron/send-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { sendBookingReminderEmail } from '@/lib/emails/email';
import { sendAdminNotification, sendClientNotification, formatBookingReminderNotification, formatClientReminderNotification } from '@/lib/utils/telegram';
import { addDays, addHours, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BookingWithProduct {
    id: number;
    booking_date: string;
    booking_time: string;
    client_name: string;
    client_phone: string;
    client_email: string | null;
    status: string;
    paid_at: string | null;
    reminder_24h_sent: boolean;
    reminder_1h_sent: boolean;
    products: {
        name: string;
        description?: string;
    } | null;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        // 1. Проверка Authorization
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error('❌ Unauthorized cron request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🔔 Starting reminder cron job...');

        const now = new Date();
        const results = {
            reminders_24h: [] as any[],
            reminders_1h: [] as any[],
        };

        // ============================================
        // НАПОМИНАНИЯ ЗА 24 ЧАСА (на завтра)
        // ============================================

        const tomorrow = addDays(now, 1);
        const tomorrowDate = format(tomorrow, 'yyyy-MM-dd');

        console.log('📅 Looking for 24h reminders on:', tomorrowDate);

        const { data: bookings24h, error: error24h } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_date,
                booking_time,
                client_name,
                client_email,
                telegram_chat_id,
                status,
                paid_at,
                reminder_24h_sent,
                products (
                    name,
                    description
                )
            `)
            .eq('booking_date', tomorrowDate)
            .eq('status', 'confirmed')
            .eq('reminder_24h_sent', false)
            .not('paid_at', 'is', null)
            .returns<BookingWithProduct[]>();

        if (error24h) {
            console.error('❌ Error fetching 24h bookings:', error24h);
        } else {
            console.log(`📊 Found ${bookings24h?.length || 0} bookings for 24h reminders`);

            for (const booking of bookings24h || []) {
                try {
                    let emailSent = false;
                    let telegramSent = false;

                    // Отправляем email клиенту (если есть email)
                    if (booking.client_email) {
                        const bookingDateFormatted = format(
                            parseISO(booking.booking_date),
                            'd MMMM yyyy (EEEE)',
                            { locale: ru }
                        );

                        const emailResult = await sendBookingReminderEmail({
                            to: booking.client_email,
                            userName: booking.client_name,
                            bookingDate: bookingDateFormatted,
                            bookingTime: booking.booking_time,
                            productName: (booking.products as any)?.name || 'Консультация',
                            productDescription: (booking.products as any)?.description || undefined,
                        });

                        if (emailResult.success) {
                            emailSent = true;
                            console.log(`✅ 24h email reminder sent for booking #${booking.id}`);
                        } else {
                            console.error(`❌ Failed 24h email reminder for booking #${booking.id}:`, emailResult.error);
                        }
                    }

                    // Отправляем уведомление в Telegram клиенту (если подключен)
                    if ((booking as any).telegram_chat_id) {
                        const bookingDateFormatted = format(
                            parseISO(booking.booking_date),
                            'd MMMM yyyy',
                            { locale: ru }
                        );

                        const telegramMessage = formatClientReminderNotification({
                            booking_date: bookingDateFormatted,
                            booking_time: booking.booking_time,
                            product_name: (booking.products as any)?.name || 'Консультация',
                            product_description: (booking.products as any)?.description || undefined,
                            hoursUntil: 24,
                        });

                        const telegramResult = await sendClientNotification(
                            (booking as any).telegram_chat_id,
                            telegramMessage
                        );

                        if (telegramResult) {
                            telegramSent = true;
                            console.log(`✅ 24h Telegram reminder sent to client for booking #${booking.id}`);
                        } else {
                            console.error(`❌ Failed 24h Telegram reminder to client for booking #${booking.id}`);
                        }
                    }

                    // Помечаем, что напоминание отправлено (если хотя бы одно успешно)
                    if (emailSent || telegramSent) {
                        await supabase
                            .from('bookings')
                            .update({
                                reminder_24h_sent: true,
                                reminder_24h_sent_at: new Date().toISOString(),
                            })
                            .eq('id', booking.id);

                        console.log(`✅ 24h reminder marked as sent for booking #${booking.id}`);
                        results.reminders_24h.push({
                            bookingId: booking.id,
                            status: 'sent',
                            email: booking.client_email || null,
                            emailSent,
                            telegramSent,
                        });
                    } else {
                        console.error(`❌ Both email and telegram failed for booking #${booking.id}`);
                        results.reminders_24h.push({
                            bookingId: booking.id,
                            status: 'failed',
                            error: 'Both email and telegram failed',
                        });
                    }
                } catch (error) {
                    console.error(`❌ Exception 24h reminder for booking #${booking.id}:`, error);
                    results.reminders_24h.push({
                        bookingId: booking.id,
                        status: 'failed',
                        error: String(error),
                    });
                }
            }
        }

        // ============================================
        // НАПОМИНАНИЯ ЗА 1 ЧАС (сегодня через 1-2 часа)
        // ============================================

        const todayDate = format(now, 'yyyy-MM-dd');
        const in1Hour = addHours(now, 1);
        const in2Hours = addHours(now, 2);

        const timeFrom = format(in1Hour, 'HH:mm:ss');
        const timeTo = format(in2Hours, 'HH:mm:ss');

        console.log(`⏰ Looking for 1h reminders today between ${timeFrom} and ${timeTo}`);

        const { data: bookings1h, error: error1h } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_date,
                booking_time,
                client_name,
                client_phone,
                client_email,
                telegram_chat_id,
                status,
                paid_at,
                reminder_1h_sent,
                products (
                    name,
                    description
                )
            `)
            .eq('booking_date', todayDate)
            .eq('status', 'confirmed')
            .eq('reminder_1h_sent', false)
            .gte('booking_time', timeFrom)
            .lt('booking_time', timeTo)
            .not('paid_at', 'is', null)
            .returns<BookingWithProduct[]>();

        if (error1h) {
            console.error('❌ Error fetching 1h bookings:', error1h);
        } else {
            console.log(`📊 Found ${bookings1h?.length || 0} bookings for 1h reminders`);

            for (const booking of bookings1h || []) {
                try {
                    let emailSent = false;
                    let telegramSent = false;

                    // Отправляем email клиенту (если есть email)
                    if (booking.client_email) {
                        const emailResult = await sendBookingReminderEmail({
                            to: booking.client_email,
                            userName: booking.client_name,
                            bookingDate: 'сегодня',
                            bookingTime: booking.booking_time,
                            productName: (booking.products as any)?.name || 'Консультация',
                            productDescription: (booking.products as any)?.description || undefined,
                        });

                        if (emailResult.success) {
                            emailSent = true;
                            console.log(`✅ 1h email reminder sent to client for booking #${booking.id}`);
                        } else {
                            console.error(`❌ Failed 1h email reminder for booking #${booking.id}:`, emailResult.error);
                        }
                    } else {
                        console.log(`⚠️ Booking #${booking.id}: No client email, skipping email reminder`);
                    }

                    // Отправляем уведомление в Telegram клиенту (если подключен)
                    if ((booking as any).telegram_chat_id) {
                        const telegramMessage = formatClientReminderNotification({
                            booking_date: 'сегодня',
                            booking_time: booking.booking_time,
                            product_name: (booking.products as any)?.name || 'Консультация',
                            product_description: (booking.products as any)?.description || undefined,
                            hoursUntil: 1,
                        });

                        const clientTelegramResult = await sendClientNotification(
                            (booking as any).telegram_chat_id,
                            telegramMessage
                        );

                        if (clientTelegramResult) {
                            telegramSent = true;
                            console.log(`✅ 1h Telegram reminder sent to client for booking #${booking.id}`);
                        } else {
                            console.error(`❌ Failed 1h Telegram reminder to client for booking #${booking.id}`);
                        }
                    }

                    // Отправляем уведомление админу в Telegram
                    const telegramMessage = formatBookingReminderNotification({
                        id: booking.id,
                        client_name: booking.client_name,
                        client_phone: booking.client_phone || 'Не указан',
                        client_email: booking.client_email || undefined,
                        booking_time: booking.booking_time,
                        product_name: (booking.products as any)?.name || 'Консультация',
                        product_description: (booking.products as any)?.description || undefined,
                    });

                    const telegramResult = await sendAdminNotification(telegramMessage);
                    
                    if (telegramResult) {
                        telegramSent = true;
                        console.log(`✅ 1h Telegram reminder sent to admin for booking #${booking.id}`);
                    } else {
                        console.error(`❌ Failed to send 1h Telegram reminder to admin for booking #${booking.id}`);
                    }

                    // Помечаем, что напоминание отправлено (если хотя бы одно успешно)
                    if (emailSent || telegramSent) {
                        await supabase
                            .from('bookings')
                            .update({
                                reminder_1h_sent: true,
                                reminder_1h_sent_at: new Date().toISOString(),
                            })
                            .eq('id', booking.id);

                        console.log(`✅ 1h reminder marked as sent for booking #${booking.id}`);
                        results.reminders_1h.push({
                            bookingId: booking.id,
                            status: 'sent',
                            email: booking.client_email,
                            emailSent,
                            telegramSent,
                        });
                    } else {
                        console.error(`❌ Both email and telegram failed for booking #${booking.id}`);
                        results.reminders_1h.push({
                            bookingId: booking.id,
                            status: 'failed',
                            error: 'Both email and telegram failed',
                        });
                    }
                } catch (error) {
                    console.error(`❌ Exception 1h reminder for booking #${booking.id}:`, error);
                    results.reminders_1h.push({
                        bookingId: booking.id,
                        status: 'failed',
                        error: String(error),
                    });
                }
            }
        }

        // ============================================
        // ИТОГИ
        // ============================================

        const summary = {
            success: true,
            timestamp: now.toISOString(),
            reminders_24h: {
                total: bookings24h?.length || 0,
                sent: results.reminders_24h.filter(r => r.status === 'sent').length,
                failed: results.reminders_24h.filter(r => r.status === 'failed').length,
                details: results.reminders_24h,
            },
            reminders_1h: {
                total: bookings1h?.length || 0,
                sent: results.reminders_1h.filter(r => r.status === 'sent').length,
                failed: results.reminders_1h.filter(r => r.status === 'failed').length,
                details: results.reminders_1h,
            },
        };

        console.log('✅ Cron job completed:', summary);

        return NextResponse.json(summary, { status: 200 });
    } catch (error) {
        console.error('❌ Cron job exception:', error);
        return NextResponse.json(
            {
                error: 'Cron job failed',
                message: String(error),
            },
            { status: 500 }
        );
    }
}