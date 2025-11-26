export interface Product {
    id: number
    name: string
    sku?: string
    description?: string
    price_rub: number
    is_active: boolean
    is_package: boolean
    sessions_count?: number
    sort_order: number
    is_featured: boolean
    created_at: string
    updated_at?: string
}