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
        <nav className="bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-primary-200/30 p-4 mb-6">
            <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = isActivePath(pathname, href)
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                                    isActive
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}

