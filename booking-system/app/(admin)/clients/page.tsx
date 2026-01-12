'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Users, Filter, User, Mail, Phone, MessageSquare, Calendar, Trash2, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Client } from '@/types/client'
import { cn } from '@/lib/utils/cn'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ClientsPage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeOnly, setActiveOnly] = useState(false)

    const loadClients = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (activeOnly) {
                params.append('active_only', 'true')
            }
            if (searchQuery) {
                params.append('search', searchQuery)
            }

            const res = await fetch(`/api/admin/clients?${params.toString()}`)
            if (res.ok) {
                const data = (await res.json()) as Client[]
                setClients(data)
            }
        } catch (error) {
            console.error('Failed to load clients:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadClients()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeOnly])

    // Фильтруем по поисковому запросу
    const filteredClients = useMemo(() => {
        if (!searchQuery) return clients
        const searchLower = searchQuery.toLowerCase()
        return clients.filter(
            (client) =>
                client.name?.toLowerCase().includes(searchLower) ||
                client.phone?.includes(searchQuery) ||
                client.email?.toLowerCase().includes(searchLower) ||
                client.telegram?.toLowerCase().includes(searchLower)
        )
    }, [clients, searchQuery])

    // Сортируем: активные клиенты (с записями) сначала, затем по алфавиту
    const sortedClients = useMemo(() => {
        return [...filteredClients].sort((a, b) => {
            // Сначала по имени
            return (a.name || '').localeCompare(b.name || '', 'ru')
        })
    }, [filteredClients])

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этого клиента? Это действие необратимо и удалит все связанные записи.')) return
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                loadClients()
            }
        } catch (error) {
            console.error('Failed to delete:', error)
        }
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">👥 Клиенты</h1>
                            <p className="text-sm text-gray-600">Управление базой клиентов</p>
                        </div>
                    </div>
                </div>

                {/* Фильтры и поиск */}
                <Card className="booking-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary-500" />
                            Список клиентов
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Поиск */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            loadClients()
                                        }
                                    }}
                                    placeholder="Поиск по имени, телефону, email, telegram..."
                                    className="pl-10"
                                />
                            </div>

                            {/* Фильтр активных */}
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={activeOnly}
                                        onChange={(e) => setActiveOnly(e.target.checked)}
                                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">Только активные</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={loadClients}>
                                Применить
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveOnly(false)
                                    loadClients()
                                }}
                            >
                                Сбросить
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="booking-card">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 mb-1">Всего клиентов</div>
                            <div className="text-2xl font-bold text-primary-900">{clients.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="booking-card">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 mb-1">Активных</div>
                            <div className="text-2xl font-bold text-green-600">{filteredClients.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="booking-card">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 mb-1">С Telegram</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {clients.filter((c) => c.telegram_chat_id).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="booking-card">
                        <CardContent className="p-4">
                            <div className="text-xs text-gray-500 mb-1">С email</div>
                            <div className="text-2xl font-bold text-purple-600">
                                {clients.filter((c) => c.email).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Список клиентов */}
                {isLoading ? (
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-3 text-sm text-gray-500">Загрузка клиентов...</p>
                        </CardContent>
                    </Card>
                ) : sortedClients.length === 0 ? (
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <p className="text-gray-500">Клиенты не найдены</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sortedClients.map((client) => (
                            <Card key={client.id} className="booking-card">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 text-lg mb-1">{client.name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{client.phone}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(client.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            {client.email && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{client.email}</span>
                                                </div>
                                            )}
                                            {client.telegram && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MessageSquare className="h-4 w-4" />
                                                    <span>{client.telegram}</span>
                                                    {client.telegram_chat_id && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                            Уведомления
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-gray-200">
                                            <div className="text-xs text-gray-500">
                                                Регистрация: {format(parseISO(client.created_at), 'd MMM yyyy', { locale: ru })}
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                                        >
                                            <User className="h-4 w-4 mr-2" />
                                            Открыть профиль
                                        </Button>
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

