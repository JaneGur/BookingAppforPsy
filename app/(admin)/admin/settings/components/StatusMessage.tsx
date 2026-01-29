'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatusMessageProps {
    type: 'error' | 'success'
    message: string
}

export default function StatusMessage({ type, message }: StatusMessageProps) {
    const isError = type === 'error'

    return (
        <Card className={cn(
            "booking-card border-2 animate-[fadeInDown_0.3s_ease-out]",
            isError ? "border-red-300" : "border-green-300"
        )}>
            <CardContent className={cn(
                "p-3 sm:p-4 md:p-5 bg-gradient-to-br",
                isError
                    ? "from-red-50 to-rose-50"
                    : "from-green-50 to-emerald-50"
            )}>
                <div className="flex items-start gap-2 sm:gap-3">
                    {isError ? (
                        <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    )}
                    <p className={cn(
                        "text-xs sm:text-sm font-medium break-words flex-1 min-w-0 leading-relaxed",
                        isError ? "text-red-800" : "text-green-800"
                    )}>
                        {message}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}