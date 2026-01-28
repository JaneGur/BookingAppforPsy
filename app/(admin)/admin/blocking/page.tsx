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
    const [showMobileCalendar, setShowMobileCalendar] = useState(false)

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
        <div className="booking-page-surface min-h-screen p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Заголовок и кнопка - мобильная версия */}
                <div className="booking-card p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h1 className="text-xl font-bold text-gray-900">🚫 Блокировки</h1>
                                <p className="text-xs sm:text-sm text-gray-600">Управление заблокированными слотами</p>
                            </div>
                            <Button
                                onClick={() => setShowForm(!showForm)}
                                size="sm"
                                className="h-9 px-3"
                            >
                                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                <span className="hidden sm:inline">Добавить</span>
                                <span className="sm:hidden">+</span>
                            </Button>
                        </div>

                        {/* Мобильный переключатель календарь/список */}
                        <div className="sm:hidden">
                            <div className="flex rounded-lg border border-gray-200 p-1">
                                <button
                                    type="button"
                                    onClick={() => setShowMobileCalendar(false)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!showMobileCalendar ? 'bg-primary-50 text-primary-700' : 'text-gray-600'}`}
                                >
                                    Список
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowMobileCalendar(true)}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${showMobileCalendar ? 'bg-primary-50 text-primary-700' : 'text-gray-600'}`}
                                >
                                    Календарь
                                </button>
                            </div>
                        </div>
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

                {/* Контент - мобильный/десктоп */}
                <div className="sm:hidden">
                    {showMobileCalendar ? (
                        <BlockingCalendar
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            slotsByDate={slotsByDate}
                            onDateSelect={handleDateSelect}
                            today={today}
                        />
                    ) : (
                        <BlockingList
                            isLoading={isLoading}
                            blockedSlots={blockedSlots}
                            onDelete={handleDelete}
                            onDeleteAll={handleDeleteAll}
                            slotsByDate={slotsByDate}
                        />
                    )}
                </div>

                {/* Десктоп версия */}
                <div className="hidden sm:block space-y-4 sm:space-y-6">
                    <BlockingCalendar
                        currentMonth={currentMonth}
                        setCurrentMonth={setCurrentMonth}
                        slotsByDate={slotsByDate}
                        onDateSelect={handleDateSelect}
                        today={today}
                    />

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
    )
}