'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfDay } from 'date-fns'
import { Plus, Menu, X } from 'lucide-react'
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
    const [mobileView, setMobileView] = useState<'calendar' | 'list'>('calendar')

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
        <div className="booking-page-surface min-h-screen">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <span className="text-red-700 font-bold">🚫</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Блокировки</h1>
                            <p className="text-xs text-gray-600">Управление заблокированными днями</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        size="sm"
                        className="rounded-full h-10 w-10 p-0 sm:hidden"
                    >
                        {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className="hidden sm:flex"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Добавить
                    </Button>
                </div>

                {/* Мобильная навигация между вкладками */}
                <div className="flex mt-4 bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setMobileView('calendar')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mobileView === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                        Календарь
                    </button>
                    <button
                        type="button"
                        onClick={() => setMobileView('list')}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mobileView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
                    >
                        Список ({blockedSlots.length})
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Форма (полноэкранная на мобильных) */}
                {showForm && (
                    <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto sm:static sm:relative sm:bg-transparent sm:inset-auto sm:p-0">
                        <div className="sticky top-0 bg-white pb-4 sm:hidden">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Новая блокировка</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowForm(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
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
                        {showForm && (
                            <div className="mt-4 sm:hidden">
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => setShowForm(false)}
                                >
                                    Отмена
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Календарь */}
                {(mobileView === 'calendar' || !showForm) && (
                    <div className={showForm ? 'hidden sm:block' : ''}>
                        <BlockingCalendar
                            currentMonth={currentMonth}
                            setCurrentMonth={setCurrentMonth}
                            slotsByDate={slotsByDate}
                            onDateSelect={handleDateSelect}
                            today={today}
                        />
                    </div>
                )}

                {/* Список */}
                {(mobileView === 'list' || !showForm) && (
                    <div className={showForm ? 'hidden sm:block' : ''}>
                        <BlockingList
                            isLoading={isLoading}
                            blockedSlots={blockedSlots}
                            onDelete={handleDelete}
                            onDeleteAll={handleDeleteAll}
                            slotsByDate={slotsByDate}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}