'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
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
            <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl">Новая блокировка</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onCancel}
                        className="sm:hidden h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Дата *</label>
                        <Input
                            type="date"
                            value={formData.selectedDate || ''}
                            onChange={(e) => handleChange('selectedDate', e.target.value)}
                            min={format(today, 'yyyy-MM-dd')}
                            required
                            className="h-10"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Время</label>
                        <Input
                            type="time"
                            value={formData.selectedTime || ''}
                            onChange={(e) => handleChange('selectedTime', e.target.value)}
                            placeholder="Оставьте пустым для блокировки всего дня"
                            className="h-10"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">
                            Оставьте пустым, чтобы заблокировать весь день
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Причина</label>
                        <Input
                            value={formData.reason}
                            onChange={(e) => handleChange('reason', e.target.value)}
                            placeholder="Причина блокировки (необязательно)"
                            className="h-10"
                        />
                    </div>
                </div>
                <div className="flex gap-2 sm:gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        className="flex-1 hidden sm:flex"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!formData.selectedDate || isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? 'Блокировка...' : 'Заблокировать'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}