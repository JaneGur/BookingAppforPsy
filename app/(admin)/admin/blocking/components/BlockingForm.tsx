'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BlockingFormData } from './types'

interface BlockingFormProps {
    isSubmitting: boolean
    today: Date
    onSubmit: (data: BlockingFormData) => Promise<void>
    onCancel: () => void
    initialData?: BlockingFormData
}

export default function BlockingForm({
                                         isSubmitting,
                                         today,
                                         onSubmit,
                                         onCancel,
                                         initialData = { selectedDate: null, selectedTime: null, reason: '' }
                                     }: BlockingFormProps) {
    const [formData, setFormData] = useState<BlockingFormData>(initialData)

    const handleSubmit = async () => {
        await onSubmit(formData)
        setFormData({ selectedDate: null, selectedTime: null, reason: '' })
    }

    const handleChange = (field: keyof BlockingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value || null }))
    }

    return (
        <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-900">
                    ✨ Новая блокировка
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
                {/* Дата */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Дата <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="date"
                        value={formData.selectedDate || ''}
                        onChange={(e) => handleChange('selectedDate', e.target.value)}
                        min={format(today, 'yyyy-MM-dd')}
                        required
                        className="h-11 sm:h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                {/* Время */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Время
                    </label>
                    <Input
                        type="time"
                        value={formData.selectedTime || ''}
                        onChange={(e) => handleChange('selectedTime', e.target.value)}
                        placeholder="Оставьте пустым для блокировки всего дня"
                        className="h-11 sm:h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                    <p className="text-xs sm:text-sm text-slate-500 flex items-start gap-1.5">
                        <span className="text-base">💡</span>
                        <span>Оставьте пустым, чтобы заблокировать весь день</span>
                    </p>
                </div>

                {/* Причина */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                        Причина
                    </label>
                    <Input
                        type="text"
                        value={formData.reason || ''}
                        onChange={(e) => handleChange('reason', e.target.value)}
                        placeholder="Причина блокировки (необязательно)"
                        className="h-11 sm:h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                </div>

                {/* Кнопки */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                    <Button
                        onClick={onCancel}
                        variant="secondary"
                        className="w-full sm:flex-1 h-11 sm:h-12 text-base font-medium border-slate-200 hover:bg-slate-50 transition-all"
                        disabled={isSubmitting}
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.selectedDate}
                        className="w-full sm:flex-1 h-11 sm:h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Блокировка...
              </span>
                        ) : (
                            'Заблокировать'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}