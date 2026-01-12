'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { BarChart3, Calendar, TrendingUp, Package, DollarSign, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Booking } from '@/types/booking'

interface ProductStats {
    name: string
    orders: number
    revenue: number
    product_id: number
}

interface OverviewData {
    upcoming: Booking[]
    weekStats: {
        total: number
        confirmed: number
        completed: number
        revenue: number
    }
    monthStats: {
        total: number
        confirmed: number
        completed: number
        revenue: number
    }
}

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<OverviewData | null>(null)
    const [productStats, setProductStats] = useState<ProductStats[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    })
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const loadOverview = async () => {
        try {
            const res = await fetch('/api/admin/analytics/overview')
            if (res.ok) {
                const data = (await res.json()) as OverviewData
                setOverview(data)
            }
        } catch (error) {
            console.error('Failed to load overview:', error)
        }
    }

    const loadProductStats = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (dateRange.start) {
                params.append('start_date', dateRange.start)
            }
            if (dateRange.end) {
                params.append('end_date', dateRange.end)
            }
            if (selectedStatuses.length > 0) {
                params.append('statuses', selectedStatuses.join(','))
            }

            const res = await fetch(`/api/admin/analytics?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setProductStats(data.products || [])
            }
        } catch (error) {
            console.error('Failed to load product stats:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadOverview()
        loadProductStats()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const totalRevenue = useMemo(() => {
        return productStats.reduce((sum, p) => sum + p.revenue, 0)
    }, [productStats])

    const totalOrders = useMemo(() => {
        return productStats.reduce((sum, p) => sum + p.orders, 0)
    }, [productStats])

    const handleStatusToggle = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">📊 Аналитика</h1>
                            <p className="text-sm text-gray-600">Статистика и аналитика по записям и продуктам</p>
                        </div>
                    </div>
                </div>

                {/* Обзор */}
                {overview && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="booking-card">
                            <CardContent className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Предстоящих событий</div>
                                <div className="text-2xl font-bold text-primary-900">{overview.upcoming.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card">
                            <CardContent className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Записей на неделе</div>
                                <div className="text-2xl font-bold text-blue-600">{overview.weekStats.total}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Выручка: {overview.weekStats.revenue.toLocaleString('ru-RU')} ₽
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card">
                            <CardContent className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Записей в месяце</div>
                                <div className="text-2xl font-bold text-green-600">{overview.monthStats.total}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Выручка: {overview.monthStats.revenue.toLocaleString('ru-RU')} ₽
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card">
                            <CardContent className="p-4">
                                <div className="text-xs text-gray-500 mb-1">Завершено (месяц)</div>
                                <div className="text-2xl font-bold text-emerald-600">{overview.monthStats.completed}</div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Предстоящие события */}
                {overview && overview.upcoming.length > 0 && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary-500" />
                                Предстоящие события
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {overview.upcoming.slice(0, 5).map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{booking.client_name}</div>
                                            <div className="text-sm text-gray-600">
                                                {format(new Date(booking.booking_date), 'd MMMM yyyy', { locale: ru })} в{' '}
                                                {booking.booking_time}
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-primary-600">
                                            {booking.amount?.toLocaleString('ru-RU')} ₽
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Продуктовая аналитика */}
                <Card className="booking-card">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-primary-500" />
                                Продуктовая аналитика
                            </CardTitle>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Фильтры
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showFilters && (
                            <div className="grid gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">С</label>
                                        <Input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">По</label>
                                        <Input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Статусы</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['pending_payment', 'confirmed', 'completed', 'cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusToggle(status)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    selectedStatuses.includes(status)
                                                        ? 'bg-primary-500 text-white'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-primary-50'
                                                }`}
                                            >
                                                {status === 'pending_payment' && '🟡 Ожидает оплаты'}
                                                {status === 'confirmed' && '✅ Подтверждена'}
                                                {status === 'completed' && '✅ Завершена'}
                                                {status === 'cancelled' && '❌ Отменена'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button onClick={loadProductStats} className="w-full">
                                    Применить фильтры
                                </Button>
                            </div>
                        )}

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                                <p className="mt-3 text-sm text-gray-500">Загрузка аналитики...</p>
                            </div>
                        ) : productStats.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Нет данных за выбранный период</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Продукт</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-900">Заказов</th>
                                                <th className="text-right py-3 px-4 font-semibold text-gray-900">Выручка</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {productStats.map((stat) => (
                                                <tr key={stat.product_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 font-medium text-gray-900">{stat.name}</td>
                                                    <td className="py-3 px-4 text-right text-gray-700">{stat.orders}</td>
                                                    <td className="py-3 px-4 text-right font-semibold text-primary-600">
                                                        {stat.revenue.toLocaleString('ru-RU')} ₽
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-primary-500 bg-primary-50">
                                                <td className="py-3 px-4 font-bold text-gray-900">Итого</td>
                                                <td className="py-3 px-4 text-right font-bold text-gray-900">{totalOrders}</td>
                                                <td className="py-3 px-4 text-right font-bold text-primary-600">
                                                    {totalRevenue.toLocaleString('ru-RU')} ₽
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
