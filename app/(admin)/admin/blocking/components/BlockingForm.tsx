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
        <Card className="booking-card">
            <CardHeader>
                <CardTitle>Новая блокировка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Дата *</label>
                        <Input
                            type="date"
                            value={formData.selectedDate || ''}
                            onChange={(e) => handleChange('selectedDate', e.target.value)}
                            min={format(today, 'yyyy-MM-dd')}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Время</label>
                        <Input
                            type="time"
                            value={formData.selectedTime || ''}
                            onChange={(e) => handleChange('selectedTime', e.target.value)}
                            placeholder="Оставьте пустым для блокировки всего дня"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Оставьте пустым, чтобы заблокировать весь день
                        </p>
                    </div>
                    <div className="sm:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Причина</label>
                        <Input
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder="Причина блокировки (необязательно)"
                        />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={onCancel} className="flex-1">
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.selectedDate || isSubmitting}
                        className="flex-1"
                        size="lg"
                    >
                        {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}