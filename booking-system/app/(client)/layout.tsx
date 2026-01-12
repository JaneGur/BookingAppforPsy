import { ClientNav } from './ClientNav'
import { ClientHeader } from '@/components/client/ClientHeader'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <ClientHeader />
            <div className="container mx-auto px-4 py-8">
                <ClientNav />
                <main>{children}</main>
            </div>
        </>
    )
}