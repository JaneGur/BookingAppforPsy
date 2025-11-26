import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
    id: string
    title: string
    description?: string
    variant: 'default' | 'success' | 'error' | 'warning'
}

interface UIState {
    toasts: Toast[]
    isLoading: boolean
    loadingMessage?: string
}

const initialState: UIState = {
    toasts: [],
    isLoading: false,
}

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
            state.toasts.push({
                ...action.payload,
                id: Date.now().toString(),
            })
        },
        removeToast: (state, action: PayloadAction<string>) => {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload)
        },
        setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
            state.isLoading = action.payload.isLoading
            state.loadingMessage = action.payload.message
        },
    },
})

export const { addToast, removeToast, setLoading } = uiSlice.actions
export default uiSlice.reducer