import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

// Slices
import authReducer from './slices/authSlice'
import bookingReducer from './slices/bookingSlice'
import uiReducer from './slices/uiSlice'

// RTK Query APIs
import { bookingsApi } from './api/bookingsApi'
import { clientsApi } from './api/clientsApi'
import { productsApi } from './api/productsApi'
import { slotsApi } from './api/slotsApi'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'booking'], // Только эти будут в localStorage
}

const rootReducer = {
    auth: persistReducer(persistConfig, authReducer),
    booking: bookingReducer,
    ui: uiReducer,
    [bookingsApi.reducerPath]: bookingsApi.reducer,
    [clientsApi.reducerPath]: clientsApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [slotsApi.reducerPath]: slotsApi.reducer,
}

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        })
            .concat(bookingsApi.middleware)
            .concat(clientsApi.middleware)
            .concat(productsApi.middleware)
            .concat(slotsApi.middleware),
})

setupListeners(store.dispatch)

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch