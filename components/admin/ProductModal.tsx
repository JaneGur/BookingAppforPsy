'use client'

import { useState, useEffect } from 'react'
import {
    X,
    Package,
    Tag,
    Percent,
    Gift,
    TrendingUp,
    AlertCircle,
    Save,
    Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Product, ProductFormData } from '@/types/product'
import { useCreateProduct, useUpdateProduct } from '@/lib/hooks'

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    product?: Product | null
    onSuccess?: (message: string) => void
}

export function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()

    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        sku: '',
        description: '',
        price_rub: 5000,
        is_active: true,
        is_package: false,
        sessions_count: 1,
        is_featured: false,
        discount_percent: 0,
        has_special_categories_discount: false,
        bulk_discount_threshold: 10,
        bulk_discount_percent: 10,
        promo_text: '',
    })

    const [error, setError] = useState<string | null>(null)

    // Initialize form with product data when editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                sku: product.sku || '',
                description: product.description || '',
                price_rub: product.price_rub,
                is_active: product.is_active,
                is_package: product.is_package,
                sessions_count: product.sessions_count,
                is_featured: product.is_featured,
                discount_percent: product.discount_percent || 0,
                has_special_categories_discount: product.has_special_categories_discount || false,
                bulk_discount_threshold: product.bulk_discount_threshold || 10,
                bulk_discount_percent: product.bulk_discount_percent || 10,
                promo_text: product.promo_text || '',
            })
        } else {
            // Reset form for new product
            setFormData({
                name: '',
                sku: '',
                description: '',
                price_rub: 5000,
                is_active: true,
                is_package: false,
                sessions_count: 1,
                is_featured: false,
                discount_percent: 0,
                has_special_categories_discount: false,
                bulk_discount_threshold: 10,
                bulk_discount_percent: 10,
                promo_text: '',
            })
        }
        setError(null)
    }, [product, isOpen])

    const handleSave = async () => {
        if (!formData.name || formData.price_rub < 0) {
            setError('Название и цена обязательны')
            return
        }

        setError(null)

        try {
            if (product) {
                await updateProduct.mutateAsync({ id: product.id, data: formData })
                onSuccess?.(`Продукт "${formData.name}" успешно обновлен`)
            } else {
                await createProduct.mutateAsync(formData)
                onSuccess?.(`Продукт "${formData.name}" успешно создан`)
            }
            onClose()
        } catch (err: any) {
            setError(err.message || 'Не удалось сохранить продукт')
        }
    }

    const isPending = createProduct.isPending || updateProduct.isPending

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <Card className="booking-card border-2 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader className="sticky top-0 bg-white z-10 border-b-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border-2 border-purple-200/50">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            {product ? 'Редактирование продукта' : 'Создание продукта'}
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6 p-6">
                    {/* Ошибка */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Основная информация */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Основная информация
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Название *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Одна консультация"
                                    className="h-12"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    SKU (артикул)
                                </label>
                                <Input
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="SINGLE"
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Описание
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Подробное описание продукта..."
                                className="flex min-h-[100px] w-full rounded-xl border-2 border-primary-200/40 bg-white/98 px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/20 focus-visible:border-primary-500/70 focus-visible:shadow-lg resize-none"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Цена (₽) *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.price_rub}
                                    onChange={(e) => setFormData({ ...formData, price_rub: Number(e.target.value) })}
                                    placeholder="5000"
                                    className="h-12"
                                    required
                                    min="0"
                                />
                            </div>

                            {formData.is_package && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Количество сессий
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.sessions_count || 1}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sessions_count: Number(e.target.value) })
                                        }
                                        placeholder="5"
                                        className="h-12"
                                        min="1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-5 w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Активен</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="h-5 w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Рекомендуемый</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_package}
                                    onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                                    className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Пакет (несколько сессий)</span>
                            </label>
                        </div>
                    </div>

                    {/* Скидки */}
                    <div className="space-y-4 pt-6 border-t-2">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Percent className="h-5 w-5 text-orange-600" />
                            Скидки и акции
                        </h3>

                        {/* Базовая скидка */}
                        <div className="p-4 rounded-xl bg-orange-50 border-2 border-orange-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <Tag className="h-5 w-5 text-orange-600" />
                                <span className="font-semibold text-orange-900">Базовая скидка</span>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">
                                    Процент скидки
                                </label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        type="number"
                                        value={formData.discount_percent}
                                        onChange={(e) =>
                                            setFormData({ ...formData, discount_percent: Number(e.target.value) })
                                        }
                                        placeholder="0"
                                        className="h-12"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-2xl font-bold text-orange-600">%</span>
                                </div>
                                {(formData.discount_percent || 0) > 0 && (
                                    <p className="text-sm text-orange-700 mt-2">
                                        Цена со скидкой:{' '}
                                        <span className="font-bold">
                                            {Math.round(
                                                formData.price_rub * (1 - (formData.discount_percent || 0) / 100)
                                            ).toLocaleString('ru-RU')}{' '}
                                            ₽
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Скидки для категорий */}
                        <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.has_special_categories_discount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, has_special_categories_discount: e.target.checked })
                                    }
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-blue-600" />
                                    <span className="font-semibold text-blue-900">
                                        Скидки для льготных категорий (10%)
                                    </span>
                                </div>
                            </label>
                            {formData.has_special_categories_discount && (
                                <div className="pl-8 space-y-1 text-sm text-blue-700">
                                    <p>• Инвалиды</p>
                                    <p>• Многодетные семьи</p>
                                    <p>• Пенсионеры</p>
                                    <p>• Участники СВО</p>
                                </div>
                            )}
                        </div>

                        {/* Массовая скидка */}
                        <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-900">Скидка за объем</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Минимум сессий
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.bulk_discount_threshold}
                                        onChange={(e) =>
                                            setFormData({ ...formData, bulk_discount_threshold: Number(e.target.value) })
                                        }
                                        placeholder="10"
                                        className="h-12"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Процент скидки
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="number"
                                            value={formData.bulk_discount_percent}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bulk_discount_percent: Number(e.target.value) })
                                            }
                                            placeholder="10"
                                            className="h-12"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-xl font-bold text-green-600">%</span>
                                    </div>
                                </div>
                            </div>
                            {(formData.bulk_discount_threshold || 0) > 0 && (formData.bulk_discount_percent || 0) > 0 && (
                                <p className="text-sm text-green-700">
                                    При оплате от {formData.bulk_discount_threshold} сессий единовременно - скидка{' '}
                                    {formData.bulk_discount_percent}%
                                </p>
                            )}
                        </div>

                        {/* Текст акции */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Текст акции (отображается на карточке)
                            </label>
                            <Input
                                value={formData.promo_text}
                                onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })}
                                placeholder="Например: Скидка 20% до конца месяца!"
                                className="h-12"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex gap-3 pt-4 border-t-2">
                        <Button variant="secondary" onClick={onClose} className="flex-1" size="lg" disabled={isPending}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave} disabled={isPending} className="flex-1" size="lg">
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5 mr-2" />
                                    {product ? 'Сохранить' : 'Создать'}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
