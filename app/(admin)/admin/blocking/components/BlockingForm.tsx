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
        <Card className="booking-card border-0 shadow-lg sm:border sm:shadow-sm">
            <CardHeader className="pb-3 pt-6">
                <CardTitle className="text-lg font-bold text-gray-900">Новая блокировка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Дата *</label>
                        <Input
                            type="date"
                            value={formData.selectedDate || ''}
                            onChange={(e) => handleChange('selectedDate', e.target.value)}
                            min={format(today, 'yyyy-MM-dd')}
                            required
                            className="h-12 text-base"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Время</label>
                        <Input
                            type="time"
                            value={formData.selectedTime || ''}
                            onChange={(e) => handleChange('selectedTime', e.target.value)}
                            placeholder="Оставьте пустым для блокировки всего дня"
                            className="h-12 text-base"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Оставьте пустым, чтобы заблокировать весь день
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Причина (необязательно)</label>
                        <Input
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder="Причина блокировки"
                            className="h-12 text-base"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.selectedDate || isSubmitting}
                        className="w-full h-12 text-base font-medium"
                        size="lg"
                    >
                        {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        className="w-full h-11 text-base sm:hidden"
                    >
                        Отмена
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}