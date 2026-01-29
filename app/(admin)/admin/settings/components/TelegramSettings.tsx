'use client'

import { MessageSquare, CheckCircle2, AlertCircle, Info, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TelegramSettingsProps {
    isTelegramConfigured: boolean
    isSendingTest: boolean
    onTestTelegram: () => Promise<void>
}

export default function TelegramSettings({
                                             isTelegramConfigured,
                                             isSendingTest,
                                             onTestTelegram
                                         }: TelegramSettingsProps) {
    return (
        <Card className="booking-card border-2">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold break-words">
                            Настройки Telegram
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">
                            Уведомления и интеграция с ботом
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Статус */}
                <div className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 shadow-lg ${
                    isTelegramConfigured
                        ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                        : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                }`}>
                    <div className="flex items-start gap-3">
                        {isTelegramConfigured ? (
                            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="text-base sm:text-lg font-bold text-gray-900 break-words">
                                Статус: {isTelegramConfigured ? '✅ Настроен' : '❌ Не настроен'}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                {isTelegramConfigured
                                    ? 'Бот подключен и готов отправлять уведомления'
                                    : 'Требуется настройка переменных окружения'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Инструкция */}
                <div className="bg-blue-50/50 border-2 border-blue-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <span>Инструкция по настройке</span>
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-gray-700">
                        <li className="leading-relaxed">Создайте бота через <code className="bg-white px-2 py-0.5 rounded font-mono text-blue-600 text-xs">@BotFather</code></li>
                        <li className="leading-relaxed">Скопируйте токен бота</li>
                        <li className="leading-relaxed">Узнайте свой Chat ID через <code className="bg-white px-2 py-0.5 rounded font-mono text-blue-600 text-xs">@userinfobot</code></li>
                        <li className="leading-relaxed">
                            Добавьте переменные в <code className="bg-white px-2 py-0.5 rounded font-mono text-xs">.env.local</code>:
                            <pre className="bg-white/80 p-3 rounded-lg mt-2 text-xs font-mono border border-blue-200 overflow-x-auto">
{`TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_ADMIN_CHAT_ID=ваш_chat_id`}
                            </pre>
                        </li>
                        <li className="leading-relaxed">Перезапустите приложение</li>
                    </ol>
                </div>

                {/* Тестирование */}
                {isTelegramConfigured && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">Тестирование подключения</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                            Отправьте тестовое уведомление, чтобы проверить работу бота
                        </p>
                        <Button
                            onClick={onTestTelegram}
                            disabled={isSendingTest}
                            variant="default"
                            className="shadow-xl h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                        >
                            <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            {isSendingTest ? 'Отправка...' : 'Отправить тестовое уведомление'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}