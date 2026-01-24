// context/reschedule-context.tsx
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Booking } from '@/types/booking'

interface RescheduleContextType {
    isOpen: boolean
    selectedBooking: Booking | null
    openModal: (booking: Booking) => void
    closeModal: () => void
}

const RescheduleContext = createContext<RescheduleContextType | undefined>(undefined)

export function RescheduleProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

    const openModal = useCallback((booking: Booking) => {
        setSelectedBooking(booking)
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        // Очищаем booking после анимации закрытия
        setTimeout(() => setSelectedBooking(null), 300)
    }, [])

    return (
        <RescheduleContext.Provider
            value={{
                isOpen,
                selectedBooking,
                openModal,
                closeModal,
            }}
        >
            {children}
        </RescheduleContext.Provider>
    )
}

export function useReschedule() {
    const context = useContext(RescheduleContext)
    if (!context) {
        throw new Error('useReschedule must be used within RescheduleProvider')
    }
    return context
}