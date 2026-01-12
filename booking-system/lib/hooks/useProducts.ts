import { useQuery } from '@tanstack/react-query'
import { Product } from '@/types/product'

// Получить все продукты
export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await fetch('/api/products')
            if (!res.ok) throw new Error('Failed to fetch products')
            return res.json() as Promise<Product[]>
        },
    })
}

// Получить избранные продукты
export function useFeaturedProducts() {
    return useQuery({
        queryKey: ['products', 'featured'],
        queryFn: async () => {
            const res = await fetch('/api/products/featured')
            if (!res.ok) throw new Error('Failed to fetch featured products')
            return res.json() as Promise<Product[]>
        },
    })
}
