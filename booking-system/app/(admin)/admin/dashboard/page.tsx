'use client'

import { useState } from 'react'
import { BookingsTab } from '@/components/admin/BookingsTab'
import { CreateBookingModal } from '@/components/admin/CreateBookingModal'

export default function AdminDashboardPage() {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">📊 Панель администратора</h1>
                            <p className="text-sm text-gray-600">Управление записями, клиентами и настройками системы</p>
                        </div>
                    </div>
                </div>

                <BookingsTab
                    onCreateBooking={() => setShowCreateModal(true)}
                    refreshTrigger={refreshTrigger}
                />

                {showCreateModal && (
                    <CreateBookingModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false)
                            setRefreshTrigger((prev) => prev + 1)
                        }}
                    />
                )}
            </div>
        </div>
    )
}

