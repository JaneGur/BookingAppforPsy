'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, User, Mail, Phone, MessageSquare, Trash2, Eye, AlertCircle, Plus, ArrowUpDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClients, useDeleteClient } from '@/lib/hooks'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO, startOfDay, endOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { ClientCardSkeleton, StatCardSkeleton } from '@/components/ui/skeleton'
import { Client } from '@/types/client'

type SortField = 'name' | 'created_at' | 'bookings_count' | 'last_booking'
type SortDirection = 'asc' | 'desc'

interface CreateClientModalProps {
    onClose: () => void
    onSuccess: () => void
}

function CreateClientModal({ onClose, onSuccess }: CreateClientModalProps) {
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [telegram, setTelegram] = useState('')
    const [password, setPassword] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreate = async () => {
        if (!name.trim() || !phone.trim() || !password.trim()) {
            setError('Заполните все обязательные поля')
            return
        }

        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов')
            return
        }

        setIsCreating(true)
        setError(null)

        try {
            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, email, telegram, password }),
            })

            if (res.ok) {
                onSuccess()
                onClose()
            } else {
                const data = await res.json()
                setError(data.error || 'Не удалось создать клиента')
            }
        } catch (error) {
            setError('Ошибка при создании клиента')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />
            <div
                className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Создать клиента</h2>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200">
                            <div className="flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Имя <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Иван Иванов"
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Телефон <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+7 (999) 999-99-99"
                                className="h-11 font-mono"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@mail.com"
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Telegram</label>
                            <Input
                                value={telegram}
                                onChange={(e) => setTelegram(e.target.value)}
                                placeholder="@username"
                                className="h-11"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                Пароль <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Минимум 6 символов"
                                className="h-11"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isCreating}>
                            Отмена
                        </Button>
                        <Button onClick={handleCreate} className="flex-1" disabled={isCreating}>
                            {isCreating ? 'Создание...' : 'Создать'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ClientsPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeOnly, setActiveOnly] = useState(false)
    const [withTelegram, setWithTelegram] = useState(false)
    const [withEmail, setWithEmail] = useState(false)
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    const [sortField, setSortField] = useState<SortField>('created_at')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    // Настоящая пагинация для клиентов
    const [currentPage, setCurrentPage] = useState(1)
    const [clients, setClients] = useState<Client[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0) // Общее количество для статистики
    const [fullStats, setFullStats] = useState<any>(null) // Полная статистика по всем данным

    const loadClients = async (page: number = 1, resetSearch: boolean = false) => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '5', // По 5 клиентов на страницу
                sort_by: sortField,
                sort_order: sortDirection
            })

            // Для поиска используем большой limit чтобы найти все совпадения
            if (searchQuery && !resetSearch) {
                params.append('search', searchQuery)
                params.set('limit', '1000') // Увеличиваем лимит для поиска
            }
            if (activeOnly) {
                params.append('activeOnly', 'true')
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to load clients')
            const result = await res.json()

            setClients(result.data || [])
            setPagination(result.pagination)
            setTotalCount(result.pagination?.totalCount || 0) // Сохраняем общее количество
            setCurrentPage(page)
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Загрузка полной статистики по всем клиентам
    const loadFullStats = async () => {
        try {
            const params = new URLSearchParams({
                limit: '10000', // Большой лимит для получения всех данных
                sort_by: sortField,
                sort_order: sortDirection
            })

            if (searchQuery) {
                params.append('search', searchQuery)
            }
            if (activeOnly) {
                params.append('activeOnly', 'true')
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (!res.ok) throw new Error('Failed to load full client stats')
            const result = await res.json()

            const allClients = result.data || []

            // Считаем статистику по всем данным
            const stats = {
                total: allClients.length,
                withTelegram: allClients.filter((c: any) => c.telegram_chat_id).length,
                withEmail: allClients.filter((c: any) => c.email).length,
            }

            setFullStats(stats)
        } catch (error) {
            console.error('Error loading full client stats:', error)
        }
    }

    // Загружаем первую страницу при монтировании
    useEffect(() => {
        loadClients(1)
        loadFullStats() // Загружаем полную статистику при монтировании
    }, [])

    // Применяем фильтры
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1)
            loadClients(1, true)
            loadFullStats() // Загружаем полную статистику при изменении фильтров
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, activeOnly, sortField, sortDirection])

    const handlePageChange = (page: number) => {
        if (pagination && page >= 1 && page <= pagination.totalPages) {
            loadClients(page)
        }
    }
    const deleteClient = useDeleteClient()

    // Фильтрация
    const filteredClients = useMemo(() => {
        if (!Array.isArray(clients)) return []
        let result = [...clients]

        if (withTelegram) {
            result = result.filter((c) => c.telegram_chat_id)
        }

        if (withEmail) {
            result = result.filter((c) => c.email)
        }

        if (dateFrom) {
            const from = startOfDay(new Date(dateFrom))
            result = result.filter((c) => new Date(c.created_at) >= from)
        }

        if (dateTo) {
            const to = endOfDay(new Date(dateTo))
            result = result.filter((c) => new Date(c.created_at) <= to)
        }

        return result
    }, [clients, withTelegram, withEmail, dateFrom, dateTo])

    // Сортировка
    const sortedClients = useMemo(() => {
        const result = [...filteredClients]

        result.sort((a, b) => {
            let aVal: any
            let bVal: any

            switch (sortField) {
                case 'name':
                    aVal = a.name || ''
                    bVal = b.name || ''
                    return sortDirection === 'asc'
                        ? aVal.localeCompare(bVal, 'ru')
                        : bVal.localeCompare(aVal, 'ru')
                case 'created_at':
                    aVal = new Date(a.created_at).getTime()
                    bVal = new Date(b.created_at).getTime()
                    break
                // TODO: добавить поля bookings_count и last_booking в Client type
                default:
                    return 0
            }

            if (sortDirection === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

        return result
    }, [filteredClients, sortField, sortDirection])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Вы уверены, что хотите удалить клиента "${name}"? Это действие необратимо и удалит все связанные записи.`)) return

        try {
            await deleteClient.mutateAsync(id)
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Не удалось удалить клиента')
        }
    }

    const handleReset = () => {
        setSearchQuery('')
        setActiveOnly(false)
        setWithTelegram(false)
        setWithEmail(false)
        setDateFrom('')
        setDateTo('')
    }

    const hasFilters = searchQuery || activeOnly || withTelegram || withEmail || dateFrom || dateTo

    return (
        <div className="booking-page-surface min-h-screen p-3 sm:p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                {/* Заголовок */}
                <Card className="booking-card border-2">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                                        Клиенты
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Управление базой клиентов</p>
                                </div>
                            </div>
                            <Button size="lg" onClick={() => setShowCreateModal(true)} className="shadow-xl w-full sm:w-auto">
                                <Plus className="h-5 w-5 mr-2" />
                                Создать клиента
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Фильтры и поиск */}
                <Card className="booking-card border-2">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">Поиск и фильтры</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Поиск */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск по имени, телефону, email..."
                                className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base"
                            />
                        </div>

                        {/* Чекбоксы фильтров */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                            <label className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <input
                                    type="checkbox"
                                    checked={activeOnly}
                                    onChange={(e) => setActiveOnly(e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Активные</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                <input
                                    type="checkbox"
                                    checked={withTelegram}
                                    onChange={(e) => setWithTelegram(e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">С Telegram</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 col-span-2 sm:col-span-1">
                                <input
                                    type="checkbox"
                                    checked={withEmail}
                                    onChange={(e) => setWithEmail(e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-xs sm:text-sm font-medium text-gray-700">С Email</span>
                            </label>
                        </div>

                        {/* Дата регистрации */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">От даты</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-10 sm:h-11"
                                />
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 block">До даты</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-10 sm:h-11"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button variant="ghost" size="sm" onClick={() => loadClients(currentPage)}>
                                Обновить
                            </Button>
                            {hasFilters && (
                                <Button variant="ghost" size="sm" onClick={handleReset}>
                                    Сбросить все
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Статистика */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <StatCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="text-xs sm:text-sm font-medium text-gray-600">Всего</div>
                                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-br from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                    {fullStats?.total || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="text-xs sm:text-sm font-medium text-gray-600">Активных</div>
                                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-green-600">{sortedClients.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="text-xs sm:text-sm font-medium text-gray-600">Telegram</div>
                                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                                    {fullStats?.withTelegram || 0}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <div className="text-xs sm:text-sm font-medium text-gray-600">Email</div>
                                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                                    {fullStats?.withEmail || 0}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Сортировка */}
                <Card className="booking-card border-2">
                    <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 mr-2">Сортировка:</span>
                            {[
                                { field: 'name' as SortField, label: 'По имени' },
                                { field: 'created_at' as SortField, label: 'По дате регистрации' },
                            ].map(({ field, label }) => (
                                <button
                                    key={field}
                                    onClick={() => handleSort(field)}
                                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 ${sortField === field
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {label}
                                    {sortField === field && (
                                        <ArrowUpDown className={`h-3 w-3 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Список клиентов */}
                {isLoading ? (
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <ClientCardSkeleton key={i} />
                        ))}
                    </div>
                ) : sortedClients.length === 0 ? (
                    <Card className="booking-card border-2">
                        <CardContent className="p-12 sm:p-16 text-center">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                            </div>
                            <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Клиенты не найдены</p>
                            <p className="text-sm text-gray-500 mb-4">
                                {hasFilters
                                    ? 'Попробуйте изменить параметры поиска'
                                    : 'В базе данных пока нет зарегистрированных клиентов'}
                            </p>
                            {!hasFilters && (
                                <Button size="lg" onClick={() => setShowCreateModal(true)} className="mt-4 shadow-xl">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Создать первого клиента
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {sortedClients.map((client) => (
                            <Card key={client.id} className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                                <CardContent className="p-4 sm:p-5">
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 truncate">{client.name}</h3>
                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                                    <span className="font-mono truncate">{client.phone}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                                                    className="hover:bg-primary-50 h-8 w-8 sm:h-9 sm:w-9"
                                                >
                                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(client.id, client.name)}
                                                    disabled={deleteClient.isPending}
                                                    className="hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9"
                                                >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs sm:text-sm">
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50">
                                                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-purple-500" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                            )}
                                            {client.telegram && (
                                                <div className="flex items-center gap-2 text-gray-600 p-2 rounded-lg hover:bg-gray-50">
                                                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500" />
                                                    <span className="truncate flex-1">{client.telegram}</span>
                                                    {client.telegram_chat_id && (
                                                        <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-3 border-t-2 border-gray-100">
                                            <div className="text-[10px] sm:text-xs text-gray-500 mb-3">
                                                📅 Регистрация: {format(parseISO(client.created_at), 'd MMM yyyy', { locale: ru })}
                                            </div>
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full shadow-lg text-sm sm:text-base h-10 sm:h-11"
                                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                                        >
                                            <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                            Открыть профиль
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Пагинация */}
            {
                pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-gray-600">
                            Показано {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.totalCount)} из {pagination.totalCount} клиентов
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage <= 1 || isLoading}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Назад
                            </Button>

                            <span className="text-sm font-medium">
                                Страница {currentPage} из {pagination.totalPages}
                            </span>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= pagination.totalPages || isLoading}
                            >
                                Вперед
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )
            }

            {/* Модальное окно создания */}
            {
                showCreateModal && (
                    <CreateClientModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => loadClients(1)}
                    />
                )
            }
        </div >
    )
}
