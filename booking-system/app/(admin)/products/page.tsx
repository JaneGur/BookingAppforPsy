'use client'

import { useState, useEffect } from 'react'
import { Package, Plus, Edit, Trash2, Star, StarOff, Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product } from '@/types/product'
import { cn } from '@/lib/utils/cn'

interface ProductFormData {
    name: string
    slug?: string
    description?: string
    price_rub: number
    is_active: boolean
    is_featured: boolean
    is_package: boolean
    sort_order: number
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        slug: undefined,
        description: undefined,
        price_rub: 3000,
        is_active: true,
        is_featured: false,
        is_package: false,
        sort_order: 0,
    })

    const loadProducts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/products')
            if (res.ok) {
                const data = (await res.json()) as Product[]
                setProducts(data)
            }
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            slug: (product as any).slug || undefined,
            description: product.description || undefined,
            price_rub: product.price_rub,
            is_active: product.is_active,
            is_featured: product.is_featured || false,
            is_package: product.is_package || false,
            sort_order: product.sort_order || 0,
        })
        setError(null)
    }

    const handleCancel = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            slug: undefined,
            description: undefined,
            price_rub: 3000,
            is_active: true,
            is_featured: false,
            is_package: false,
            sort_order: 0,
        })
        setError(null)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.price_rub) {
            setError('Заполните все обязательные поля')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products'
            const method = editingProduct ? 'PATCH' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                handleCancel()
                loadProducts()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось сохранить продукт')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот продукт?')) return

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                loadProducts()
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    const handleToggleFeatured = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_featured: !product.is_featured }),
            })

            if (res.ok) {
                loadProducts()
            }
        } catch (error) {
            console.error('Failed to toggle featured:', error)
        }
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">📦 Продукты</h1>
                            <p className="text-sm text-gray-600">Управление услугами и пакетами</p>
                        </div>
                        <Button onClick={() => handleCancel()} disabled={!!editingProduct}>
                            <Plus className="h-4 w-4 mr-2" />
                            Создать продукт
                        </Button>
                    </div>
                </div>

                {/* Форма создания/редактирования */}
                {(editingProduct || (!editingProduct && formData.name)) && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle>
                                {editingProduct ? 'Редактирование продукта' : 'Создание продукта'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Название *
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Название продукта"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Slug (идентификатор)
                                    </label>
                                    <Input
                                        value={formData.slug || ''}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                slug: e.target.value.toLowerCase().replace(/\s+/g, '-') || undefined,
                                            })
                                        }
                                        placeholder="product-slug (опционально)"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Описание
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Описание продукта..."
                                        className="flex min-h-[100px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Цена (₽) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.price_rub}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price_rub: Number(e.target.value) })
                                        }
                                        placeholder="3000"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Порядок сортировки
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sort_order: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Активен</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Рекомендуемый (featured)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_package}
                                        onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Пакет</span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={handleCancel} className="flex-1">
                                    Отмена
                                </Button>
                                <Button onClick={handleSave} disabled={isSubmitting} className="flex-1" size="lg">
                                    {isSubmitting ? 'Сохранение...' : editingProduct ? 'Сохранить' : 'Создать'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Список продуктов */}
                {isLoading ? (
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-3 text-sm text-gray-500">Загрузка продуктов...</p>
                        </CardContent>
                    </Card>
                ) : products.length === 0 ? (
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500 mb-4">Продукты не найдены</p>
                            <Button onClick={() => handleCancel()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Создать первый продукт
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                className={cn(
                                    'booking-card',
                                    !product.is_active && 'opacity-60',
                                    product.is_featured && 'ring-2 ring-primary-300'
                                )}
                            >
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                                                    {product.is_featured && (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    )}
                                                    {product.is_package && (
                                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                                            Пакет
                                                        </span>
                                                    )}
                                                </div>
                                                {(product as any).slug && (
                                                    <div className="text-sm text-gray-600">{(product as any).slug}</div>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleFeatured(product)}
                                                    title={product.is_featured ? 'Убрать из рекомендуемых' : 'Сделать рекомендуемым'}
                                                >
                                                    {product.is_featured ? (
                                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    ) : (
                                                        <StarOff className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>

                                        {product.description && (
                                            <p className="text-sm text-gray-600">{product.description}</p>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                            <div>
                                                <div className="text-xs text-gray-500">Цена</div>
                                                <div className="text-xl font-bold text-primary-600">
                                                    {product.price_rub.toLocaleString('ru-RU')} ₽
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {product.is_active ? (
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Активен
                                                    </span>
                                                ) : (
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1">
                                                        <X className="h-3 w-3" />
                                                        Неактивен
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
