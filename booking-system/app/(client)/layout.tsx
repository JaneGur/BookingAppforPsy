import { ClientNav } from './ClientNav'
import { ClientHeader } from '@/components/client/ClientHeader'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="booking-page-surface min-h-screen">
            <ClientHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ClientNav />
                <main>{children}</main>
            </div>
        </div>
    )
}