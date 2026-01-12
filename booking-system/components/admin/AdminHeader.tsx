'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
    const { data: session } = useSession()
    const adminName = session?.user?.email || session?.user?.phone || 'Администратор'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/30 bg-white/80 backdrop-blur-md mb-6 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/admin/dashboard" className="flex items-center gap-2 group">
                        <span className="text-2xl">🌿</span>
                        <span className="text-lg font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">
                            Панель администратора
                        </span>
                    </Link>

                    {/* Информация и действия */}
                    <div className="flex items-center gap-4">
                        {/* Имя администратора */}
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Здравствуйте,</span>
                            <span className="font-semibold text-gray-900">{adminName}</span>
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

