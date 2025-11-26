'use client'

import { StepUserData } from '@/components/booking/StepUserData'
import { StepConfirmation } from '@/components/booking/StepConfirmation'
import { StepAuth } from '@/components/booking/StepAuth'
import { InfoPanel } from '@/components/shared/InfoPanel'
import { useAppSelector } from '@/store/hooks'
import { StepIndicator } from './booking/StepIndicator'
import { StepDateTime } from './booking/StepDateTime'

export default function HomePage() {
    const step = useAppSelector((state) => state.booking.step)

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Заголовок */}
                <div className="gradient-header mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        🌿 Запись на онлайн-консультацию
                    </h1>
                </div>

                {/* Основной контент */}
                <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
                    {/* Форма записи */}
                    <div>
                        <StepIndicator currentStep={step} />

                        <div className="mt-6">
                            {step === 1 && <StepDateTime />}
                            {step === 2 && <StepUserData />}
                            {step === 3 && <StepConfirmation />}
                            {step === 4 && <StepAuth />}
                        </div>
                    </div>

                    {/* Информационная панель */}
                    <div>
                        <InfoPanel />
                    </div>
                </div>
            </div>
        </div>
    )
}