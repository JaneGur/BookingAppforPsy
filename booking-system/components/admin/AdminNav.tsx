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

const navItems = [
    { href: '/admin/dashboard', label: 'Записи', icon: Calendar },
    { href: '/admin/clients', label: 'Клиенты', icon: Users },
    { href: '/admin/products', label: 'Продукты', icon: Package },
    { href: '/admin/blocking', label: 'Блокировки', icon: Ban },
    { href: '/admin/analytics', label: 'Аналитика', icon: BarChart3 },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

// Определяем активный путь с учетом вложенных маршрутов
function isActivePath(pathname: string, href: string) {
    if (href === '/admin/dashboard') {
        return pathname === '/admin/dashboard' || pathname === '/admin'
    }
    return pathname === href || pathname.startsWith(href + '/')
}

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-amber-100/30 border-2 border-amber-200/40 p-2 mb-8 animate-[fadeInUp_0.6s_ease-out]">
            <ul className="flex flex-wrap items-center justify-center gap-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = isActivePath(pathname, href)
                    return (
                        <li key={href} className="flex-1 sm:flex-none min-w-[80px]">
                            <Link
                                href={href}
                                className={cn(
                                    'flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold',
                                    isActive
                                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 scale-105'
                                        : 'text-gray-700 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:text-amber-700 hover:shadow-md'
                                )}
                            >
                                <Icon className={cn(isActive ? 'h-5 w-5' : 'h-4 w-4')} />
                                <span className="text-xs sm:text-sm">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

