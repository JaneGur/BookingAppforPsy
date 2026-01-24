'use client'

import { SessionProvider } from 'next-auth/react'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { BookingProvider } from '@/lib/contexts/BookingContext'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <QueryProvider>
                <BookingProvider>
                    {children}
                </BookingProvider>
            </QueryProvider>
        </SessionProvider>
    )
}
