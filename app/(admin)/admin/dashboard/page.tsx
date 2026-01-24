'use client'

import { useState, useEffect } from 'react'
import { BookingsTab } from '@/components/admin/BookingsTab'
import { CreateBookingModal } from '@/components/admin/CreateBookingModal'

let renderCount = 0  // ← ДОБАВЬТЕ ЭТО

export default function AdminDashboardPage() {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // ← ДОБАВЬТЕ ЭТОТ useEffect
    useEffect(() => {
        renderCount++
        console.log('🔄 AdminDashboardPage render #', renderCount, {
            showCreateModal,
            refreshTrigger
        })

        if (renderCount > 20) {
            console.error('🚨 TOO MANY RENDERS! Stopping...')
            throw new Error('Too many renders detected')
        }
    })

    return (
        <div className="space-y-8 animate-[fadeInUp_0.6s_ease-out]">
            <BookingsTab
                onCreateBooking={() => {
                    console.log('✅ onCreateBooking called')
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