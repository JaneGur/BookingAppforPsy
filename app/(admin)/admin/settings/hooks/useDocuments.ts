'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useDocuments() {
    const [isUploading, setIsUploading] = useState(false)

    const uploadDocument = useCallback(async (formData: FormData) => {
        setIsUploading(true)
        try {
            const res = await fetch('/api/admin/documents/upload', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Документ успешно загружен')
                return { success: true, data }
            } else {
                toast.error(data.error || 'Не удалось загрузить документ')
                return { success: false, error: data.error }
            }
        } catch (error) {
            toast.error('Ошибка при загрузке документа')
            return { success: false, error: 'Ошибка при загрузке' }
        } finally {
            setIsUploading(false)
        }
    }, [])

    const addDocumentByUrl = useCallback(async (docType: string, title: string, url: string) => {
        try {
            const res = await fetch('/api/admin/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doc_type: docType, title, url }),
            })

            if (res.ok) {
                toast.success('Документ добавлен')
                return { success: true }
            } else {
                const errorData = await res.json()
                toast.error(errorData.error || 'Не удалось добавить документ')
                return { success: false, error: errorData.error }
            }
        } catch (error) {
            toast.error('Ошибка при добавлении документа')
            return { success: false, error: 'Ошибка при добавлении' }
        }
    }, [])

    return {
        isUploading,
        uploadDocument,
        addDocumentByUrl
    }
}