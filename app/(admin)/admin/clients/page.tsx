'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plus, Users} from 'lucide-react'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useDeleteClient} from '@/lib/hooks'
import CreateClientModal from './components/CreateClientModal'
import ClientStats from './components/ClientStats'
import ClientFilters from './components/ClientFilters'
import ClientSorting from './components/ClientSorting'
import ClientList from './components/ClientList'
import ClientPagination from './components/ClientPagination'
import {useClientsData} from './hooks/useClientsData'

export default function ClientsPage() {
    const router = useRouter()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const deleteClient = useDeleteClient()

    const {
        clients,
        fullStats,
        pagination,
        isLoading,
        filters,
        loadClients,
        loadFullStats,
        updateFilter,
        resetFilters,
        hasFilters,
        filterClients
    } = useClientsData()

    const filteredClients = filterClients(clients)

    const handlePageChange = (page: number) => {
        if (pagination && page >= 1 && page <= pagination.totalPages) {
            loadClients(page)
        }
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Вы уверены, что хотите удалить клиента "${name}"? Это действие необратимо и удалит все связанные записи.`)) return

        try {
            await deleteClient.mutateAsync(id)
            loadClients(filters.currentPage)
            loadFullStats()
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Не удалось удалить клиента')
        }
    }

    const handleRefresh = () => {
        loadClients(filters.currentPage, true)
        loadFullStats()
    }

    const handleSuccess = () => {
        loadClients(1)
        loadFullStats()
    }

    return (
        <div className="booking-page-surface min-h-screen p-3 sm:p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                {/* Заголовок */}
                <Card className="booking-card border-2">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                                        Клиенты
                                    </h1>
                                    <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Управление базой клиентов</p>
                                </div>
                            </div>
                            <Button size="lg" onClick={() => setShowCreateModal(true)} className="shadow-xl w-full sm:w-auto">
                                <Plus className="h-5 w-5 mr-2" />
                                Создать клиента
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Фильтры */}
                <ClientFilters
                    filters={filters}
                    hasFilters={hasFilters}
                    onFilterChange={updateFilter}
                    onReset={resetFilters}
                    onRefresh={handleRefresh}
                />

                {/* Статистика */}
                <ClientStats
                    stats={fullStats}
                    filteredCount={filteredClients.length}
                    isLoading={isLoading}
                />

                {/* Сортировка */}
                <ClientSorting
                    sortField={filters.sortField}
                    sortDirection={filters.sortDirection}
                    onSort={(field) => updateFilter('sortField', field)}
                />

                {/* Список клиентов */}
                <ClientList
                    clients={filteredClients}
                    isLoading={isLoading}
                    hasFilters={hasFilters}
                    onDelete={handleDelete}
                    isDeleting={deleteClient.isPending}
                    onCreateClick={() => setShowCreateModal(true)}
                />
            </div>

            {/* Пагинация */}
            <ClientPagination
                pagination={pagination}
                isLoading={isLoading}
                onPageChange={handlePageChange}
            />

            {/* Модальное окно создания */}
            {showCreateModal && (
                <CreateClientModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    )
}