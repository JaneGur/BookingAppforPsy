import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    user: {
        id: string
        phone: string
        name: string
        role: 'client' | 'admin'
    } | null
    isAuthenticated: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<AuthState['user']>) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
        },
        clearUser: (state) => {
            state.user = null
            state.isAuthenticated = false
        },
    },
})

export const { setUser, clearUser } = authSlice.actions
export default authSlice.reducer