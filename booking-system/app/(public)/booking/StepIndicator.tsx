'use client'

import { Calendar, User, Check, Lock } from 'lucide-react'
import {cn} from "@/lib/utils/cn";

interface StepIndicatorProps {
    currentStep: number
}

const steps = [
    { num: 1, icon: Calendar, title: 'Дата и время' },
    { num: 2, icon: User, title: 'Ваши данные' },
    { num: 3, icon: Check, title: 'Подтверждение' },
    { num: 4, icon: Lock, title: 'Авторизация' },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className="flex gap-4 mb-6">
            {steps.map((step) => {
                const Icon = step.icon
                const isActive = step.num === currentStep
                const isCompleted = step.num < currentStep
                const isUpcoming = step.num > currentStep

                return (
                    <div
                        key={step.num}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all',
                            isCompleted &&
                                'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-card',
                            isActive &&
                                'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-card-hover ring-2 ring-white/50',
                            isUpcoming &&
                                'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
                        )}
                    >
                        <div className="mb-2">
                            {isCompleted ? (
                                <Check className="w-6 h-6 mx-auto" />
                            ) : (
                                <Icon
                                    className={cn(
                                        'w-6 h-6 mx-auto',
                                        isActive && 'text-white',
                                        isUpcoming && 'text-gray-400'
                                    )}
                                />
                            )}
                        </div>
                        <div className="text-sm font-semibold">{step.title}</div>
                    </div>
                )
            })}
        </div>
    )
}