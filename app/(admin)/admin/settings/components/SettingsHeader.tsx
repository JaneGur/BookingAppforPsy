'use client'

import { Settings } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsHeader() {
    return (
        <Card className="booking-card border-2">
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Settings className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                        <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 break-words leading-tight">
                            Настройки системы
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-snug">
                            Управление конфигурацией и параметрами
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}