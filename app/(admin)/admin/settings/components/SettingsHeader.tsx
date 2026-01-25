'use client'

import { Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsHeader() {
    return (
        <Card className="booking-card border-2">
            <CardContent className="p-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Settings className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Настройки системы
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Управление конфигурацией и параметрами</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}