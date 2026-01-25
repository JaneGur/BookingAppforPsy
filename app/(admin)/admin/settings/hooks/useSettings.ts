'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { SettingsData, DocumentType } from '../components/types'

export function useSettings() {
    const [settings, setSettings] = useState<SettingsData | null>(null)
    const [documents, setDocuments] = useState<DocumentType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isTelegramConfigured, setIsTelegramConfigured] = useState(false)

    const loadSettings = useCallback(async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = (await res.json()) as SettingsData
                setSettings(data)
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
            toast.error('Ошибка загрузки настроек')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadDocuments = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/documents')
            if (res.ok) {
                const data = await res.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error('Failed to load documents:', error)
            toast.error('Ошибка загрузки документов')
        }
    }, [])

    const checkTelegramConfig = useCallback(async () => {
        try {
            const res = await fetch('/api/telegram/send-notification')
            setIsTelegramConfigured(res.status !== 400)
        } catch {
            setIsTelegramConfigured(false)
        }
    }, [])

    const handleError = useCallback((message: string) => {
        setError(message)
        toast.error(message)
        setTimeout(() => setError(null), 5000)
    }, [])

    const handleSuccess = useCallback((message: string) => {
        setSuccess(message)
        toast.success(message)
        setTimeout(() => setSuccess(null), 5000)
    }, [])

    const clearMessages = useCallback(() => {
        setError(null)
        setSuccess(null)
    }, [])

    // Загрузка всех данных при монтировании
    useEffect(() => {
        const loadAllData = async () => {
            await Promise.all([
                loadSettings(),
                loadDocuments(),
                checkTelegramConfig()
            ])
        }
        loadAllData()
    }, [loadSettings, loadDocuments, checkTelegramConfig])

    return {
        settings,
        documents,
        isLoading,
        isSaving,
        error,
        success,
        isTelegramConfigured,
        setSettings,
        setDocuments,
        setIsSaving,
        setIsTelegramConfigured,
        handleError,
        handleSuccess,
        clearMessages,
        loadSettings,
        loadDocuments,
        checkTelegramConfig
    }
}