'use client'

import { cn } from '@/lib/utils/cn'
import { Check, Calendar, User, CheckCircle, Lock } from 'lucide-react'

interface StepIndicatorProps {
    currentStep: number
    totalSteps?: number
}

const steps = [
    { id: 1, name: 'Дата и время', icon: Calendar },
    { id: 2, name: 'Ваши данные', icon: User },
    { id: 3, name: 'Подтверждение', icon: CheckCircle },
    { id: 4, name: 'Авторизация', icon: Lock },
]

export function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
    return (
        <div className="w-full">
            {/* Desktop version - card based */}
            <div className="hidden sm:block">
                <div className="grid grid-cols-4 gap-2">
                    {steps.map((step) => {
                        const Icon = step.icon
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id
                        const isPending = currentStep < step.id

                        return (
                            <div
                                key={step.id}
                                className={cn(
                                    'relative overflow-hidden rounded-lg p-3 transition-all duration-500 transform',
                                    isCompleted && 'bg-primary-500 shadow-md scale-100',
                                    isCurrent && 'bg-white border-2 border-primary-600 shadow-lg scale-105 ring-2 ring-primary-100',
                                    isPending && 'bg-gray-100 border border-gray-300 opacity-60 hover:opacity-80'
                                )}
                            >
                                {/* Background gradient for current */}
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white" />
                                )}

                                {/* Animated background for completed */}
                                {isCompleted && (
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600" />
                                )}

                                <div className="relative z-10 flex flex-col items-center text-center space-y-1.5">
                                    {/* Icon */}
                                    <div className={cn(
                                        'p-1.5 rounded-md transition-all duration-300',
                                        isCompleted && 'bg-white/20',
                                        isCurrent && 'bg-primary-100',
                                        isPending && 'bg-gray-200'
                                    )}>
                                        {isCompleted ? (
                                            <Check className="w-4 h-4 text-white" />
                                        ) : (
                                            <Icon className={cn(
                                                'w-4 h-4 transition-colors',
                                                isCurrent && 'text-primary-600',
                                                isPending && 'text-gray-400'
                                            )} />
                                        )}
                                    </div>

                                    {/* Step number */}
                                    <div className={cn(
                                        'text-[10px] font-bold transition-colors',
                                        isCompleted && 'text-white/80',
                                        isCurrent && 'text-primary-600',
                                        isPending && 'text-gray-500'
                                    )}>
                                        Шаг {step.id}
                                    </div>

                                    {/* Step name */}
                                    <div className={cn(
                                        'text-xs font-semibold transition-colors leading-tight',
                                        isCompleted && 'text-white',
                                        isCurrent && 'text-primary-600',
                                        isPending && 'text-gray-500'
                                    )}>
                                        {step.name}
                                    </div>
                                </div>

                                {/* Shimmer effect for current step */}
                                {isCurrent && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-200/30 to-transparent animate-shimmer" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Mobile version - vertical list */}
            <div className="sm:hidden space-y-2">
                {steps.map((step) => {
                    const Icon = step.icon
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id
                    const isPending = currentStep < step.id

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                'relative overflow-hidden rounded-lg transition-all duration-500',
                                isCompleted && 'bg-primary-500',
                                isCurrent && 'bg-white border-2 border-primary-600 shadow-lg',
                                isPending && 'bg-gray-100 border border-gray-200 opacity-50'
                            )}
                        >
                            {/* Background effects */}
                            {isCompleted && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600" />
                            )}
                            {isCurrent && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-white" />
                            )}

                            <div className="relative z-10 flex items-center gap-3 p-3">
                                {/* Icon */}
                                <div className={cn(
                                    'flex-shrink-0 p-2 rounded-md transition-all duration-300',
                                    isCompleted && 'bg-white/20',
                                    isCurrent && 'bg-primary-100',
                                    isPending && 'bg-gray-200'
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-4 h-4 text-white" />
                                    ) : (
                                        <Icon className={cn(
                                            'w-4 h-4',
                                            isCurrent && 'text-primary-600',
                                            isPending && 'text-gray-400'
                                        )} />
                                    )}
                                </div>

                                {/* Text content */}
                                <div className="flex-1">
                                    <div className={cn(
                                        'text-[10px] font-bold mb-0.5',
                                        isCompleted && 'text-white/80',
                                        isCurrent && 'text-primary-600',
                                        isPending && 'text-gray-500'
                                    )}>
                                        Шаг {step.id} из {totalSteps}
                                    </div>
                                    <div className={cn(
                                        'text-xs font-semibold',
                                        isCompleted && 'text-white',
                                        isCurrent && 'text-primary-600',
                                        isPending && 'text-gray-500'
                                    )}>
                                        {step.name}
                                    </div>
                                </div>

                                {/* Status indicator */}
                                {isCompleted && (
                                    <div className="flex-shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    </div>
                                )}
                                {isCurrent && (
                                    <div className="flex-shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                                    </div>
                                )}
                            </div>

                            {/* Shimmer effect for current */}
                            {isCurrent && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-200/30 to-transparent animate-shimmer" />
                            )}
                        </div>
                    )
                })}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
            `}</style>
        </div>
    )
}