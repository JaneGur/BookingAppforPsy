'use client'

import { useState } from 'react'
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Star,
    Check,
    X,
    AlertCircle,
    Tag,
    Percent,
    Gift,
    TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminProducts, useDeleteProduct } from '@/lib/hooks'
import { Product, ProductFormData } from '@/types/product'
import { cn } from '@/lib/utils/cn'
import { ProductModal } from '@/components/admin/ProductModal'
import { Toast, useToast } from '@/components/ui/toast'
import { StatCardSkeleton, ProductCardSkeleton } from '@/components/ui/skeleton'

export default function ProductsPage() {
    const { data: products = [], isLoading, error, refetch } = useAdminProducts()
    const deleteProduct = useDeleteProduct()
    const toast = useToast()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)

    const handleCreate = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleDelete = async (product: Product) => {
        if (
            !confirm(
                `Вы уверены, что хотите удалить "${product.name}"? Продукт будет деактивирован.`
            )
        )
            return

        try {
            await deleteProduct.mutateAsync(product.id)
            toast.success(`Продукт "${product.name}" успешно удален`)
        } catch (error) {
            console.error('Ошибка удаления:', error)
            toast.error('Не удалось удалить продукт. Попробуйте еще раз.')
        }
    }

    const calculateFinalPrice = (product: Product) => {
        let price = product.price_rub
        if (product.discount_percent) {
            price = price * (1 - product.discount_percent / 100)
        }
        return Math.round(price)
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                {/* Заголовок */}
                <div className="booking-card border-2">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                                <Package className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Продукты и услуги
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Управление тарифами и акциями</p>
                            </div>
                        </div>
                        <Button size="lg" className="shadow-lg" onClick={handleCreate}>
                            <Plus className="h-5 w-5 mr-2" />
                            Создать продукт
                        </Button>
                    </div>
                </div>

                {/* Статистика */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <StatCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-medium text-gray-600">Всего продуктов</div>
                                    <Package className="h-5 w-5 text-purple-500" />
                                </div>
                                <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-800 bg-clip-text text-transparent">
                                    {products.length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-medium text-gray-600">Активных</div>
                                    <Check className="h-5 w-5 text-green-500" />
                                </div>
                                <div className="text-3xl font-bold text-green-600">
                                    {products.filter((p) => p.is_active).length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-medium text-gray-600">Со скидками</div>
                                    <Percent className="h-5 w-5 text-orange-500" />
                                </div>
                                <div className="text-3xl font-bold text-orange-600">
                                    {products.filter((p) => p.discount_percent || p.bulk_discount_percent).length}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-medium text-gray-600">Рекомендуемых</div>
                                    <Star className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div className="text-3xl font-bold text-yellow-600">
                                    {products.filter((p) => p.is_featured).length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Ошибка */}
                {error && (
                    <Card className="booking-card border-2 border-red-200 bg-red-50/50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5" />
                                <div>
                                    <div className="font-semibold">Ошибка загрузки</div>
                                    <div className="text-sm text-red-600">Не удалось загрузить продукты</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Список продуктов */}
                {isLoading ? (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <Card className="booking-card border-2">
                        <CardContent className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Package className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-lg font-semibold text-gray-900 mb-2">Продуктов пока нет</p>
                            <p className="text-sm text-gray-500 mb-6">Создайте первый продукт или услугу</p>
                            <Button size="lg" className="shadow-lg" onClick={handleCreate}>
                                <Plus className="h-5 w-5 mr-2" />
                                Создать продукт
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => {
                            const finalPrice = calculateFinalPrice(product)
                            const hasDiscount = finalPrice < product.price_rub

                            return (
                                <Card
                                    key={product.id}
                                    className={cn(
                                        'booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden',
                                        !product.is_active && 'opacity-60',
                                        product.is_featured && 'ring-2 ring-yellow-400'
                                    )}
                                >
                                    {/* Featured badge */}
                                    {product.is_featured && (
                                        <div className="absolute top-0 right-0">
                                            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-bl-xl font-bold text-xs flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-white" />
                                                Рекомендуем
                                            </div>
                                        </div>
                                    )}

                                    {/* Discount badge */}
                                    {product.discount_percent && (
                                        <div className="absolute top-0 left-0">
                                            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-3 py-1 rounded-br-xl font-bold text-xs flex items-center gap-1">
                                                <Percent className="h-3 w-3" />
                                                -{product.discount_percent}%
                                            </div>
                                        </div>
                                    )}

                                    <CardContent className="p-5 pt-8">
                                        <div className="space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-gray-900 text-lg truncate">
                                                            {product.name}
                                                        </h3>
                                                        {product.is_package && (
                                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                                                Пакет
                                                            </span>
                                                        )}
                                                    </div>
                                                    {product.sku && (
                                                        <div className="text-xs text-gray-500 font-mono">{product.sku}</div>
                                                    )}
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(product)}
                                                        className="hover:bg-primary-50"
                                                        title="Редактировать"
                                                    >
                                                        <Edit className="h-4 w-4 text-primary-600" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(product)}
                                                        disabled={deleteProduct.isPending}
                                                        className="hover:bg-red-50"
                                                        title="Удалить"
                                                    >
                                                        {deleteProduct.isPending ? (
                                                            <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {product.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                            )}

                                            {/* Price */}
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1">Цена</div>
                                                        {hasDiscount ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="text-2xl font-bold text-green-600">
                                                                    {finalPrice.toLocaleString('ru-RU')} ₽
                                                                </div>
                                                                <div className="text-sm text-gray-500 line-through">
                                                                    {product.price_rub.toLocaleString('ru-RU')} ₽
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-2xl font-bold text-primary-600">
                                                                {product.price_rub.toLocaleString('ru-RU')} ₽
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {product.is_active ? (
                                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                                                                <Check className="h-3 w-3" />
                                                                Активен
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                                                                <X className="h-3 w-3" />
                                                                Неактивен
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Special offers */}
                                            <div className="space-y-2">
                                                {product.has_special_categories_discount && (
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                                                        <Gift className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                        <span className="text-xs text-blue-700 font-medium">
                                                            Скидки для льготников
                                                        </span>
                                                    </div>
                                                )}
                                                {product.bulk_discount_percent && product.bulk_discount_threshold && (
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                                                        <TrendingUp className="h-4 w-4 text-orange-600 flex-shrink-0" />
                                                        <span className="text-xs text-orange-700 font-medium">
                                                            -{product.bulk_discount_percent}% от {product.bulk_discount_threshold} сессий
                                                        </span>
                                                    </div>
                                                )}
                                                {product.promo_text && (
                                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 border border-purple-200">
                                                        <Tag className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                                        <span className="text-xs text-purple-700 font-medium line-clamp-1">
                                                            {product.promo_text}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {/* Модальное окно */}
                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setEditingProduct(null)
                    }}
                    product={editingProduct}
                    onSuccess={(msg) => toast.success(msg)}
                />
            </div>

            {/* Toast уведомления */}
            {toast.toasts.map((t) => (
                <Toast 
                    key={t.id} 
                    message={t.message} 
                    type={t.type} 
                    onClose={() => toast.remove(t.id)} 
                />
            ))}
        </div>
    )
}
