import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Product, ProductFormData } from '@/types/product'

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

// Получить все продукты (для админа, включая неактивные)
export function useAdminProducts() {
    return useQuery({
        queryKey: ['admin', 'products'],
        queryFn: async () => {
            const res = await fetch('/api/admin/products')
            if (!res.ok) throw new Error('Failed to fetch products')
            return res.json() as Promise<Product[]>
        },
    })
}

// Создать продукт
export function useCreateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ProductFormData) => {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to create product')
            }
            return res.json() as Promise<Product>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
        },
    })
}

// Обновить продукт
export function useUpdateProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...data }),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update product')
            }
            return res.json() as Promise<Product>
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
        },
    })
}

// Удалить продукт (деактивировать)
export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            const res = await fetch('/api/admin/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to delete product')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
        },
    })
}
