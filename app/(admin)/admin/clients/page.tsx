'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {Plus, Users, Menu, X} from 'lucide-react'
import {Card, CardContent} from '@/components/ui/card'
import {Button} from '@/components/ui/button'
import {useDeleteClient} from '@/lib/hooks'
import CreateClientModal from './components/CreateClientModal'
import ClientStats from './components/ClientStats'
import ClientFilters from './components/ClientFilters'
import ClientSorting from './components/ClientSorting'
import ClientList from './components/ClientList'
import ClientLoadMore from './components/ClientPagination'
import {useClientsData} from './hooks/useClientsData'

export default function ClientsPage() {
    const router = useRouter()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const deleteClient = useDeleteClient()

    const {
        clients,
        fullStats,
        pagination,
        isLoading,
        isLoadingMore,
        hasMore,
        filters,
        loadClients,
        loadMore,
        loadFullStats,
        updateFilter,
        resetFilters,
        hasFilters,
        filterClients
    } = useClientsData()

    const filteredClients = filterClients(clients)

    const handleSort = (field: typeof filters.sortField) => {
        if (filters.sortField === field) {
            const nextDirection = filters.sortDirection === 'asc' ? 'desc' : 'asc'
            updateFilter('sortDirection', nextDirection)
            return
        }
        updateFilter('sortField', field)
        updateFilter('sortDirection', 'asc')
    }

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Удалить клиента "${name}"? Это действие необратимо.`)) return

        try {
            await deleteClient.mutateAsync(id)
            loadClients(1, false)
            loadFullStats()
        } catch (error) {
            console.error('Failed to delete:', error)
            alert('Не удалось удалить клиента')
        }
    }

    const handleRefresh = () => {
        loadClients(1, false)
        loadFullStats()
    }

    const handleSuccess = () => {
        loadClients(1, false)
        loadFullStats()
    }

    return (
        <div className="min-h-screen p-2 sm:p-3 lg:p-8 bg-gradient-to-br from-gray-50 to-white">
            {/* Мобильные фильтры */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div
                        className="absolute inset-x-0 bottom-0 h-[80vh] bg-white rounded-t-2xl shadow-xl animate-slideInUp"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/*<div className="p-4 border-b">*/}
                        {/*    <div className="flex items-center justify-between">*/}
                        {/*        <span className="font-semibold text-gray-900">Фильтры и сортировка</span>*/}
                        {/*        <button*/}
                        {/*            onClick={() => setShowMobileFilters(false)}*/}
                        {/*            className="p-2 hover:bg-gray-100 rounded-lg"*/}
                        {/*        >*/}
                        {/*            <X className="h-5 w-5" />*/}
                        {/*        </button>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                        <div className="p-4 h-[calc(100%-80px)] overflow-y-auto space-y-6">
                            {/* Фильтры для мобильных */}
                            <ClientFilters
                                filters={filters}
                                hasFilters={hasFilters}
                                onFilterChange={updateFilter}
                                onReset={resetFilters}
                                onRefresh={handleRefresh}
                                isMobile
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Заголовок */}
                <Card className="border-2 border-gray-200 bg-white shadow-sm">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md lg:shadow-lg flex-shrink-0">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                                            Клиенты
                                        </h1>
                                        <p className="text-xs text-gray-600 mt-0.5">Управление базой клиентов</p>
                                    </div>
                                </div>

                                {/* Мобильное меню кнопка */}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowMobileFilters(true)}
                                    className="md:hidden h-8 w-8 flex-shrink-0"
                                >
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Основные действия */}
                            <Button
                                size="lg"
                                onClick={() => setShowCreateModal(true)}
                                className="shadow-xl w-full lg:w-auto mt-2 lg:mt-0"
                            >
                                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                <span className="hidden sm:inline">Создать клиента</span>
                                <span className="sm:hidden">Новый клиент</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Фильтры - десктоп */}
                <div className="hidden md:block">
                    <ClientFilters
                        filters={filters}
                        hasFilters={hasFilters}
                        onFilterChange={updateFilter}
                        onReset={resetFilters}
                        onRefresh={handleRefresh}
                    />
                </div>

                {/* Сортировка */}
                <ClientSorting
                    sortField={filters.sortField}
                    sortDirection={filters.sortDirection}
                    onSort={handleSort}
                    onOpenMobileFilters={() => setShowMobileFilters(true)}
                />

                {/* Статистика */}
                <ClientStats
                    stats={fullStats}
                    filteredCount={filteredClients.length}
                    isLoading={isLoading}
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

            {/* Кнопка "Показать ещё" */}
            <ClientLoadMore
                hasMore={hasMore}
                isLoading={isLoading}
                isLoadingMore={isLoadingMore}
                onLoadMore={loadMore}
                currentCount={filteredClients.length}
                totalCount={pagination?.totalCount}
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