'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ExternalLink, Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// 🔧 АДАПТИВНАЯ КНОПКА для этого компонента
function ResponsiveButton({
                              children,
                              icon,
                              size = "default",
                              variant = "default",
                              className = "",
                              ...props
                          }: any) {
    return (
        <Button
            size={size}
            variant={variant}
            className={cn(
                "transition-all duration-300",
                size === "lg" && "h-10 md:h-12 px-3 md:px-4 text-sm md:text-base",
                size === "default" && "h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm",
                size === "sm" && "h-8 md:h-9 px-2 md:px-3 text-xs",
                className
            )}
            {...props}
        >
            {icon && <span className="mr-1 md:mr-2 flex-shrink-0">{icon}</span>}
            <span className="truncate">{children}</span>
        </Button>
    )
}

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
                setTelegramLink(null);
            }
        } catch (err) {
            setError('Ошибка проверки статуса');
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <Card className="booking-card border-2 p-3 md:p-6">
            <CardHeader className="p-0 md:p-0">
                <div className="flex items-start md:items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg md:text-xl lg:text-2xl truncate">Уведомления в Telegram</CardTitle>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1 truncate">
                            Получайте напоминания о записях
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 md:space-y-6 p-0 mt-4 md:mt-6">
                {/* Статус подключения */}
                <div className={cn(
                    "flex items-start md:items-center gap-3 p-3 md:p-4 rounded-xl",
                    isConnected
                        ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-2 border-gray-200'
                )}>
                    {isConnected ? (
                        <>
                            <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-green-400 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-green-900 text-sm md:text-base lg:text-lg truncate">
                                    Telegram подключен ✅
                                </p>
                                {telegramUsername && (
                                    <p className="text-xs md:text-sm text-green-700 font-medium truncate">
                                        @{telegramUsername}
                                    </p>
                                )}
                                <p className="text-xs text-green-600 mt-0.5 md:mt-1 truncate">
                                    Вы получаете уведомления о записях
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl bg-gray-300 flex items-center justify-center flex-shrink-0">
                                <XCircle className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm md:text-base lg:text-lg truncate">
                                    Telegram не подключен
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 truncate">
                                    Подключите для получения уведомлений
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Ошибка */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-200 p-3 md:p-4 rounded-xl flex items-start gap-2 md:gap-3 animate-[fadeIn_0.3s_ease-out]">
                        <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs md:text-sm text-red-800 font-medium truncate">{error}</p>
                    </div>
                )}

                {/* Ссылка для подключения */}
                {telegramLink && !isConnected && (
                    <div className="bg-blue-50 border-2 border-blue-200 p-3 md:p-4 rounded-xl space-y-2 md:space-y-3 animate-[fadeIn_0.3s_ease-out]">
                        <div className="flex items-start gap-2 md:gap-3">
                            <span className="text-xl md:text-2xl flex-shrink-0">✨</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base text-blue-900 font-bold mb-1 md:mb-2 truncate">
                                    Ссылка создана!
                                </p>
                                <p className="text-xs text-blue-700 mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">
                                    Нажмите кнопку ниже, чтобы открыть Telegram и подключить бота. После подключения нажмите "Проверить статус".
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <a
                                        href={telegramLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs md:text-sm font-semibold transition-colors text-center"
                                    >
                                        <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.016.093.036.305.02.471z"/>
                                        </svg>
                                        <span className="truncate">Открыть в Telegram</span>
                                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    </a>
                                    <ResponsiveButton
                                        variant="secondary"
                                        onClick={handleCheckStatus}
                                        disabled={isCheckingStatus}
                                        size="sm"
                                        className="w-full sm:w-auto"
                                        icon={isCheckingStatus ?
                                            <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin flex-shrink-0" /> :
                                            <RefreshCw className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                        }
                                    >
                                        Проверить статус
                                    </ResponsiveButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                    {isConnected ? (
                        <>
                            <ResponsiveButton
                                variant="secondary"
                                onClick={handleCheckStatus}
                                disabled={isCheckingStatus}
                                size="lg"
                                className="flex-1"
                                icon={isCheckingStatus ? (
                                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
                                )}
                            >
                                Обновить статус
                            </ResponsiveButton>
                            <ResponsiveButton
                                variant="secondary"
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                size="lg"
                                className="flex-1"
                                icon={isLoading && <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />}
                            >
                                Отключить Telegram
                            </ResponsiveButton>
                        </>
                    ) : (
                        <ResponsiveButton
                            onClick={handleConnect}
                            disabled={isLoading}
                            size="lg"
                            className="w-full"
                            icon={isLoading ? (
                                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                            ) : (
                                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.788.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.016.093.036.305.02.471z"/>
                                </svg>
                            )}
                        >
                            {isLoading ? 'Создание ссылки...' : 'Подключить Telegram'}
                        </ResponsiveButton>
                    )}
                </div>

                {/* Информация */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl">
                    <h4 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3 flex items-center gap-2">
                        <span className="text-lg md:text-xl">💡</span>
                        <span>Что это дает?</span>
                    </h4>
                    <ul className="text-xs md:text-sm text-gray-700 space-y-1.5 md:space-y-2">
                        <li className="flex items-start gap-1 md:gap-2">
                            <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                            <span className="truncate"><strong>Напоминания</strong> о записях за 1 час до консультации</span>
                        </li>
                        <li className="flex items-start gap-1 md:gap-2">
                            <span className="text-green-500 font-bold flex-shrink-0">•</span>
                            <span className="truncate"><strong>Уведомления</strong> об изменении статуса записи</span>
                        </li>
                        <li className="flex items-start gap-1 md:gap-2">
                            <span className="text-purple-500 font-bold flex-shrink-0">•</span>
                            <span className="truncate"><strong>Подтверждения</strong> новых записей</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}