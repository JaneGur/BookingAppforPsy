'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Bell, BellOff, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface ClientProfile {
    name: string
    email?: string
    phone: string
    telegram_chat_id?: string
}

export function ClientHeader() {
    const { data: session } = useSession()
    const [profile, setProfile] = useState<ClientProfile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            if (!session?.user?.id) {
                setIsLoading(false)
                return
            }

            try {
                const res = await fetch('/api/profile')
                if (res.ok) {
                    const data = (await res.json()) as ClientProfile
                    setProfile(data)
                }
            } catch (error) {
                console.error('Failed to load profile:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadProfile()
    }, [session?.user?.id])

    const hasTelegramNotifications = !!profile?.telegram_chat_id
    const clientName = profile?.name || session?.user?.email || session?.user?.phone || 'Гость'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/40 bg-white/90 backdrop-blur-xl shadow-lg shadow-primary-100/20 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <span className="text-2xl">🌿</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 hidden md:block">
                            Спокойные люди
                        </span>
                    </Link>

                    {/* Информация о клиенте и действия */}
                    <div className="flex items-center gap-3">
                        {/* Статус уведомлений Telegram */}
                        {!isLoading && (
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-white to-gray-50/80 border-2 border-primary-200/40 shadow-md">
                                {hasTelegramNotifications ? (
                                    <>
                                        <div className="relative">
                                            <Bell className="h-4 w-4 text-green-600" />
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Уведомления включены</span>
                                    </>
                                ) : (
                                    <>
                                        <BellOff className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Уведомления выключены</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Имя клиента */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50/80 border-2 border-primary-200/50">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm text-gray-600">Здравствуйте,</span>
                            <span className="text-sm font-bold text-gray-900">{clientName}</span>
                        </div>

                        {/* Кнопка выхода */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Выйти</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}

