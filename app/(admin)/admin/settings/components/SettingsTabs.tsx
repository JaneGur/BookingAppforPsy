'use client'

import { Clock, FileText, MessageSquare, Lock, File } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { TabKey } from './types'

interface SettingsTabsProps {
    activeTab: TabKey
    onTabChange: (tab: TabKey) => void
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
    const tabs = [
        { key: 'schedule' as TabKey, label: 'Расписание', icon: Clock },
        { key: 'info' as TabKey, label: 'Инфо-панель', icon: FileText },
        { key: 'telegram' as TabKey, label: 'Telegram', icon: MessageSquare },
        { key: 'documents' as TabKey, label: 'Документы', icon: File },
        { key: 'password' as TabKey, label: 'Пароль', icon: Lock },
    ]

    return (
        <Card className="booking-card border-2">
            <CardContent className="p-2 sm:p-4">
                {/* Мобильная версия с горизонтальной прокруткой */}
                <div className="flex sm:hidden overflow-x-auto gap-2 pb-1 -mx-2 px-2 scrollbar-hide">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => onTabChange(key)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2.5 rounded-lg transition-all text-xs font-bold shadow-md hover:shadow-lg flex-shrink-0',
                                activeTab === key
                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                            )}
                        >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Десктопная версия с переносом */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => onTabChange(key)}
                            className={cn(
                                'flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5',
                                activeTab === key
                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="whitespace-nowrap">{label}</span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}