'use client'

import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Phone, Mail, MessageSquare, User, Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Client } from '@/types/client'

interface ClientCardProps {
    client: Client
    onDelete: (id: string, name: string) => Promise<void>
    isDeleting?: boolean
}

export default function ClientCard({ client, onDelete, isDeleting }: ClientCardProps) {
    const router = useRouter()

    return (
        <Card className="booking-card border-2 hover:shadow-2xl hover:-translate-y-1 transition-all group">
            <CardContent className="p-4 sm:p-5">
                <div className="space-y-3 sm:space-y-4">
                    {/* Заголовок и действия */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 truncate">
                                {client.name}
                            </h3>
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
                                onClick={() => onDelete(client.id, client.name)}
                                disabled={isDeleting}
                                className="hover:bg-red-50 h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Контактная информация */}
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

                    {/* Дополнительная информация */}
                    <div className="pt-3 border-t-2 border-gray-100">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-3">
                            📅 Регистрация: {format(parseISO(client.created_at), 'd MMM yyyy', { locale: ru })}
                        </div>
                    </div>

                    {/* Кнопка открытия профиля */}
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
    )
}