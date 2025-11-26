import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const slotsApi = createApi({
    reducerPath: 'slotsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Slots'],
    endpoints: (builder) => ({
        // Получить доступные слоты
        getAvailableSlots: builder.query<string[], string>({
            query: (date) => `/slots/available?date=${date}`,
            providesTags: ['Slots'],
        }),
    }),
})

export const { useGetAvailableSlotsQuery } = slotsApi