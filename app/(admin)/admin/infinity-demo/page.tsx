'use client'

import { SimpleBookingsList } from '@/components/admin/SimpleBookingsList'
import { PaginatedBookingsList } from '@/components/admin/PaginatedBookingsList'
import { ClientsListInfinity } from '@/components/admin/ClientsListInfinity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InfinityDemoPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Infinity Queries Demo</h1>
                <p className="text-gray-600">
                    Демонстрация работы бесконечной загрузки и пагинации с кнопкой "Показать ещё"
                </p>
            </div>

            <Tabs defaultValue="bookings" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="bookings">Заказы (Infinity)</TabsTrigger>
                    <TabsTrigger value="paginated">Заказы (Пагинация)</TabsTrigger>
                    <TabsTrigger value="clients">Клиенты</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                    <SimpleBookingsList />
                </TabsContent>

                <TabsContent value="paginated">
                    <PaginatedBookingsList />
                </TabsContent>

                <TabsContent value="clients">
                    <ClientsListInfinity />
                </TabsContent>
            </Tabs>
        </div>
    )
}
