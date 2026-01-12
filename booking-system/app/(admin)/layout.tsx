import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="booking-page-surface min-h-screen">
            <AdminHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AdminNav />
                <main>{children}</main>
            </div>
        </div>
    )
}

