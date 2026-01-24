'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Calendar,
    Users,
    Package,
    Ban,
    BarChart3,
    Settings,
    LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Path } from '@/lib/routing'

const navItems = [
    { href: Path.AdminDashboard, label: 'Записи', icon: Calendar },
    { href: Path.AdminClients, label: 'Клиенты', icon: Users },
    { href: Path.AdminProducts, label: 'Продукты', icon: Package },
    { href: Path.AdminBlocking, label: 'Блокировки', icon: Ban },
    { href: Path.AdminAnalytics, label: 'Аналитика', icon: BarChart3 },
    { href: Path.AdminSettings, label: 'Настройки', icon: Settings },
]

// Определяем активный путь с учетом вложенных маршрутов
function isActivePath(pathname: string, href: string) {
    if (href === Path.AdminDashboard) {
        return pathname === Path.AdminDashboard || pathname === '/admin'
    }
    return pathname === href || pathname.startsWith(href + '/')
}

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-100/30 border-2 border-amber-200/40 p-1.5 sm:p-2 mb-6 sm:mb-8 animate-[fadeInUp_0.6s_ease-out] overflow-x-auto">
            <ul className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 min-w-max sm:min-w-0">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = isActivePath(pathname, href)
                    return (
                        <li key={href} className="flex-shrink-0">
                            <Link
                                href={href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold whitespace-nowrap',
                                    isActive
                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                                        : 'text-gray-700 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 hover:shadow-md'
                                )}
                            >
                                <Icon className={cn('flex-shrink-0', isActive ? 'h-5 w-5 sm:h-5 sm:w-5' : 'h-4 w-4 sm:h-5 sm:w-5')} />
                                <span className="text-[10px] sm:text-xs lg:text-sm">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

