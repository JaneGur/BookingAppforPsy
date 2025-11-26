import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Client } from '../../types/client'

export const clientsApi = createApi({
    reducerPath: 'clientsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Clients'],
    endpoints: (builder) => ({
        // Получить всех клиентов (админ)
        getClients: builder.query<Client[], void>({
            query: () => '/clients',
            providesTags: ['Clients'],
        }),

        // Получить клиента по телефону
        getClientByPhone: builder.query<Client | null, string>({
            query: (phone) => `/clients/phone/${phone}`,
            providesTags: ['Clients'],
        }),

        // Получить клиента по ID
        getClientById: builder.query<Client, number>({
            query: (id) => `/clients/${id}`,
            providesTags: ['Clients'],
        }),

        // Обновить клиента
        updateClient: builder.mutation<Client, { id: number; data: Partial<Client> }>({
            query: ({ id, data }) => ({
                url: `/clients/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Clients'],
        }),
    }),
})

export const {
    useGetClientsQuery,
    useGetClientByPhoneQuery,
    useGetClientByIdQuery,
    useUpdateClientMutation,
} = clientsApi

