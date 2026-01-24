// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/db';

export async function PATCH(req: NextRequest) {
    console.log('=== RESET PASSWORD API CALL START ===');

    try {
        const body = (await req.json().catch((err) => {
            console.error('JSON parse error:', err);
            return null;
        })) as {
            token?: string;
            newPassword?: string;
        } | null;

        console.log('Request body received');

        const token = body?.token?.trim();
        const newPassword = body?.newPassword?.trim();

        if (!token || !newPassword) {
            console.log('Missing token or password:', { token: !!token, password: !!newPassword });
            return NextResponse.json(
                { error: 'Не указан токен или новый пароль' },
                { status: 400 }
            );
        }

        console.log('Token length:', token.length);
        console.log('Token first 30 chars:', token.substring(0, 30));

        // Проверяем токен в БД (ИСПРАВЛЕНО: client_id вместо user_id)
        console.log('Querying Supabase for token...');

        const { data: tokenRecord, error: tokenError } = await supabase
            .from('password_reset_tokens')
            .select('id, client_id, used, expires_at, created_at')
            .eq('token', token)
            .maybeSingle();

        console.log('Supabase response:', {
            hasError: !!tokenError,
            error: tokenError,
            hasData: !!tokenRecord,
            data: tokenRecord
        });

        if (tokenError) {
            console.error('Supabase token query error details:', tokenError);
            return NextResponse.json({
                error: 'Ошибка сервера при проверке токена',
                details: tokenError.message
            }, { status: 500 });
        }

        if (!tokenRecord) {
            console.log('Token not found in database');
            return NextResponse.json({
                error: 'Неверный токен или токен устарел',
                hint: 'Проверьте правильность ссылки или запросите новую'
            }, { status: 400 });
        }

        console.log('Token details:', {
            id: tokenRecord.id,
            clientId: tokenRecord.client_id, // ИСПРАВЛЕНО
            used: tokenRecord.used,
            expiresAt: tokenRecord.expires_at,
            createdAt: tokenRecord.created_at,
            isExpired: new Date(tokenRecord.expires_at) < new Date(),
            isUsed: tokenRecord.used
        });

        if (tokenRecord.used) {
            console.log('Token already used');
            return NextResponse.json({
                error: 'Токен уже использован',
                hint: 'Запросите новую ссылку для сброса пароля'
            }, { status: 400 });
        }

        const now = new Date();
        const expiresAt = new Date(tokenRecord.expires_at);

        if (expiresAt < now) {
            console.log('Token expired:', {
                expiresAt: expiresAt.toISOString(),
                now: now.toISOString(),
                differenceMinutes: Math.floor((now.getTime() - expiresAt.getTime()) / (1000 * 60))
            });
            return NextResponse.json({
                error: 'Ссылка для сброса пароля устарела',
                hint: 'Ссылка действительна 1 час. Запросите новую'
            }, { status: 400 });
        }

        // Проверяем существование клиента
        console.log('Checking if client exists:', tokenRecord.client_id); // ИСПРАВЛЕНО

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('id, email, phone')
            .eq('id', tokenRecord.client_id) // ИСПРАВЛЕНО
            .maybeSingle();

        if (clientError) {
            console.error('Client check error:', clientError);
            return NextResponse.json({
                error: 'Ошибка при проверке клиента'
            }, { status: 500 });
        }

        if (!client) {
            console.log('Client not found with ID:', tokenRecord.client_id); // ИСПРАВЛЕНО
            return NextResponse.json({
                error: 'Клиент не найден'
            }, { status: 400 });
        }

        console.log('Client found:', { email: client.email, phone: client.phone });

        // Хешируем новый пароль
        console.log('Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Password hashed successfully');

        // Обновляем пароль клиента
        console.log('Updating client password for:', client.email);

        const { error: updateError } = await supabase
            .from('clients')
            .update({
                password: hashedPassword,
                updated_at: new Date().toISOString()
            })
            .eq('id', tokenRecord.client_id); // ИСПРАВЛЕНО

        if (updateError) {
            console.error('Supabase update password error details:', updateError);
            return NextResponse.json({
                error: 'Ошибка сервера при обновлении пароля',
                details: updateError.message
            }, { status: 500 });
        }

        console.log('Password updated successfully');

        // Помечаем токен как использованный
        console.log('Marking token as used...');

        const { error: markUsedError } = await supabase
            .from('password_reset_tokens')
            .update({
                used: true,
                used_at: new Date().toISOString()
            })
            .eq('id', tokenRecord.id);

        if (markUsedError) {
            console.error('Supabase mark token used error:', markUsedError);
            console.warn('Warning: Could not mark token as used, but password was updated');
        } else {
            console.log('Token marked as used');
        }

        console.log('=== RESET PASSWORD API CALL SUCCESS ===');

        return NextResponse.json({
            success: true,
            message: 'Пароль успешно изменен'
        }, { status: 200 });

    } catch (error) {
        console.error('Reset password exception:', error);
        console.log('=== RESET PASSWORD API CALL ERROR ===');

        return NextResponse.json({
            error: 'Ошибка сервера',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}