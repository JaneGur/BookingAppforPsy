'use client'

import { useState, useEffect } from 'react'
import { Search, User, Mail, Phone, MessageCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useInfinityClients } from '@/lib/hooks/useInfinityClients'
import { LoadMoreButton } from '@/components/ui/LoadMoreButton'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export function ClientsListInfinity() {
    const [searchQuery, setSearchQuery] = useState('')

    const {
        data: clients = [],
        isLoading,
        isInitialLoading,
        isLoadingMore,
        loadMore,
        hasMore,
        reset,
        refetch
    } = useInfinityClients({
        search: searchQuery || undefined,
        activeOnly: false,
        initialLimit: 5
    })

    // Сбрасываем данные при изменении поискового запроса
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            reset()
        }, 300) // Debounce 300ms

        return () => clearTimeout(timeoutId)
    }, [searchQuery, reset])

    const handleSearch = (value: string) => {
        setSearchQuery(value)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Клиенты
                </CardTitle>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Поиск по имени, телефону, email..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isInitialLoading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-20 bg-gray-200 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                ) : clients.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {clients.map((client) => (
                                <div
                                    key={client.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">{client.name}</h3>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {client.role}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                                {client.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}

                                                {client.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{client.email}</span>
                                                    </div>
                                                )}

                                                {client.telegram && (
                                                    <div className="flex items-center gap-2">
                                                        <MessageCircle className="w-4 h-4" />
                                                        <span>{client.telegram}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        Создан: {format(new Date(client.created_at), 'dd MMM yyyy', { locale: ru })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <LoadMoreButton
                            onClick={loadMore}
                            isLoading={isLoadingMore}
                            hasMore={hasMore}
                            loadingText="Загрузка клиентов..."
                            defaultText="Показать ещё клиентов"
                        />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
