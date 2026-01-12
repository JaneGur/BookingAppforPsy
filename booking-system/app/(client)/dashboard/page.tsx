import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ClientDashboardTabs } from '@/components/client/ClientDashboardTabs'

export default async function ClientDashboardPage() {
    const session = await auth()

    // Временно отключено для тестирования
    // if (!session?.user?.id) {
    //     redirect('/login')
    // }

    return <ClientDashboardTabs />
}