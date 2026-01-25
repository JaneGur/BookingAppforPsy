'use client'

import { Users, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClientCardSkeleton } from '@/components/ui/skeleton'
import ClientCard from './ClientCard'
import { Client } from '@/types/client'

interface ClientListProps {
    clients: Client[]
    isLoading: boolean
    hasFilters: string | boolean
    onDelete: (id: string, name: string) => Promise<void>
    isDeleting?: boolean
    onCreateClick: () => void
}

export default function ClientList({
                                       clients,
                                       isLoading,
                                       hasFilters,
                                       onDelete,
                                       isDeleting,
                                       onCreateClick
                                   }: ClientListProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ClientCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (clients.length === 0) {
        return (
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
                        <Button size="lg" onClick={onCreateClick} className="mt-4 shadow-xl">
                            <Plus className="h-5 w-5 mr-2" />
                            Создать первого клиента
                        </Button>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
                <ClientCard
                    key={client.id}
                    client={client}
                    onDelete={onDelete}
                    isDeleting={isDeleting}
                />
            ))}
        </div>
    )
}