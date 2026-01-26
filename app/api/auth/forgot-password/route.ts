// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import {sendPasswordResetEmail} from "@/lib/emails/email";


export async function POST(req: NextRequest) {
    try {
        const body = (await req.json().catch(() => null)) as { email?: string; phone?: string } | null;

        const email = body?.email?.trim().toLowerCase();
        const phone = body?.phone?.trim();

        if (!email && !phone) {
            return NextResponse.json({ error: 'Укажите email или телефон' }, { status: 400 });
        }

        const supabase = createServiceRoleSupabaseClient();

        // Ищем пользователя (case-insensitive для email)
        let query = supabase
            .from('clients')
            .select('id, email, phone, name');

        if (email) {
            query = query.ilike('email', email);
        } else if (phone) {
            query = query.eq('phone', phone);
        }

        const { data: user, error: userError } = await query.maybeSingle();

        console.log('🔍 User search result:', {
            found: !!user,
            hasEmail: !!user?.email,
            email: user?.email
        });

        if (userError) {
            console.error('Supabase error:', userError);
            return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
        }

        // Даже если пользователь не найден, возвращаем успех (безопасность)
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Генерируем токен
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Сохраняем токен в таблицу password_reset_tokens
        const { error: tokenError } = await supabase
            .from('password_reset_tokens')
            .insert({
                client_id: user.id,
                token: resetToken,
                expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 час
                created_at: new Date().toISOString(),
            });

        if (tokenError) {
            console.error('Supabase insert token error:', tokenError);
            return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
        }

        // Отправляем письмо
        if (user.email) {
            console.log('📧 Attempting to send email to:', user.email); // ← Добавьте
            const result = await sendPasswordResetEmail({
                to: user.email,
                userName: user.name || 'Клиент',
                resetToken,
            });
            console.log('📧 Email send result:', result); // ← Добавьте

            if (!result.success) {
                console.error('❌ Failed to send email:', result.error); // ← Добавьте
            }
        } else {
            console.log('⚠️ User has no email, token:', resetToken);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password exception:', error);
        return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
    }
}
