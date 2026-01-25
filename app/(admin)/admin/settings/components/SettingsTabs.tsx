'use client'

import { Clock, FileText, MessageSquare, Lock } from 'lucide-react'
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
        { key: 'documents' as TabKey, label: 'Документы', icon: FileText },
        { key: 'password' as TabKey, label: 'Пароль', icon: Lock },
    ]

    return (
        <Card className="booking-card border-2">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                    {tabs.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => onTabChange(key)}
                            className={cn(
                                'flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5',
                                activeTab === key
                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}