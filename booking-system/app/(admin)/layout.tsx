import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminNav } from '@/components/admin/AdminNav'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <AdminHeader />
            <div className="container mx-auto px-4 py-8">
                <AdminNav />
                <main>{children}</main>
            </div>
        </>
    )
}

