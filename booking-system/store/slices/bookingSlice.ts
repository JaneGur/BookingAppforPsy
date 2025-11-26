import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BookingFormData {
    date?: string
    time?: string
    name?: string
    phone?: string
    email?: string
    telegram?: string
    notes?: string
    productId?: number
}

interface BookingState {
    step: number
    formData: BookingFormData
}

const initialState: BookingState = {
    step: 1,
    formData: {},
}

export const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        setStep: (state, action: PayloadAction<number>) => {
            state.step = action.payload
        },
        nextStep: (state) => {
            state.step += 1
        },
        prevStep: (state) => {
            state.step = Math.max(1, state.step - 1)
        },
        updateFormData: (state, action: PayloadAction<Partial<BookingFormData>>) => {
            state.formData = { ...state.formData, ...action.payload }
        },
        resetBooking: (state) => {
            state.step = 1
            state.formData = {}
        },
    },
})

export const { setStep, nextStep, prevStep, updateFormData, resetBooking } = bookingSlice.actions
export default bookingSlice.reducer