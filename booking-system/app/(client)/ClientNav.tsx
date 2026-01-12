'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User } from 'lucide-react'

const navLinks = [
    { href: '/dashboard', label: 'Мои записи', icon: LayoutDashboard },
    { href: '/therapist', label: 'О терапевте', icon: User },
]

export function ClientNav() {
    const pathname = usePathname()

    return (
        <nav className="bg-white/70 backdrop-blur-lg p-4 rounded-xl shadow-md border border-gray-200/50 mb-8">
            <ul className="flex items-center justify-center gap-4 sm:gap-8">
                {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.endsWith(href)
                    return (
                        <li key={href}>
                            <Link href={`/dashboard${href.replace('/dashboard', '')}`} // Простое решение для префикса
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                      isActive
                                          ? 'bg-teal-50 text-teal-600 font-semibold'
                                          : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                            >
                                <Icon size={18}/>
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}