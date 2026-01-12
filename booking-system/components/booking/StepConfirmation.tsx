'use client'

import { format, parse } from 'date-fns'
import { Check, Package, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { nextStep, prevStep, setBookingId, updateFormData } from '@/store/slices/bookingSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useGetProductsQuery, useGetFeaturedProductQuery } from '@/store/api/productsApi'
import { useCreateBookingMutation } from '@/store/api/bookingsApi'
import { cn } from '@/lib/utils/cn'

export function StepConfirmation() {
    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.booking.formData)
    const bookingId = useAppSelector((state) => state.booking.bookingId)

    const { data: products = [] } = useGetProductsQuery()
    const { data: featuredProduct } = useGetFeaturedProductQuery()
    const [createBooking, { isLoading: isCreating, error: createError }] = useCreateBookingMutation()

    const [offerUrl, setOfferUrl] = useState<string | null>(null)
    const [policyUrl, setPolicyUrl] = useState<string | null>(null)
    const [notes, setNotes] = useState(formData.notes || '')
    const [agreedToTerms, setAgreedToTerms] = useState(false)

    useEffect(() => {
        if (!formData.productId && featuredProduct?.id) {
            dispatch(updateFormData({ productId: featuredProduct.id }))
        }
    }, [dispatch, featuredProduct?.id, formData.productId])

    useEffect(() => {
        let isMounted = true

        async function loadDocs() {
            const [offerRes, policyRes] = await Promise.all([
                fetch('/api/documents?doc_type=offer'),
                fetch('/api/documents?doc_type=policy'),
            ])

            const offer = (await offerRes.json().catch(() => [])) as Array<{ url?: string }>
            const policy = (await policyRes.json().catch(() => [])) as Array<{ url?: string }>

            if (!isMounted) return

            setOfferUrl(offer?.[0]?.url ? String(offer[0].url) : null)
            setPolicyUrl(policy?.[0]?.url ? String(policy[0].url) : null)
        }

        loadDocs().catch(() => {
            if (!isMounted) return
            setOfferUrl(null)
            setPolicyUrl(null)
        })

        return () => {
            isMounted = false
        }
    }, [])

    const selectedProduct = useMemo(() => {
        if (!formData.productId) return null
        return products.find((p) => p.id === formData.productId) ?? null
    }, [formData.productId, products])

    const handleCreateOrder = async () => {
        if (bookingId) {
            dispatch(nextStep())
            return
        }

        if (!formData.date || !formData.time || !formData.name || !formData.phone || !formData.productId) {
            return
        }

        const booking = await createBooking({
            booking_date: formData.date,
            booking_time: formData.time,
            client_name: formData.name,
            client_phone: formData.phone,
            client_email: formData.email,
            client_telegram: formData.telegram,
            notes: formData.notes,
            product_id: formData.productId,
            status: 'pending_payment',
        }).unwrap()

        dispatch(setBookingId(booking.id))
        dispatch(nextStep())
    }

    const handleBack = () => {
        dispatch(prevStep())
    }

    const formattedDate = formData.date
        ? format(parse(formData.date, 'yyyy-MM-dd', new Date()), 'dd.MM.yyyy')
        : ''

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary-500" />
                    Шаг 3: Подтверждение
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-primary-50/50 p-4 rounded-xl space-y-3">
                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">
                            Дата и время
                        </div>
                        <div className="text-base font-semibold text-gray-900">
                            {formattedDate} в {formData.time}
                        </div>
                    </div>

                    <div className="border-t border-primary-200 pt-3">
                        <div className="text-sm font-medium text-gray-600 mb-1">Имя</div>
                        <div className="text-base text-gray-900">{formData.name}</div>
                    </div>

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-1">Телефон</div>
                        <div className="text-base text-gray-900">{formData.phone}</div>
                    </div>

                    {formData.email && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Email</div>
                            <div className="text-base text-gray-900">{formData.email}</div>
                        </div>
                    )}

                    {formData.telegram && (
                        <div>
                            <div className="text-sm font-medium text-gray-600 mb-1">
                                Telegram
                            </div>
                            <div className="text-base text-gray-900">{formData.telegram}</div>
                        </div>
                    )}

                    <div>
                        <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary-500" />
                            Продукт *
                        </div>
                        
                        {products.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-500">Нет доступных продуктов</p>
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {products.map((product) => {
                                    const isSelected = formData.productId === product.id
                                    return (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => {
                                                dispatch(updateFormData({ productId: product.id }))
                                            }}
                                            className={cn(
                                                'relative p-4 rounded-xl border transition-all text-left shadow-sm',
                                                'hover:border-primary-300 hover:shadow-md',
                                                isSelected
                                                    ? 'border-primary-500 bg-primary-50 shadow-md'
                                                    : 'border-gray-200 bg-white'
                                            )}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="font-semibold text-gray-900 mb-1 pr-8">
                                                {product.name}
                                            </div>
                                            {product.description && (
                                                <div className="text-sm text-gray-600 mb-2">
                                                    {product.description}
                                                </div>
                                            )}
                                            <div className="text-xl font-bold text-primary-600">
                                                {product.price_rub.toLocaleString('ru-RU')} ₽
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {selectedProduct && (
                            <div className="mt-4 rounded-xl bg-gradient-to-r from-green-50 to-primary-50 border border-green-200/50 p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">💰 К оплате</div>
                                        <div className="text-2xl font-bold text-primary-600">
                                            {selectedProduct.price_rub.toLocaleString('ru-RU')} ₽
                                        </div>
                                    </div>
                                    {selectedProduct.is_package && (
                                        <div className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
                                            Пакет
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary-500" />
                            Описание консультации (необязательно)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => {
                                const value = e.target.value
                                setNotes(value)
                                dispatch(updateFormData({ notes: value }))
                            }}
                            placeholder="Опишите ваш запрос или вопросы, которые хотите обсудить..."
                            className="flex min-h-[100px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl space-y-3">
                    <p className="text-sm text-yellow-800">
                        <strong>⏳ Заказ ожидает оплаты.</strong> После оплаты запись будет подтверждена.
                    </p>
                    
                    <div className="space-y-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-5 w-5 rounded border border-primary-300/60 text-primary-600 focus:ring-2 focus:ring-primary-400/20 focus:ring-offset-1 cursor-pointer"
                            />
                            <span className="text-sm text-yellow-800 group-hover:text-yellow-900">
                                Я согласен(а) с{' '}
                                {offerUrl ? (
                                    <a
                                        className="text-primary-700 font-semibold hover:underline"
                                        href={offerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        условиями оферты
                                    </a>
                                ) : (
                                    <span className="font-semibold">условиями оферты</span>
                                )}{' '}
                                и{' '}
                                {policyUrl ? (
                                    <a
                                        className="text-primary-700 font-semibold hover:underline"
                                        href={policyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        политикой конфиденциальности
                                    </a>
                                ) : (
                                    <span className="font-semibold">политикой конфиденциальности</span>
                                )}
                                . *
                            </span>
                        </label>
                    </div>
                </div>

                {createError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                        <p className="text-sm text-red-800">
                            Ошибка создания заказа
                        </p>
                    </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="secondary" onClick={handleBack}>
                        Назад
                    </Button>
                    <Button
                        onClick={handleCreateOrder}
                        size="lg"
                        disabled={!formData.productId || !agreedToTerms || isCreating}
                    >
                        {isCreating ? 'Создаём заказ…' : bookingId ? 'Далее ➡️' : '✅ Создать заказ'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

