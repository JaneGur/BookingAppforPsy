'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BookingFormData {
    date?: string
    time?: string
    name?: string
    phone?: string
    email?: string
    telegram?: string
    notes?: string
    productId?: number
}

interface BookingContextType {
    step: number
    formData: BookingFormData
    setStep: (step: number) => void
    nextStep: () => void
    prevStep: () => void
    updateFormData: (data: Partial<BookingFormData>) => void
    resetForm: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<BookingFormData>({})

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 4))
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

    const updateFormData = (data: Partial<BookingFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }))
    }

    const resetForm = () => {
        setStep(1)
        setFormData({})
    }

    return (
        <BookingContext.Provider
            value={{
                step,
                formData,
                setStep,
                nextStep,
                prevStep,
                updateFormData,
                resetForm,
            }}
        >
            {children}
        </BookingContext.Provider>
    )
}

export function useBookingForm() {
    const context = useContext(BookingContext)
    if (!context) {
        throw new Error('useBookingForm must be used within BookingProvider')
    }
    return context
}
