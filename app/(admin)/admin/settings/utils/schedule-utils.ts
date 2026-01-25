import { SchedulePreview } from '../components/types'

export const calculateSchedulePreview = (
    workStart: string,
    workEnd: string,
    sessionDuration: number
): SchedulePreview => {
    try {
        const [startH, startM] = workStart.split(':').map(Number)
        const [endH, endM] = workEnd.split(':').map(Number)
        const startMinutes = startH * 60 + startM
        const endMinutes = endH * 60 + endM
        const totalMinutes = endMinutes - startMinutes

        if (totalMinutes <= 0 || sessionDuration <= 0) {
            return { slots: [], count: 0, error: 'Некорректное время' }
        }

        const slotsCount = Math.floor(totalMinutes / sessionDuration)
        const slots: string[] = []

        for (let i = 0; i < Math.min(slotsCount, 10); i++) {
            const slotStart = startMinutes + i * sessionDuration
            const slotH = Math.floor(slotStart / 60)
            const slotM = slotStart % 60
            slots.push(`${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`)
        }

        return { slots, count: slotsCount, error: null }
    } catch {
        return { slots: [], count: 0, error: 'Ошибка расчета' }
    }
}

export const calculateWorkingHours = (workStart: string, workEnd: string): number => {
    const [startH, startM] = workStart.split(':').map(Number)
    const [endH, endM] = workEnd.split(':').map(Number)
    const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
    return totalMinutes / 60
}

export const validateSchedule = (
    workStart: string,
    workEnd: string,
    sessionDuration: number
): string | null => {
    const [startH, startM] = workStart.split(':').map(Number)
    const [endH, endM] = workEnd.split(':').map(Number)
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (startMinutes >= endMinutes) {
        return 'Начало работы должно быть раньше окончания'
    }

    if (sessionDuration < 5 || sessionDuration > 180) {
        return 'Длительность сессии должна быть от 5 до 180 минут'
    }

    return null
}