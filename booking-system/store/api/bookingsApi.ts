import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {Booking} from "../../types/booking";


export const bookingsApi = createApi({
    reducerPath: 'bookingsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Bookings'],
    endpoints: (builder) => ({
        // Получить все записи клиента
        getClientBookings: builder.query<Booking[], string>({
            query: (phone) => `/bookings?phone=${phone}`,
            providesTags: ['Bookings'],
        }),

        // Получить ближайшую запись
        getUpcomingBooking: builder.query<Booking | null, string>({
            query: (phone) => `/bookings/upcoming?phone=${phone}`,
            providesTags: ['Bookings'],
        }),

        // Получить заказ в ожидании оплаты
        getPendingBooking: builder.query<Booking | null, string>({
            query: (phone) => `/bookings/pending?phone=${phone}`,
            providesTags: ['Bookings'],
        }),

        // Создать запись
        createBooking: builder.mutation<Booking, Partial<Booking>>({
            query: (booking) => ({
                url: '/bookings',
                method: 'POST',
                body: booking,
            }),
            invalidatesTags: ['Bookings'],
        }),

        // Обновить запись
        updateBooking: builder.mutation<Booking, { id: number; data: Partial<Booking> }>({
            query: ({ id, data }) => ({
                url: `/bookings/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Bookings'],
        }),

        // Отменить запись
        cancelBooking: builder.mutation<void, { id: number; phone: string }>({
            query: ({ id, phone }) => ({
                url: `/bookings/${id}/cancel`,
                method: 'POST',
                body: { phone },
            }),
            invalidatesTags: ['Bookings'],
        }),

        // Отметить как оплачено (админ)
        markBookingPaid: builder.mutation<void, number>({
            query: (id) => ({
                url: `/bookings/${id}/mark-paid`,
                method: 'POST',
            }),
            invalidatesTags: ['Bookings'],
        }),
    }),
})

export const {
    useGetClientBookingsQuery,
    useGetUpcomingBookingQuery,
    useGetPendingBookingQuery,
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useCancelBookingMutation,
    useMarkBookingPaidMutation,
} = bookingsApi