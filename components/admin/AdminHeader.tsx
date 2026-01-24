'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminHeader() {
    const { data: session } = useSession()
    const adminName = session?.user?.email || session?.user?.phone || 'Администратор'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-amber-200/40 bg-gradient-to-r from-white/95 via-amber-50/30 to-white/95 backdrop-blur-xl shadow-lg shadow-amber-100/20 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 relative">
                            <Shield className="h-6 w-6 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300 block">
                                Админ-панель
                            </span>
                            <span className="text-xs text-amber-600 font-semibold">Управление системой</span>
                        </div>
                    </Link>

                    {/* Информация и действия */}
                    <div className="flex items-center gap-3">
                        {/* Имя администратора */}
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/80 border-2 border-amber-200/50">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <span className="text-sm text-gray-600">Админ:</span>
                            <span className="text-sm font-bold text-gray-900">{adminName}</span>
                        </div>

                        {/* Кнопка выхода */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600"
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

