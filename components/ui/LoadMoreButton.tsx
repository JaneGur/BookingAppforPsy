import { Button } from '@/components/ui/button'
import { Loader2, ChevronDown } from 'lucide-react'

interface LoadMoreButtonProps {
    onClick: () => void
    isLoading: boolean
    hasMore: boolean
    loadingText?: string
    defaultText?: string
    disabled?: boolean
}

export function LoadMoreButton({
    onClick,
    isLoading,
    hasMore,
    loadingText = 'Загрузка...',
    defaultText = 'Показать ещё',
    disabled = false
}: LoadMoreButtonProps) {
    if (!hasMore && !isLoading) {
        return null
    }

    return (
        <div className="flex justify-center mt-6">
            <Button
                onClick={onClick}
                disabled={isLoading || !hasMore || disabled}
                variant="secondary"
                className="min-w-[140px]"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {loadingText}
                    </>
                ) : (
                    <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        {defaultText}
                    </>
                )}
            </Button>
        </div>
    )
}
