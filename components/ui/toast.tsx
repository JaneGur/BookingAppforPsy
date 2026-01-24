import { useEffect, useState } from 'react'
import { Check, X, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
    message: string
    type?: ToastType
    duration?: number
    onClose: () => void
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration)
        return () => clearTimeout(timer)
    }, [duration, onClose])

    const icons = {
        success: <Check className="h-5 w-5" />,
        error: <X className="h-5 w-5" />,
        warning: <AlertCircle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
    }

    const styles = {
        success: 'bg-green-50 border-green-500 text-green-900',
        error: 'bg-red-50 border-red-500 text-red-900',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
        info: 'bg-blue-50 border-blue-500 text-blue-900',
    }

    return (
        <div className="fixed top-4 right-4 z-[200] animate-in slide-in-from-top-2 duration-300">
            <div className={`${styles[type]} border-l-4 rounded-xl shadow-2xl p-4 pr-12 max-w-md`}>
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">{icons[type]}</div>
                    <p className="text-sm font-semibold">{message}</p>
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-black/10 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

// Hook для использования toast
export function useToast() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

    const show = (message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts(prev => [...prev, { id, message, type }])
    }

    const remove = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return {
        toasts,
        show,
        remove,
        success: (msg: string) => show(msg, 'success'),
        error: (msg: string) => show(msg, 'error'),
        warning: (msg: string) => show(msg, 'warning'),
        info: (msg: string) => show(msg, 'info'),
    }
}
