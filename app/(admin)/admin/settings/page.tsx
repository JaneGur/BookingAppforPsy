'use client'

import {useCallback, useState} from 'react'
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
    const [workStart, setWorkStart] = useState('09:00')
    const [workEnd, setWorkEnd] = useState('18:00')
    const [sessionDuration, setSessionDuration] = useState(60)
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
    useState(() => {
        if (settings) {
            setWorkStart(String(settings.work_start).slice(0, 5))
            setWorkEnd(String(settings.work_end).slice(0, 5))
            setSessionDuration(settings.session_duration)
            setInfoAdditional(settings.info_additional || '')
        }
    })

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
    }, [workStart, workEnd, sessionDuration, handleSuccess, handleError, loadSettings])

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
    }, [infoAdditional, handleSuccess, handleError, loadSettings])

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
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="booking-card p-6">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="booking-card">
                        <div className="p-6">
                            <div className="flex gap-2 mb-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-32 rounded-lg" />
                                ))}
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-32 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-[fadeInUp_0.6s_ease-out]">
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