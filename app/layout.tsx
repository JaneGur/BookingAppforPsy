import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
    title: 'Запись на консультацию к психологу',
    description: 'Онлайн-запись на консультацию к психологу Анне',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
        <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
        </body>
        </html>
    )
}