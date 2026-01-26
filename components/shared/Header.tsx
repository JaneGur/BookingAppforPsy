'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, UserPlus, LogOut, LayoutDashboard, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    const { data: session } = useSession()
    const isAuthenticated = !!session?.user

    const userLabel = session?.user?.email ?? session?.user?.phone ?? ''
    const userInitial = userLabel?.[0]?.toUpperCase() ?? 'U'

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/40 bg-white/90 backdrop-blur-xl shadow-lg shadow-primary-100/20">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-3">
                    {/* Логотип */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 sm:gap-3 group flex-shrink-0"
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <span className="text-xl sm:text-2xl">🌿</span>
                        </div>
                        <span className="hidden md:block text-base sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition">
                            Спокойные люди
                        </span>
                    </Link>

                    {/* Навигация */}
                    <nav className="flex items-center gap-2 sm:gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Мой кабинет */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-9 sm:h-10 px-2 sm:px-4"
                                >
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">
                                            Мой кабинет
                                        </span>
                                    </Link>
                                </Button>

                                {/* EMAIL / PHONE — desktop */}
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary-50/80 border border-primary-200/50">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[160px]">
                                        {userLabel}
                                    </span>
                                </div>

                                {/* USER ICON — mobile */}
                                <Link
                                    href="/dashboard"
                                    title={userLabel}
                                    className="flex lg:hidden items-center justify-center w-9 h-9 rounded-full bg-primary-100 border border-primary-200 text-primary-700 font-semibold"
                                >
                                    {userInitial}
                                </Link>

                                {/* Выйти */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="h-9 sm:h-10 px-2 sm:px-4"
                                >
                                    <LogOut className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Выйти</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Войти */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-9 sm:h-10 px-2 sm:px-3"
                                >
                                    <Link href="/login" className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600">
                                            <LogIn className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">
                                            Войти
                                        </span>
                                    </Link>
                                </Button>

                                {/* Регистрация */}
                                <Button
                                    size="sm"
                                    asChild
                                    className="h-9 sm:h-10 px-2 sm:px-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                >
                                    <Link href="/register" className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                            <UserPlus className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">
                                            Регистрация
                                        </span>
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
