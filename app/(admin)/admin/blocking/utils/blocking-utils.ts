import { BlockedSlot } from '../components/types'

export const groupSlotsByDate = (slots: BlockedSlot[]): Map<string, BlockedSlot[]> => {
    const map = new Map<string, BlockedSlot[]>()
    slots.forEach((slot) => {
        const date = slot.slot_date
        if (!map.has(date)) {
            map.set(date, [])
        }
        map.get(date)!.push(slot)
    })
    return map
}

export const getDaySlots = (date: Date): string[] => {
    // Это упрощенная версия - в реальности нужно получать из настроек
    const slots: string[] = []
    for (let hour = 9; hour < 18; hour++) {
        slots.push(`${String(hour).padStart(2, '0')}:00`)
    }
    return slots
}

export const fetchBlockedSlots = async (startDate: string, endDate: string): Promise<BlockedSlot[]> => {
    const res = await fetch(`/api/admin/blocked-slots?start_date=${startDate}&end_date=${endDate}`)
    if (!res.ok) throw new Error('Failed to load blocked slots')
    return res.json()
}

export const createBlockedSlot = async (data: {
    slot_date: string
    slot_time?: string
    reason?: string
    block_entire_day?: boolean
}): Promise<Response> => {
    return fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

export const deleteBlockedSlot = async (id: number): Promise<Response> => {
    return fetch(`/api/admin/blocked-slots/${id}`, {
        method: 'DELETE',
    })
}