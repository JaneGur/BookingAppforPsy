import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {Product} from "@/types/product";


export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        // Получить все активные продукты
        getProducts: builder.query<Product[], void>({
            query: () => '/products',
            providesTags: ['Products'],
        }),

        // Получить продукт по умолчанию (featured)
        getFeaturedProduct: builder.query<Product | null, void>({
            query: () => '/products/featured',
            providesTags: ['Products'],
        }),

        // CRUD для админа
        createProduct: builder.mutation<Product, Partial<Product>>({
            query: (product) => ({
                url: '/products',
                method: 'POST',
                body: product,
            }),
            invalidatesTags: ['Products'],
        }),

        updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> }>({
            query: ({ id, data }) => ({
                url: `/products/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Products'],
        }),

        deleteProduct: builder.mutation<void, number>({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products'],
        }),
    }),
})

export const {
    useGetProductsQuery,
    useGetFeaturedProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productsApi