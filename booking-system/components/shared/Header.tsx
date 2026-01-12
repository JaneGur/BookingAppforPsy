'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
    const { data: session } = useSession()
    const isAuthenticated = !!session?.user

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary-200/30 bg-white/80 backdrop-blur-md shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Логотип и название */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">🌿</span>
                        <span className="text-lg font-semibold text-primary-900 group-hover:text-primary-600 transition-colors">
                            Запись на онлайн-консультацию
                        </span>
                    </Link>

                    {/* Навигация */}
                    <nav className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/dashboard">
                                        <LayoutDashboard className="h-4 w-4 mr-2" />
                                        Мой кабинет
                                    </Link>
                                </Button>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="hidden sm:inline">
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
                                        <span className="sm:hidden">🔐</span>
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Регистрация</span>
                                        <span className="sm:hidden">📝</span>
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

