export type BookingStatus = 'pending_payment' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
    id: number
    client_id?: string
    client_name: string
    client_phone: string
    client_email?: string
    client_telegram?: string
    booking_date: string
    booking_time: string
    notes?: string
    status: BookingStatus
    phone_hash: string
    telegram_chat_id?: string
    product_id?: number
    amount?: number
    paid_at?: string
    created_at: string
    updated_at?: string
}

export interface BookingFormData {
    date: string
    time: string
    name: string
    phone: string
    email?: string
    telegram?: string
    notes?: string
    productId?: number
}

export interface AvailableSlotsParams {
    date: string
}