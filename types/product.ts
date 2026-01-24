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
    // Скидки и акции
    discount_percent?: number // Базовая скидка на продукт
    has_special_categories_discount?: boolean // Есть ли скидки для особых категорий
    bulk_discount_threshold?: number // Минимальное количество для массовой скидки (например, 10)
    bulk_discount_percent?: number // Процент скидки при массовой покупке
    promo_text?: string // Текст акции для отображения
    created_at: string
    updated_at?: string
}

export interface ProductDiscount {
    product_id: number
    category: 'disabled' | 'large_family' | 'pensioner' | 'military' // Категории льготников
    discount_percent: number
}

export interface ProductFormData {
    name: string
    sku?: string
    description?: string
    price_rub: number
    is_active: boolean
    is_package: boolean
    sessions_count?: number
    is_featured: boolean
    discount_percent?: number
    has_special_categories_discount?: boolean
    bulk_discount_threshold?: number
    bulk_discount_percent?: number
    promo_text?: string
}