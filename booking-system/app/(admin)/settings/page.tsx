'use client'

import { useState, useEffect } from 'react'
import { Settings, Clock, FileText, MessageSquare, Lock, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'

type TabKey = 'schedule' | 'info' | 'telegram' | 'documents' | 'password'

interface SettingsData {
    work_start: string
    work_end: string
    session_duration: number
    format: string
    info_contacts: any
    info_additional?: string
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>('schedule')
    const [settings, setSettings] = useState<SettingsData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Расписание
    const [workStart, setWorkStart] = useState('09:00')
    const [workEnd, setWorkEnd] = useState('18:00')
    const [sessionDuration, setSessionDuration] = useState(60)

    // Информационная панель
    const [infoTitle, setInfoTitle] = useState('')
    const [infoDescription, setInfoDescription] = useState('')
    const [infoAdditional, setInfoAdditional] = useState('')

    // Пароль
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Документы
    const [documents, setDocuments] = useState<any[]>([])
    const [newDocType, setNewDocType] = useState<'offer' | 'policy'>('offer')
    const [newDocTitle, setNewDocTitle] = useState('')
    const [newDocUrl, setNewDocUrl] = useState('')

    const loadSettings = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/settings')
            if (res.ok) {
                const data = (await res.json()) as SettingsData
                setSettings(data)
                setWorkStart(String(data.work_start).slice(0, 5))
                setWorkEnd(String(data.work_end).slice(0, 5))
                setSessionDuration(data.session_duration)
                setInfoAdditional(data.info_additional || '')
                // TODO: парсинг info_contacts для infoTitle и infoDescription
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadDocuments = async () => {
        try {
            const res = await fetch('/api/admin/documents')
            if (res.ok) {
                const data = await res.json()
                setDocuments(data)
            }
        } catch (error) {
            console.error('Failed to load documents:', error)
        }
    }

    useEffect(() => {
        loadSettings()
        loadDocuments()
    }, [])

    const handleSaveSchedule = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

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
                setSuccess('Настройки расписания сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось сохранить настройки')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveInfo = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    info_additional: infoAdditional,
                    // TODO: сохранить infoTitle и infoDescription в info_contacts
                }),
            })

            if (res.ok) {
                setSuccess('Настройки информационной панели сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось сохранить настройки')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
        } finally {
            setIsSaving(false)
        }
    }

    const handleChangePassword = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        if (newPassword !== confirmPassword) {
            setError('Новые пароли не совпадают')
            setIsSaving(false)
            return
        }

        try {
            const res = await fetch('/api/admin/settings/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            })

            if (res.ok) {
                setSuccess('Пароль успешно изменен')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось изменить пароль')
            }
        } catch (error) {
            setError('Ошибка при изменении пароля')
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddDocument = async () => {
        if (!newDocTitle || !newDocUrl) {
            setError('Заполните все поля')
            return
        }

        setIsSaving(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/admin/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doc_type: newDocType,
                    title: newDocTitle,
                    url: newDocUrl,
                }),
            })

            if (res.ok) {
                setSuccess('Документ добавлен')
                setNewDocTitle('')
                setNewDocUrl('')
                loadDocuments()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось добавить документ')
            }
        } catch (error) {
            setError('Ошибка при добавлении документа')
        } finally {
            setIsSaving(false)
        }
    }

    const tabs = [
        { key: 'schedule' as TabKey, label: 'Расписание', icon: Clock },
        { key: 'info' as TabKey, label: 'Инфо-панель', icon: FileText },
        { key: 'telegram' as TabKey, label: 'Telegram', icon: MessageSquare },
        { key: 'documents' as TabKey, label: 'Документы', icon: FileText },
        { key: 'password' as TabKey, label: 'Пароль', icon: Lock },
    ]

    if (isLoading) {
        return (
            <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <Card className="booking-card">
                        <CardContent className="p-12 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent"></div>
                            <p className="mt-3 text-sm text-gray-500">Загрузка настроек...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="booking-card">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-primary-900">⚙️ Настройки</h1>
                            <p className="text-sm text-gray-600">Управление настройками системы</p>
                        </div>
                    </div>
                </div>

                {/* Вкладки */}
                <Card className="booking-card">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                                        activeTab === key
                                            ? 'bg-primary-500 text-white'
                                            : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Сообщения */}
                {error && (
                    <Card className="booking-card">
                        <CardContent className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-800">{error}</p>
                        </CardContent>
                    </Card>
                )}
                {success && (
                    <Card className="booking-card">
                        <CardContent className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-sm text-green-800">{success}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Расписание */}
                {activeTab === 'schedule' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-500" />
                                Настройки расписания
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Начало рабочего дня *
                                    </label>
                                    <Input
                                        type="time"
                                        value={workStart}
                                        onChange={(e) => setWorkStart(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Конец рабочего дня *
                                    </label>
                                    <Input
                                        type="time"
                                        value={workEnd}
                                        onChange={(e) => setWorkEnd(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Длительность сессии (мин) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                                        min="15"
                                        max="180"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">От 15 до 180 минут</p>
                                </div>
                            </div>
                            <Button onClick={handleSaveSchedule} disabled={isSaving} size="lg">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Информационная панель */}
                {activeTab === 'info' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                Информационная панель
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Дополнительная информация</label>
                                <textarea
                                    value={infoAdditional}
                                    onChange={(e) => setInfoAdditional(e.target.value)}
                                    placeholder="Дополнительная информация для клиентов..."
                                    className="flex min-h-[150px] w-full rounded-xl border border-primary-200/30 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/15 focus-visible:border-primary-400/60 focus-visible:shadow-md resize-none shadow-sm"
                                />
                            </div>
                            <Button onClick={handleSaveInfo} disabled={isSaving} size="lg">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Telegram */}
                {activeTab === 'telegram' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary-500" />
                                Настройки Telegram
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Настройка Telegram-бота выполняется через переменные окружения:
                                </p>
                                <ul className="list-disc list-inside mt-2 text-sm text-yellow-700 space-y-1">
                                    <li>TELEGRAM_BOT_TOKEN - токен бота</li>
                                    <li>TELEGRAM_ADMIN_CHAT_ID - Chat ID администратора</li>
                                </ul>
                                <p className="text-sm text-yellow-700 mt-2">
                                    После настройки перезапустите приложение.
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                <p className="text-sm text-blue-800">
                                    Статус: {process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ? '✅ Настроен' : '❌ Не настроен'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Документы */}
                {activeTab === 'documents' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                Документы
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Тип документа</label>
                                    <select
                                        value={newDocType}
                                        onChange={(e) => setNewDocType(e.target.value as 'offer' | 'policy')}
                                        className="flex h-12 w-full rounded-xl border border-primary-200/50 bg-white/95 backdrop-blur-sm px-4 py-3 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/20 focus-visible:border-primary-400"
                                    >
                                        <option value="offer">Оферта</option>
                                        <option value="policy">Политика конфиденциальности</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Название</label>
                                    <Input
                                        value={newDocTitle}
                                        onChange={(e) => setNewDocTitle(e.target.value)}
                                        placeholder="Название документа"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">URL</label>
                                    <Input
                                        value={newDocUrl}
                                        onChange={(e) => setNewDocUrl(e.target.value)}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <Button onClick={handleAddDocument} disabled={isSaving} size="lg">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Добавление...' : 'Добавить документ'}
                            </Button>

                            {documents.length > 0 && (
                                <div className="space-y-2 mt-6">
                                    <h3 className="font-semibold text-gray-900">Загруженные документы</h3>
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900">{doc.title}</div>
                                                <div className="text-sm text-gray-600">
                                                    {doc.doc_type === 'offer' ? 'Оферта' : 'Политика конфиденциальности'}
                                                    {doc.is_active && (
                                                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                            Активен
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-600 hover:underline"
                                            >
                                                Открыть
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Смена пароля */}
                {activeTab === 'password' && (
                    <Card className="booking-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary-500" />
                                Смена пароля администратора
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Текущий пароль *</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Введите текущий пароль"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Новый пароль *</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Минимум 6 символов"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Подтвердите новый пароль *</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Повторите новый пароль"
                                    required
                                />
                            </div>
                            <Button onClick={handleChangePassword} disabled={isSaving} size="lg">
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Изменение...' : 'Изменить пароль'}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
