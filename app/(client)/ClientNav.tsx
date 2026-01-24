'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User } from 'lucide-react'
import { Path } from '@/lib/routing'

const navLinks = [
    { href: Path.ClientDashboard, label: 'Мои записи', icon: LayoutDashboard },
    { href: Path.ClientTherapist, label: 'О терапевте', icon: User },
]

export function ClientNav() {
    const pathname = usePathname()

    return (
        <nav className="bg-white/95 backdrop-blur-xl p-2 rounded-2xl shadow-xl shadow-primary-100/30 border-2 border-primary-200/40 mb-8 animate-[fadeInUp_0.6s_ease-out]">
            <ul className="flex items-center justify-center gap-2">
                {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.endsWith(href)
                    return (
                        <li key={href} className="flex-1 sm:flex-none">
                            <Link 
                                href={href}
                                className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl transition-all duration-300 ${
                                    isActive
                                        ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold shadow-lg shadow-primary-500/30 scale-105'
                                        : 'text-gray-600 hover:bg-gradient-to-br hover:from-primary-50 hover:to-white hover:text-primary-700 font-semibold hover:shadow-md'
                                }`}
                            >
                                <Icon className={`${isActive ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                <span className="hidden sm:inline">{label}</span>
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}