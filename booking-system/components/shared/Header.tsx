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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                            <span className="text-2xl">🌿</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300 hidden md:block" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Арт-терапия
                        </span>
                    </Link>

                    {/* Навигация */}
                    <nav className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Мой кабинет</span>
                                    </Link>
                                </Button>
                                <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50/80 border border-primary-200/50">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {session.user.email ?? session.user.phone}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Выйти</span>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">
                                        <LogIn className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Войти</span>
                                    </Link>
                                </Button>
                                <Button size="sm" asChild className="shadow-lg">
                                    <Link href="/register">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Регистрация</span>
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

