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
        <Card className="booking-card shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">Новая блокировка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    {/* Дата */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                            Дата <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="date"
                            value={formData.selectedDate || ''}
                            onChange={(e) => handleChange('selectedDate', e.target.value)}
                            min={format(today, 'yyyy-MM-dd')}
                            required
                            className="w-full text-base"
                        />
                    </div>

                    {/* Время */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                            Время (необязательно)
                        </label>
                        <Input
                            type="time"
                            value={formData.selectedTime || ''}
                            onChange={(e) => handleChange('selectedTime', e.target.value)}
                            placeholder="Оставьте пустым для блокировки всего дня"
                            className="w-full text-base"
                        />
                        <p className="text-xs text-gray-500 leading-relaxed">
                            💡 Оставьте пустым, чтобы заблокировать весь день
                        </p>
                    </div>

                    {/* Причина */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                            Причина (необязательно)
                        </label>
                        <Input
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder="Например: отпуск, выходной..."
                            className="w-full text-base"
                        />
                    </div>
                </div>

                {/* Кнопки */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        className="w-full sm:flex-1"
                        size="lg"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.selectedDate || isSubmitting}
                        className="w-full sm:flex-1"
                        size="lg"
                    >
                        {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}