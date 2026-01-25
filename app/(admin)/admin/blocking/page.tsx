'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfDay } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BlockingForm from './components/BlockingForm'
import BlockingCalendar from './components/BlockingCalendar'
import BlockingList from './components/BlockingList'
import { BlockedSlot, BlockingFormData } from './components/types'
import { groupSlotsByDate, fetchBlockedSlots, createBlockedSlot, deleteBlockedSlot } from './utils/blocking-utils'

export default function BlockingPage() {
    const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [selectedDateForForm, setSelectedDateForForm] = useState<string | null>(null)

    const today = startOfDay(new Date())
    const slotsByDate = groupSlotsByDate(blockedSlots)

    const loadBlockedSlots = async () => {
        setIsLoading(true)
        try {
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd')
            const data = await fetchBlockedSlots(startDate, endDate)
            setBlockedSlots(data)
        } catch (error) {
            console.error('Failed to load blocked slots:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadBlockedSlots()
    }, [currentMonth])

    const handleBlock = async (formData: BlockingFormData) => {
        if (!formData.selectedDate) return

        setIsSubmitting(true)
        try {
            const response = await createBlockedSlot({
                slot_date: formData.selectedDate,
                slot_time: formData.selectedTime || undefined,
                reason: formData.reason || undefined,
                block_entire_day: !formData.selectedTime
            })

            if (response.ok) {
                setShowForm(false)
                loadBlockedSlots()
            }
        } catch (error) {
            console.error('Failed to block:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить эту блокировку?')) return
        try {
            await deleteBlockedSlot(id)
            loadBlockedSlots()
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const handleDeleteAll = (date: string, slotIds: number[]) => {
        if (!confirm(`Удалить все блокировки на ${date}?`)) return
        slotIds.forEach(id => handleDelete(id))
    }

    const handleDateSelect = (date: string) => {
        setSelectedDateForForm(date)
        setShowForm(true)
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Заголовок и кнопка */}
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">🚫 Блокировки</h1>
                            <p className="text-sm text-gray-600">Управление заблокированными днями и слотами</p>
                        </div>
                        <Button onClick={() => setShowForm(!showForm)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Добавить блокировку
                        </Button>
                    </div>
                </div>

                {/* Форма */}
                {showForm && (
                    <BlockingForm
                        isSubmitting={isSubmitting}
                        today={today}
                        onSubmit={handleBlock}
                        onCancel={() => {
                            setShowForm(false)
                            setSelectedDateForForm(null)
                        }}
                        initialData={{
                            selectedDate: selectedDateForForm,
                            selectedTime: null,
                            reason: ''
                        }}
                    />
                )}

                {/* Календарь */}
                <BlockingCalendar
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    slotsByDate={slotsByDate}
                    onDateSelect={handleDateSelect}
                    today={today}
                />

                {/* Список */}
                <BlockingList
                    isLoading={isLoading}
                    blockedSlots={blockedSlots}
                    onDelete={handleDelete}
                    onDeleteAll={handleDeleteAll}
                    slotsByDate={slotsByDate}
                />
            </div>
        </div>
    )
}