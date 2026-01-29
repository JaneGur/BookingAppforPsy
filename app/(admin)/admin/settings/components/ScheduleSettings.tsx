'use client'

import {useMemo} from 'react'
import {AlertCircle, Calendar, Clock, Info, Save} from 'lucide-react'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {calculateSchedulePreview, calculateWorkingHours, validateSchedule} from '../utils/schedule-utils'

interface ScheduleSettingsProps {
    workStart: string
    workEnd: string
    sessionDuration: number
    onWorkStartChange: (value: string) => void
    onWorkEndChange: (value: string) => void
    onSessionDurationChange: (value: number) => void
    onSave: () => Promise<void>
    isSaving: boolean
    error?: string | null
    success?: string | null
}

export default function ScheduleSettings({
                                             workStart,
                                             workEnd,
                                             sessionDuration,
                                             onWorkStartChange,
                                             onWorkEndChange,
                                             onSessionDurationChange,
                                             onSave,
                                             isSaving,
                                             error,
                                             success
                                         }: ScheduleSettingsProps) {
    const schedulePreview = useMemo(
        () => calculateSchedulePreview(workStart, workEnd, sessionDuration),
        [workStart, workEnd, sessionDuration]
    )

    const workingHours = useMemo(
        () => calculateWorkingHours(workStart, workEnd),
        [workStart, workEnd]
    )

    const validationError = validateSchedule(workStart, workEnd, sessionDuration)
    const canSave = !validationError && !isSaving

    return (
        <Card className="booking-card border-2">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold break-words">
                            Настройки расписания
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">
                            Рабочие часы и длительность консультаций
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>Начало рабочего дня *</span>
                        </label>
                        <Input
                            type="time"
                            value={workStart}
                            onChange={(e) => onWorkStartChange(e.target.value)}
                            required
                            className="h-11 sm:h-12 text-base sm:text-lg font-mono w-full"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>Конец рабочего дня *</span>
                        </label>
                        <Input
                            type="time"
                            value={workEnd}
                            onChange={(e) => onWorkEndChange(e.target.value)}
                            required
                            className="h-11 sm:h-12 text-base sm:text-lg font-mono w-full"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>Длительность сессии (мин) *</span>
                        </label>
                        <Input
                            type="number"
                            value={sessionDuration}
                            onChange={(e) => onSessionDurationChange(Number(e.target.value))}
                            min="5"
                            max="180"
                            step="5"
                            required
                            className="h-11 sm:h-12 text-base sm:text-lg font-mono w-full"
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                            <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                            <span>От 5 до 180 минут (рекомендуется кратно 5)</span>
                        </p>
                    </div>
                </div>

                {/* Предпросмотр расписания */}
                <div className="booking-card border-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                        <span>Предпросмотр расписания</span>
                    </h3>
                    {schedulePreview.error ? (
                        <div className="flex items-start gap-2 text-red-700 bg-red-100 p-3 rounded-lg text-xs sm:text-sm">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                            <span>{schedulePreview.error}</span>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4">
                                <div className="bg-white/80 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">Всего слотов</div>
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">{schedulePreview.count}</div>
                                </div>
                                <div className="bg-white/80 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-sm">
                                    <div className="text-xs text-gray-600 mb-1">Рабочих часов</div>
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                        {workingHours.toFixed(1)}
                                    </div>
                                </div>
                                <div className="bg-white/80 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-blue-200 shadow-sm col-span-2 md:col-span-1">
                                    <div className="text-xs text-gray-600 mb-1">Интервал</div>
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                        {sessionDuration}<span className="text-sm sm:text-base md:text-lg">мин</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                    Примеры временных слотов:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {schedulePreview.slots.map((slot, i) => (
                                        <div
                                            key={i}
                                            className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-white border-2 border-blue-300 rounded-lg font-mono text-xs sm:text-sm font-bold text-blue-700 shadow-sm"
                                        >
                                            {slot}
                                        </div>
                                    ))}
                                    {schedulePreview.count > 10 && (
                                        <div className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600">
                                            ...и еще {schedulePreview.count - 10}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {validationError && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm font-medium">{validationError}</p>
                    </div>
                )}

                <Button
                    onClick={onSave}
                    disabled={!canSave}
                    className="shadow-xl h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                >
                    <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {isSaving ? 'Сохранение...' : 'Сохранить расписание'}
                </Button>
            </CardContent>
        </Card>
    )
}