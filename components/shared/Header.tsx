'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    const { data: session } = useSession()
    const isAuthenticated = !!session?.user

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/40 bg-white/90 backdrop-blur-xl shadow-lg shadow-primary-100/20 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
                    {/* Логотип и название */}
                    <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <span className="text-xl sm:text-2xl">🌿</span>
                        </div>
                        <span className="text-base sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 hidden md:block">
                            Спокойные люди
                        </span>
                    </Link>

                    {/* Навигация */}
                    <nav className="flex items-center gap-1.5 sm:gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button variant="ghost" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-4">
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Мой кабинет</span>
                                    </Link>
                                </Button>
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-primary-50/80 border border-primary-200/50">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                        {session.user.email ?? session.user.phone}
                                    </span>
                                </div>
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
                                <Button variant="ghost" size="sm" asChild className="h-9 sm:h-10 px-2 sm:px-3 group">
                                    <Link href="/login" className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                                            <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">Войти</span>
                                    </Link>
                                </Button>
                                <Button size="sm" asChild className="shadow-lg h-9 sm:h-10 px-2 sm:px-3 group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700">
                                    <Link href="/register" className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 shadow-md group-hover:shadow-lg transition-all group-hover:scale-110">
                                            <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                        </div>
                                        <span className="hidden sm:inline font-medium">Регистрация</span>
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

