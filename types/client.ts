export interface Client {
    id: string
    phone: string
    phone_hash: string
    name: string
    email?: string
    telegram?: string
    telegram_chat_id?: string
    created_at: string
    updated_at?: string
}

export interface ClientProfile {
    client: Client
    total_bookings: number
    upcoming_bookings: number
    completed_bookings: number
    cancelled_bookings: number
    first_booking?: string
    last_booking?: string
}