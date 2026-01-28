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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <Card className="booking-card border-2 w-full sm:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl">
                <CardHeader className="sticky top-0 bg-white z-10 border-b-2 rounded-t-3xl sm:rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-xl">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center border-2 border-purple-200/50 flex-shrink-0">
                                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <span className="truncate">{product ? 'Редактирование продукта' : 'Создание продукта'}</span>
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                            <X className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5 sm:space-y-6 p-4 sm:p-6">
                    {/* Ошибка */}
                    {error && (
                        <div className="p-3 sm:p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-2 sm:gap-3">
                            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-red-700 font-medium break-words">{error}</p>
                        </div>
                    )}

                    {/* Основная информация */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                            Основная информация
                        </h3>

                        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                    Название *
                                </label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Одна консультация"
                                    className="h-11 sm:h-12 text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                    SKU (артикул)
                                </label>
                                <Input
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="SINGLE"
                                    className="h-11 sm:h-12 text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                Описание
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Подробное описание продукта..."
                                className="flex min-h-[80px] sm:min-h-[100px] w-full rounded-xl border-2 border-primary-200/40 bg-white/98 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/20 focus-visible:border-primary-500/70 focus-visible:shadow-lg resize-none"
                            />
                        </div>

                        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
                            <div className={formData.is_package ? 'col-span-1' : 'col-span-2 sm:col-span-1'}>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                    Цена (₽) *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.price_rub}
                                    onChange={(e) => setFormData({ ...formData, price_rub: Number(e.target.value) })}
                                    placeholder="5000"
                                    className="h-11 sm:h-12 text-sm"
                                    required
                                    min="0"
                                />
                            </div>

                            {formData.is_package && (
                                <div className="col-span-1">
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                        Сессий
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.sessions_count || 1}
                                        onChange={(e) =>
                                            setFormData({ ...formData, sessions_count: Number(e.target.value) })
                                        }
                                        placeholder="5"
                                        className="h-11 sm:h-12 text-sm"
                                        min="1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 sm:gap-3">
                            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Активен</span>
                            </label>

                            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Рекомендуемый</span>
                            </label>

                            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer p-2.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_package}
                                    onChange={(e) => setFormData({ ...formData, is_package: e.target.checked })}
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 flex-shrink-0"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Пакет (несколько сессий)</span>
                            </label>
                        </div>
                    </div>

                    {/* Скидки */}
                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6 border-t-2">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                            Скидки и акции
                        </h3>

                        {/* Базовая скидка */}
                        <div className="p-3 sm:p-4 rounded-xl bg-orange-50 border-2 border-orange-200 space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 flex-shrink-0" />
                                <span className="font-semibold text-orange-900 text-sm sm:text-base">Базовая скидка</span>
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
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
                                        className="h-11 sm:h-12 text-sm"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-xl sm:text-2xl font-bold text-orange-600 flex-shrink-0">%</span>
                                </div>
                                {(formData.discount_percent || 0) > 0 && (
                                    <p className="text-xs sm:text-sm text-orange-700 mt-1.5 sm:mt-2 break-words">
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
                        <div className="p-3 sm:p-4 rounded-xl bg-blue-50 border-2 border-blue-200 space-y-2 sm:space-y-3">
                            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.has_special_categories_discount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, has_special_categories_discount: e.target.checked })
                                    }
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0 mt-0.5"
                                />
                                <div className="flex items-start gap-1.5 sm:gap-2 flex-1 min-w-0">
                                    <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="font-semibold text-blue-900 text-xs sm:text-sm break-words">
                                        Скидки для льготных категорий (10%)
                                    </span>
                                </div>
                            </label>
                            {formData.has_special_categories_discount && (
                                <div className="pl-7 sm:pl-8 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-blue-700">
                                    <p>• Инвалиды</p>
                                    <p>• Многодетные семьи</p>
                                    <p>• Пенсионеры</p>
                                    <p>• Участники СВО</p>
                                </div>
                            )}
                        </div>

                        {/* Массовая скидка */}
                        <div className="p-3 sm:p-4 rounded-xl bg-green-50 border-2 border-green-200 space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                                <span className="font-semibold text-green-900 text-sm sm:text-base">Скидка за объем</span>
                            </div>
                            <div className="grid gap-2 sm:gap-3 grid-cols-2">
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                        Минимум сессий
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.bulk_discount_threshold}
                                        onChange={(e) =>
                                            setFormData({ ...formData, bulk_discount_threshold: Number(e.target.value) })
                                        }
                                        placeholder="10"
                                        className="h-11 sm:h-12 text-sm"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block">
                                        Процент
                                    </label>
                                    <div className="flex gap-1.5 sm:gap-2 items-center">
                                        <Input
                                            type="number"
                                            value={formData.bulk_discount_percent}
                                            onChange={(e) =>
                                                setFormData({ ...formData, bulk_discount_percent: Number(e.target.value) })
                                            }
                                            placeholder="10"
                                            className="h-11 sm:h-12 text-sm"
                                            min="0"
                                            max="100"
                                        />
                                        <span className="text-lg sm:text-xl font-bold text-green-600 flex-shrink-0">%</span>
                                    </div>
                                </div>
                            </div>
                            {(formData.bulk_discount_threshold || 0) > 0 && (formData.bulk_discount_percent || 0) > 0 && (
                                <p className="text-xs sm:text-sm text-green-700 break-words">
                                    При оплате от {formData.bulk_discount_threshold} сессий единовременно - скидка{' '}
                                    {formData.bulk_discount_percent}%
                                </p>
                            )}
                        </div>

                        {/* Текст акции */}
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 block flex items-center gap-1.5 sm:gap-2">
                                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Текст акции (отображается на карточке)
                            </label>
                            <Input
                                value={formData.promo_text}
                                onChange={(e) => setFormData({ ...formData, promo_text: e.target.value })}
                                placeholder="Например: Скидка 20% до конца месяца!"
                                className="h-11 sm:h-12 text-sm"
                            />
                        </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t-2 sticky bottom-0 bg-white pb-1 sm:pb-0">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                            disabled={isPending}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="flex-1 h-11 sm:h-12 text-sm sm:text-base"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                                    Сохранение...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
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