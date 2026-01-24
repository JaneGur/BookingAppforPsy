# 🔄 Руководство по миграции с Redux на React Query

Это приложение было мигрировано с **Redux Toolkit + RTK Query** на **React Query + Context API**.

---

## 📊 Что изменилось

### Удалено:
- ❌ `@reduxjs/toolkit`
- ❌ `react-redux`
- ❌ `redux-persist`
- ❌ Папка `store/` со всеми файлами
- ❌ Сложная настройка middleware и persistence

### Добавлено:
- ✅ `@tanstack/react-query` (React Query v5)
- ✅ `lib/providers/QueryProvider.tsx`
- ✅ `lib/contexts/BookingContext.tsx`
- ✅ `lib/hooks/useBookings.ts`
- ✅ `lib/hooks/useSlots.ts`
- ✅ `lib/hooks/useProducts.ts`

---

## 🔄 Паттерны миграции

### 1. API Запросы (RTK Query → React Query)

**Было (RTK Query):**
```typescript
// store/api/bookingsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const bookingsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    getClientBookings: builder.query({
      query: (phone) => `/bookings?phone=${phone}`,
      providesTags: ['Bookings'],
    }),
  }),
})

// В компоненте:
import { useGetClientBookingsQuery } from '@/store/api/bookingsApi'

const { data: bookings, isLoading } = useGetClientBookingsQuery(phone, {
  skip: !phone,
})
```

**Стало (React Query):**
```typescript
// lib/hooks/useBookings.ts
import { useQuery } from '@tanstack/react-query'

export function useClientBookings(phone: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'client', phone],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?phone=${phone}`)
      if (!res.ok) throw new Error('Failed to fetch bookings')
      return res.json()
    },
    enabled: !!phone,
  })
}

// В компоненте:
import { useClientBookings } from '@/lib/hooks'

const { data: bookings, isLoading } = useClientBookings(phone)
```

### 2. Мутации (RTK Query → React Query)

**Было (RTK Query):**
```typescript
// store/api/bookingsApi.ts
createBooking: builder.mutation({
  query: (booking) => ({
    url: '/bookings',
    method: 'POST',
    body: booking,
  }),
  invalidatesTags: ['Bookings'],
}),

// В компоненте:
const [createBooking, { isLoading }] = useCreateBookingMutation()

const handleCreate = async () => {
  const result = await createBooking(data).unwrap()
}
```

**Стало (React Query):**
```typescript
// lib/hooks/useBookings.ts
export function useCreateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (booking) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      if (!res.ok) throw new Error('Failed to create booking')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

// В компоненте:
const createBooking = useCreateBooking()

const handleCreate = async () => {
  const result = await createBooking.mutateAsync(data)
}
```

### 3. Локальное состояние (Redux → Context)

**Было (Redux Slice):**
```typescript
// store/slices/bookingSlice.ts
import { createSlice } from '@reduxjs/toolkit'

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    step: 1,
    formData: {},
  },
  reducers: {
    nextStep: (state) => { state.step += 1 },
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload }
    },
  },
})

// В компоненте:
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { nextStep, updateFormData } from '@/store/slices/bookingSlice'

const dispatch = useAppDispatch()
const step = useAppSelector((state) => state.booking.step)
const formData = useAppSelector((state) => state.booking.formData)

dispatch(nextStep())
dispatch(updateFormData({ date: '2024-01-15' }))
```

**Стало (Context API):**
```typescript
// lib/contexts/BookingContext.tsx
import { createContext, useContext, useState } from 'react'

const BookingContext = createContext()

export function BookingProvider({ children }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})

  const nextStep = () => setStep((prev) => prev + 1)
  const updateFormData = (data) => setFormData((prev) => ({ ...prev, ...data }))

  return (
    <BookingContext.Provider value={{ step, formData, nextStep, updateFormData }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookingForm() {
  return useContext(BookingContext)
}

// В компоненте:
import { useBookingForm } from '@/lib/contexts/BookingContext'

const { step, formData, nextStep, updateFormData } = useBookingForm()

nextStep()
updateFormData({ date: '2024-01-15' })
```

---

## 📦 Провайдеры

### Было (Redux):
```typescript
// app/providers.tsx
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/store'

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}
```

### Стало (React Query + Context):
```typescript
// app/providers.tsx
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { BookingProvider } from '@/lib/contexts/BookingContext'

export function Providers({ children }) {
  return (
    <QueryProvider>
      <BookingProvider>
        {children}
      </BookingProvider>
    </QueryProvider>
  )
}
```

---

## 🎯 Преимущества новой архитектуры

### 1. Меньше кода
- **Redux**: ~500+ строк (store setup, slices, APIs)
- **React Query**: ~200 строк (hooks + context)
- **Экономия**: 60% кода

### 2. Проще поддержка
```typescript
// Добавить новый API endpoint

// Было (RTK Query) - 3 файла, 30+ строк:
// 1. Добавить endpoint в API slice
// 2. Настроить invalidation tags
// 3. Импортировать hook в компонент

// Стало (React Query) - 1 файл, 10 строк:
export function useNewData() {
  return useQuery({
    queryKey: ['newData'],
    queryFn: async () => {
      const res = await fetch('/api/new-data')
      return res.json()
    },
  })
}
```

### 3. Лучшая производительность
- Нет overhead от Redux DevTools
- Меньший размер бандла (-15 КБ)
- Автоматическая дедупликация запросов
- Встроенный background refetch

### 4. Встроенные фичи
```typescript
// React Query из коробки:
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['bookings'],
  queryFn: fetchBookings,
  staleTime: 60 * 1000,        // Кеш на 1 минуту
  refetchOnWindowFocus: false,  // Не перезапрашивать при фокусе
  retry: 3,                     // 3 попытки при ошибке
})
```

---

## 🔍 Сравнение API

| Задача | RTK Query | React Query |
|--------|-----------|-------------|
| Получить данные | `useGetDataQuery()` | `useQuery()` |
| Создать/обновить | `useMutation()` | `useMutation()` |
| Инвалидация кеша | `invalidatesTags` | `invalidateQueries` |
| Загрузка | `isLoading` | `isLoading` / `isPending` |
| Ошибка | `error` | `error` |
| Повторный запрос | `refetch()` | `refetch()` |
| Условный запрос | `skip: boolean` | `enabled: boolean` |
| Оптимистичные обновления | `onQueryStarted` | `onMutate` + `onError` |

---

## 🚀 Миграция существующего кода

### Шаг 1: Установите React Query
```bash
npm install @tanstack/react-query
npm uninstall @reduxjs/toolkit react-redux redux-persist
```

### Шаг 2: Создайте QueryProvider
```typescript
// lib/providers/QueryProvider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Шаг 3: Создайте хуки для API
```typescript
// lib/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useClientBookings(phone: string | undefined) {
  return useQuery({
    queryKey: ['bookings', 'client', phone],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?phone=${phone}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!phone,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (booking) => {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
```

### Шаг 4: Замените Redux на Context для локального состояния
```typescript
// lib/contexts/BookingContext.tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface BookingContextType {
  step: number
  formData: any
  nextStep: () => void
  updateFormData: (data: any) => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({})

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4))
  const updateFormData = (data) => setFormData((prev) => ({ ...prev, ...data }))

  return (
    <BookingContext.Provider value={{ step, formData, nextStep, updateFormData }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookingForm() {
  const context = useContext(BookingContext)
  if (!context) throw new Error('useBookingForm must be used within BookingProvider')
  return context
}
```

### Шаг 5: Обновите компоненты

**Найдите все импорты:**
```bash
# Windows PowerShell
Select-String -Path "**/*.tsx" -Pattern "from '@/store"

# Linux/Mac
grep -r "from '@/store" --include="*.tsx"
```

**Замените:**
```typescript
// Было:
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useGetBookingsQuery } from '@/store/api/bookingsApi'

const dispatch = useAppDispatch()
const data = useAppSelector((state) => state.booking.formData)
const { data: bookings } = useGetBookingsQuery(phone)

// Стало:
import { useBookingForm } from '@/lib/contexts/BookingContext'
import { useClientBookings } from '@/lib/hooks'

const { formData } = useBookingForm()
const { data: bookings } = useClientBookings(phone)
```

### Шаг 6: Удалите старый код
```bash
# Удалите папку store
rm -rf store/

# Удалите зависимости
npm uninstall @reduxjs/toolkit react-redux redux-persist
```

---

## ⚠️ Частые проблемы

### 1. Enabled vs Skip
```typescript
// RTK Query
useGetDataQuery(id, { skip: !id })

// React Query
useQuery({
  queryKey: ['data', id],
  queryFn: () => fetchData(id),
  enabled: !!id  // Инвертированная логика!
})
```

### 2. unwrap() больше не нужен
```typescript
// RTK Query
const result = await mutation(data).unwrap()

// React Query
const result = await mutation.mutateAsync(data)
```

### 3. isPending vs isLoading
```typescript
// React Query v5
const { isPending, isLoading } = useQuery(...)
// isPending - true пока нет данных (первая загрузка)
// isLoading - true при любой загрузке (включая refetch)
```

### 4. Инвалидация запросов
```typescript
// Инвалидировать все запросы по ключу
queryClient.invalidateQueries({ queryKey: ['bookings'] })

// Инвалидировать точный запрос
queryClient.invalidateQueries({ queryKey: ['bookings', 'client', phone] })

// Инвалидировать с префиксом
queryClient.invalidateQueries({ queryKey: ['bookings'], exact: false })
```

---

## 📚 Полезные ссылки

- [React Query Docs](https://tanstack.com/query/latest)
- [Миграция с Redux](https://tkdodo.eu/blog/react-query-and-forms)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

**Миграция завершена! 🎉**

Теперь ваше приложение использует современный стек с React Query.
