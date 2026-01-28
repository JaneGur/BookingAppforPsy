'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfDay } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BlockingForm from './components/BlockingForm'
import BlockingCalendar from './components/BlockingCalendar'
import BlockingList from './components/BlockingList'
import { BlockedSlot, BlockingFormData } from './components/types'
import {
    groupSlotsByDate,
    fetchBlockedSlots,
    createBlockedSlot,
    deleteBlockedSlot
} from './utils/blocking-utils'

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
                {/* Заголовок и кнопка */}
                <div className="mb-4 sm:mb-6 lg:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="text-2xl sm:text-3xl">🚫</span>
                                <span>Блокировки</span>
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600">
                                Управление заблокированными днями и слотами
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all duration-200 h-11 sm:h-12 text-base font-medium"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Добавить блокировку
                        </Button>
                    </div>
                </div>

                {/* Форма */}
                {showForm && (
                    <div className="mb-4 sm:mb-6 animate-in slide-in-from-top duration-300">
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
                    </div>
                )}

                {/* Календарь и Список */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Календарь */}
                    <div className="order-1">
                        <BlockingCalendar
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            slotsByDate={slotsByDate}
                            onDateSelect={handleDateSelect}
                            today={today}
                        />
                    </div>

                    {/* Список */}
                    <div className="order-2">
                        <BlockingList
                            isLoading={isLoading}
                            blockedSlots={blockedSlots}
                            onDelete={handleDelete}
                            onDeleteAll={handleDeleteAll}
                            slotsByDate={slotsByDate}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}