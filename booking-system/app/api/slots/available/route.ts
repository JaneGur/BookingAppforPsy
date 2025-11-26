// booking-system/app/api/slots/available/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Рабочие часы консультаций
const WORKING_HOURS = {
    start: 9, // 09:00
    end: 18,   // 18:00
}

const SLOT_DURATION_MINUTES = 60

// Временно заблокированные слоты (в реальном приложении - из БД)
const BLOCKED_SLOTS = [
    '2024-11-27T10:00:00',
    '2024-11-27T14:00:00',
]

// Существующие записи (в реальном приложении - из БД)
const EXISTING_BOOKINGS = [
    { date: '2024-11-27', time: '11:00' },
    { date: '2024-11-28', time: '15:00' },
]

function generateTimeSlots(date: string): string[] {
    const slots: string[] = []
    const { start, end } = WORKING_HOURS

    for (let hour = start; hour < end; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }

    return slots
}

function isSlotAvailable(date: string, time: string): boolean {
    // Проверка, что дата не в прошлом
    const slotDateTime = new Date(`${date}T${time}:00`)
    const now = new Date()

    if (slotDateTime <= now) {
        return false
    }

    // Проверка существующих записей
    const isBooked = EXISTING_BOOKINGS.some(
        (booking) => booking.date === date && booking.time === time
    )

    if (isBooked) {
        return false
    }

    // Проверка заблокированных слотов
    const slotString = `${date}T${time}:00`
    const isBlocked = BLOCKED_SLOTS.includes(slotString)

    return !isBlocked
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const date = searchParams.get('date')

        if (!date) {
            return NextResponse.json(
                { error: 'Параметр date обязателен' },
                { status: 400 }
            )
        }

        // Валидация формата даты
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) {
            return NextResponse.json(
                { error: 'Неверный формат даты. Используйте YYYY-MM-DD' },
                { status: 400 }
            )
        }

        // Генерация всех возможных слотов
        const allSlots = generateTimeSlots(date)

        // Фильтрация доступных слотов
        const availableSlots = allSlots.filter((time) =>
            isSlotAvailable(date, time)
        )

        return NextResponse.json(availableSlots)
    } catch (error) {
        console.error('Ошибка при получении слотов:', error)
        return NextResponse.json(
            { error: 'Внутренняя ошибка сервера' },
            { status: 500 }
        )
    }
}