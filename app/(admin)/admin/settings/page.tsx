'use client'

import {useCallback, useEffect, useState} from 'react'
import SettingsHeader from './components/SettingsHeader'
import SettingsTabs from './components/SettingsTabs'
import StatusMessage from './components/StatusMessage'
import ScheduleSettings from './components/ScheduleSettings'
import InfoPanelSettings from './components/InfoPanelSettings'
import TelegramSettings from './components/TelegramSettings'
import DocumentsSettings from './components/DocumentsSettings'
import PasswordSettings from './components/PasswordSettings'
import {Skeleton} from '@/components/ui/skeleton'
import {TabKey} from './components/types'
import {useSettings} from './hooks/useSettings'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('schedule')
    const [isSendingTest, setIsSendingTest] = useState(false)
    const [workStart, setWorkStart] = useState('')
    const [workEnd, setWorkEnd] = useState('')
    const [sessionDuration, setSessionDuration] = useState(0)
    const [infoAdditional, setInfoAdditional] = useState('')

    const {
        settings,
        documents,
        isLoading,
        isSaving,
        error,
        success,
        isTelegramConfigured,
        setIsSaving,
        handleError,
        handleSuccess,
        clearMessages,
        loadSettings,
        loadDocuments,
        setIsTelegramConfigured
    } = useSettings()

    // Инициализация данных при загрузке настроек
    useEffect(() => {
        if (!settings) return
        setWorkStart(String(settings.work_start).slice(0, 5))
        setWorkEnd(String(settings.work_end).slice(0, 5))
        setSessionDuration(settings.session_duration)
        setInfoAdditional(settings.info_additional || '')
    }, [settings])

    const handleTabChange = useCallback((tab: TabKey) => {
        setActiveTab(tab)
        clearMessages()
    }, [clearMessages])

    const handleSaveSchedule = useCallback(async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    work_start: workStart,
                    work_end: workEnd,
                    session_duration: sessionDuration,
                }),
            })

            if (res.ok) {
                handleSuccess('✅ Настройки расписания сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                handleError(errorData.error || 'Не удалось сохранить настройки')
            }
        } catch (error) {
            handleError('Ошибка при сохранении')
        } finally {
            setIsSaving(false)
        }
    }, [workStart, workEnd, sessionDuration, handleSuccess, handleError, loadSettings, setIsSaving])

    const handleSaveInfo = useCallback(async () => {
        setIsSaving(true)
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    info_additional: infoAdditional,
                }),
            })

            if (res.ok) {
                handleSuccess('✅ Настройки информационной панели сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                handleError(errorData.error || 'Не удалось сохранить настройки')
            }
        } catch (error) {
            handleError('Ошибка при сохранении')
        } finally {
            setIsSaving(false)
        }
    }, [infoAdditional, handleSuccess, handleError, loadSettings, setIsSaving])

    const handleTestTelegram = useCallback(async () => {
        setIsSendingTest(true)
        try {
            const res = await fetch('/api/admin/settings/test-telegram', {
                method: 'POST',
            })

            const data = await res.json()

            if (res.ok) {
                handleSuccess('✅ Тестовое уведомление отправлено! Проверьте Telegram.')
            } else {
                handleError(data.error || 'Не удалось отправить уведомление')
            }
        } catch (error) {
            handleError('Ошибка при отправке тестового уведомления')
        } finally {
            setIsSendingTest(false)
        }
    }, [handleSuccess, handleError])

    const handleCheckTelegram = useCallback(async () => {
        try {
            const res = await fetch('/api/telegram/send-notification')
            setIsTelegramConfigured(res.status !== 400)
        } catch {
            setIsTelegramConfigured(false)
        }
    }, [setIsTelegramConfigured])

    if (isLoading) {
        return (
            <div className="booking-page-surface min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                    <div className="booking-card p-4 sm:p-6">
                        <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
                        <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
                    </div>
                    <div className="booking-card">
                        <div className="p-4 sm:p-6">
                            <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-9 sm:h-10 w-28 sm:w-32 rounded-lg flex-shrink-0" />
                                ))}
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
                                <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
                                <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
                                <Skeleton className="h-10 sm:h-12 w-28 sm:w-32 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                <SettingsHeader />
                <SettingsTabs activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Сообщения */}
                {error && <StatusMessage type="error" message={error} />}
                {success && <StatusMessage type="success" message={success} />}

                {/* Контент вкладок */}
                {activeTab === 'schedule' && (
                    <ScheduleSettings
                        workStart={workStart}
                        workEnd={workEnd}
                        sessionDuration={sessionDuration}
                        onWorkStartChange={setWorkStart}
                        onWorkEndChange={setWorkEnd}
                        onSessionDurationChange={setSessionDuration}
                        onSave={handleSaveSchedule}
                        isSaving={isSaving}
                    />
                )}

                {activeTab === 'info' && (
                    <InfoPanelSettings
                        infoAdditional={infoAdditional}
                        onInfoAdditionalChange={setInfoAdditional}
                        onSave={handleSaveInfo}
                        isSaving={isSaving}
                    />
                )}

                {activeTab === 'telegram' && (
                    <TelegramSettings
                        isTelegramConfigured={isTelegramConfigured}
                        isSendingTest={isSendingTest}
                        onTestTelegram={handleTestTelegram}
                    />
                )}

                {activeTab === 'documents' && (
                    <DocumentsSettings
                        documents={documents}
                        onDocumentsUpdate={loadDocuments}
                        onError={handleError}
                        onSuccess={handleSuccess}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                    />
                )}

                {activeTab === 'password' && (
                    <PasswordSettings
                        onError={handleError}
                        onSuccess={handleSuccess}
                        isSaving={isSaving}
                        setIsSaving={setIsSaving}
                    />
                )}
            </div>
        </div>
    )
}