'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ExternalLink, Loader2, MessageSquare, RefreshCw } from 'lucide-react';

interface TelegramConnectProps {
    telegramChatId: string | null;
    telegramUsername: string | null;
    onUpdate?: () => void;
}

export function TelegramConnect({ 
    telegramChatId, 
    telegramUsername,
    onUpdate 
}: TelegramConnectProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [telegramLink, setTelegramLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(!!telegramChatId);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Синхронизируем состояние подключения с пропсами
    useEffect(() => {
        setIsConnected(!!telegramChatId);
    }, [telegramChatId]);

    // Автоматически проверяем статус каждые 5 секунд, если есть активная ссылка
    useEffect(() => {
        if (!telegramLink) return;

        const interval = setInterval(() => {
            if (onUpdate && !isConnected) {
                onUpdate();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [telegramLink, isConnected, onUpdate]);

    const handleConnect = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/profile/telegram/connect', {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ошибка создания ссылки');
                return;
            }

            setTelegramLink(data.telegramLink);
            
            // Открываем ссылку в новом окне
            window.open(data.telegramLink, '_blank');
        } catch (err) {
            setError('Ошибка подключения');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Вы уверены, что хотите отключить Telegram?')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/profile/telegram/disconnect', {
                method: 'POST',
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Ошибка отключения');
                return;
            }

            setIsConnected(false);
            setTelegramLink(null);
            if (onUpdate) onUpdate();
        } catch (err) {
            setError('Ошибка отключения');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckStatus = async () => {
        setIsCheckingStatus(true);
        setError(null);
        
        try {
            if (onUpdate) {
                await onUpdate();
            }
            
            // Если подключение успешно, скрываем ссылку
            if (telegramChatId) {
                console.log('tg успешно')
                setTelegramLink(null);
            }
        } catch (err) {
            console.log('tg не успешно')
            setError('Ошибка проверки статуса');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <Card className="booking-card border-2">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Уведомления в Telegram</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Получайте напоминания о записях</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Статус подключения */}
                <div className={`flex items-center gap-3 p-4 rounded-xl ${
                    isConnected 
                        ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200'
                }`}>
                    {isConnected ? (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-green-400 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-green-900 text-lg">Telegram подключен ✅</p>
                                {telegramUsername && (
                                    <p className="text-sm text-green-700 font-medium">@{telegramUsername}</p>
                                )}
                                <p className="text-xs text-green-600 mt-1">
                                    Вы получаете уведомления о записях
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-xl bg-gray-300 flex items-center justify-center flex-shrink-0">
                                <XCircle className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 text-lg">Telegram не подключен</p>
                                <p className="text-sm text-gray-600">
                                    Подключите для получения уведомлений
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Ошибка */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800 font-medium">{error}</p>
                    </div>
                )}

                {/* Ссылка для подключения */}
                {telegramLink && !isConnected && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl space-y-3 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">✨</span>
                            <div className="flex-1">
                                <p className="text-sm text-blue-900 font-bold mb-2">
                                    Ссылка создана!
                                </p>
                                <p className="text-xs text-blue-700 mb-3">
                                    Нажмите кнопку ниже, чтобы открыть Telegram и подключить бота. После подключения нажмите "Проверить статус".
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <a
                                        href={telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.016.093.036.305.02.471z"/>
                                        </svg>
                                        Открыть в Telegram
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <Button
                                        variant="secondary"
                                        onClick={handleCheckStatus}
                                        disabled={isCheckingStatus}
                                        size="sm"
                                        className="inline-flex items-center gap-2"
                                    >
                                        {isCheckingStatus ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                        Проверить статус
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Кнопки */}
                <div className="flex gap-3">
                    {isConnected ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={handleCheckStatus}
                                disabled={isCheckingStatus}
                                size="lg"
                                className="flex-1"
                            >
                                {isCheckingStatus ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Обновить статус
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                size="lg"
                                className="flex-1"
                            >
                                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Отключить Telegram
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={handleConnect}
                            disabled={isLoading}
                            size="lg"
                            className="flex-1"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Создание ссылки...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.016.093.036.305.02.471z"/>
                                    </svg>
                                    Подключить Telegram
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Информация */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 p-5 rounded-2xl">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">💡</span>
                        Что это дает?
                    </h4>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">•</span>
                            <span><strong>Напоминания</strong> о записях за 1 час до консультации</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span><strong>Уведомления</strong> об изменении статуса записи</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-500 font-bold">•</span>
                            <span><strong>Подтверждения</strong> новых записей</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
