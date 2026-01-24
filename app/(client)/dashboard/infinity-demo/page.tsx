'use client'

import { ClientBookingsInfinity } from '@/components/client/ClientBookingsInfinity'
import { ClientHistoryInfinity } from '@/components/client/ClientHistoryInfinity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ClientInfinityDemoPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Infinity Queries - Клиентский кабинет</h1>
                <p className="text-gray-600">
                    Демонстрация работы бесконечной загрузки для клиентов
                </p>
            </div>

            <Tabs defaultValue="bookings" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="bookings">Мои записи</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                    <ClientBookingsInfinity />
                </TabsContent>

                <TabsContent value="history">
                    <ClientHistoryInfinity />
                </TabsContent>
            </Tabs>
        </div>
    )
}
