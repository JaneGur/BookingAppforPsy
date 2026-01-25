'use client'

import { useState } from 'react'
import { BookingsTab } from '@/components/admin/BookingsTab'
import { CreateBookingModal } from '@/components/admin/CreateBookingModal'

export default function AdminDashboardPage() {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    return (
        <div className="space-y-8 animate-[fadeInUp_0.6s_ease-out]">
            <BookingsTab
                onCreateBooking={() => {
                    setShowCreateModal(true)
                }}
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
    )
}