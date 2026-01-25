'use client'

import { Users, User, MessageSquare, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StatCardSkeleton } from '@/components/ui/skeleton'
import { ClientsStats } from './types'

interface ClientStatsProps {
    stats: ClientsStats | null
    filteredCount: number
    isLoading: boolean
}

export default function ClientStats({ stats, filteredCount, isLoading }: ClientStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    const statCards = [
        {
            key: 'total',
            title: 'Всего',
            value: stats?.total || 0,
            icon: Users,
            color: 'from-primary-600 to-primary-800'
        },
        {
            key: 'active',
            title: 'Активных',
            value: filteredCount,
            icon: User,
            color: 'text-green-600'
        },
        {
            key: 'telegram',
            title: 'Telegram',
            value: stats?.withTelegram || 0,
            icon: MessageSquare,
            color: 'text-blue-600'
        },
        {
            key: 'email',
            title: 'Email',
            value: stats?.withEmail || 0,
            icon: Mail,
            color: 'text-purple-600'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map(({ key, title, value, icon: Icon, color }) => (
                <Card key={key} className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="text-xs sm:text-sm font-medium text-gray-600">{title}</div>
                            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color.includes('text-') ? color : 'text-primary-500'}`} />
                        </div>
                        <div className={`text-2xl sm:text-3xl font-bold ${color.includes('from-')
                            ? `bg-gradient-to-br ${color} bg-clip-text text-transparent`
                            : color}`}>
                            {value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}