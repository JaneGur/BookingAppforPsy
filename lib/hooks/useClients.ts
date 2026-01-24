import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Client {
    id: string
    name: string
    phone: string
    email?: string
    telegram?: string
    telegram_chat_id?: string
    role: 'client' | 'admin'
    created_at: string
}

export interface ClientProfile {
    client: Client
    total_bookings: number
    upcoming_bookings: number
    completed_bookings: number
    cancelled_bookings: number
    first_booking?: string
    last_booking?: string
}

// Получить список всех клиентов
export function useClients(search?: string, activeOnly?: boolean) {
    return useQuery({
        queryKey: ['admin', 'clients', search, activeOnly],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (activeOnly) params.append('active_only', 'true')
            
            const res = await fetch(`/api/admin/clients?${params}`)
            if (!res.ok) throw new Error('Failed to fetch clients')
            return res.json() as Promise<Client[]>
        },
    })
}

// Получить детальную информацию о клиенте с историей записей
export function useClientProfile(clientId: string | undefined) {
    return useQuery({
        queryKey: ['admin', 'clients', clientId],
        queryFn: async () => {
            const res = await fetch(`/api/admin/clients/${clientId}`)
            if (!res.ok) throw new Error('Failed to fetch client profile')
            return res.json() as Promise<{
                profile: ClientProfile
                bookings: any[]
            }>
        },
        enabled: !!clientId,
    })
}

// Обновить данные клиента (с optimistic update) ⚡
export function useUpdateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ clientId, data }: { clientId: string; data: Partial<Client> }) => {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update client')
            }
            return res.json() as Promise<Client>
        },
        onMutate: async ({ clientId, data }) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey: ['admin', 'clients', clientId] })

            // Сохраняем предыдущие данные
            const previousClient = queryClient.getQueryData(['admin', 'clients', clientId])

            // 🎯 OPTIMISTIC UPDATE - мгновенно обновляем UI
            queryClient.setQueryData(['admin', 'clients', clientId], (old: any) => {
                if (old?.profile?.client) {
                    return {
                        ...old,
                        profile: {
                            ...old.profile,
                            client: { ...old.profile.client, ...data },
                        },
                    }
                }
                return old
            })

            return { previousClient }
        },
        onError: (err, variables, context) => {
            // ❌ При ошибке - откатываем изменения
            if (context?.previousClient) {
                queryClient.setQueryData(['admin', 'clients', variables.clientId], context.previousClient)
            }
            console.error('Failed to update client:', err)
        },
        onSettled: (data, error, variables) => {
            // ✅ Обновляем данные с сервера
            queryClient.invalidateQueries({ queryKey: ['admin', 'clients', variables.clientId] })
            queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] })
        },
    })
}

// Удалить клиента (с optimistic update) ⚡
export function useDeleteClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (clientId: string) => {
            const res = await fetch(`/api/admin/clients/${clientId}`, {
                method: 'DELETE',
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to delete client')
            }
            return clientId
        },
        onMutate: async (clientId) => {
            // Отменяем текущие запросы
            await queryClient.cancelQueries({ queryKey: ['admin', 'clients'] })

            // Сохраняем предыдущие данные
            const previousClients = queryClient.getQueryData(['admin', 'clients'])

            // 🎯 OPTIMISTIC UPDATE - мгновенно удаляем из UI
            queryClient.setQueriesData({ queryKey: ['admin', 'clients'] }, (old: any) => {
                if (Array.isArray(old)) {
                    return old.filter((client: Client) => client.id !== clientId)
                }
                return old
            })

            return { previousClients }
        },
        onError: (err, clientId, context) => {
            // ❌ При ошибке - откатываем изменения
            if (context?.previousClients) {
                queryClient.setQueryData(['admin', 'clients'], context.previousClients)
            }
            console.error('Failed to delete client:', err)
        },
        onSettled: () => {
            // ✅ Обновляем данные с сервера
            queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] })
        },
    })
}
