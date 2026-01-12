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
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/30 bg-white/80 backdrop-blur-md mb-6 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🌿</span>
                        <span className="text-lg font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">
                            Запись на онлайн-консультацию
                        </span>
                    </Link>

                    {/* Информация о клиенте и действия */}
                    <div className="flex items-center gap-4">
                        {/* Статус уведомлений Telegram */}
                        {!isLoading && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50/80 border border-gray-200/40 shadow-sm">
                                {hasTelegramNotifications ? (
                                    <>
                                        <Bell className="h-4 w-4 text-green-600" />
                                        <span className="text-sm text-gray-700">Уведомления включены</span>
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
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Здравствуйте,</span>
                            <span className="font-semibold text-gray-900">{clientName}</span>
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

