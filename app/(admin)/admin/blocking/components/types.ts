export interface BlockedSlot {
    id: number
    slot_date: string
    slot_time: string
    reason?: string
    created_at: string
}

export interface BlockingFormData {
    selectedDate: string | null
    selectedTime: string | null
    reason: string
}

export interface BlockingCalendarProps {
    currentMonth: Date
    setCurrentMonth: (date: Date) => void
    slotsByDate: Map<string, BlockedSlot[]>
    onDateSelect: (date: string) => void
}