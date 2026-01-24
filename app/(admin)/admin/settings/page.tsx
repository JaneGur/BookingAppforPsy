'use client'

import { useState, useEffect, useMemo } from 'react'
import { Settings, Clock, FileText, MessageSquare, Lock, Save, Send, Calendar, AlertCircle, CheckCircle2, Info, Upload, Link as LinkIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

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

    // Telegram
    const [isTelegramConfigured, setIsTelegramConfigured] = useState(false)
    const [isSendingTest, setIsSendingTest] = useState(false)

    // Документы
    const [documents, setDocuments] = useState<any[]>([])
    const [newDocType, setNewDocType] = useState<'offer' | 'policy'>('offer')
    const [newDocTitle, setNewDocTitle] = useState('')
    const [newDocUrl, setNewDocUrl] = useState('')
    const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

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
        checkTelegramConfig()
    }, [])

    const checkTelegramConfig = async () => {
        try {
            const res = await fetch('/api/telegram/send-notification')
            setIsTelegramConfigured(res.status !== 400)
        } catch {
            setIsTelegramConfigured(false)
        }
    }

    const handleTestTelegram = async () => {
        setIsSendingTest(true)
        setError(null)
        setSuccess(null)

        try {
            const res = await fetch('/api/admin/settings/test-telegram', {
                method: 'POST',
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess('✅ Тестовое уведомление отправлено! Проверьте Telegram.')
                toast.success('Тестовое уведомление отправлено')
            } else {
                setError(data.error || 'Не удалось отправить уведомление')
                toast.error(data.error || 'Ошибка отправки')
            }
        } catch (error) {
            setError('Ошибка при отправке тестового уведомления')
            toast.error('Ошибка отправки')
        } finally {
            setIsSendingTest(false)
        }
    }

    // Предпросмотр расписания
    const schedulePreview = useMemo(() => {
        try {
            const [startH, startM] = workStart.split(':').map(Number)
            const [endH, endM] = workEnd.split(':').map(Number)
            const startMinutes = startH * 60 + startM
            const endMinutes = endH * 60 + endM
            const totalMinutes = endMinutes - startMinutes

            if (totalMinutes <= 0 || sessionDuration <= 0) {
                return { slots: [], count: 0, error: 'Некорректное время' }
            }

            const slotsCount = Math.floor(totalMinutes / sessionDuration)
            const slots: string[] = []

            for (let i = 0; i < Math.min(slotsCount, 10); i++) {
                const slotStart = startMinutes + i * sessionDuration
                const slotH = Math.floor(slotStart / 60)
                const slotM = slotStart % 60
                slots.push(`${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`)
            }

            return { slots, count: slotsCount, error: null }
        } catch {
            return { slots: [], count: 0, error: 'Ошибка расчета' }
        }
    }, [workStart, workEnd, sessionDuration])

    const handleSaveSchedule = async () => {
        setIsSaving(true)
        setError(null)
        setSuccess(null)

        // Валидация
        const [startH, startM] = workStart.split(':').map(Number)
        const [endH, endM] = workEnd.split(':').map(Number)
        const startMinutes = startH * 60 + startM
        const endMinutes = endH * 60 + endM

        if (startMinutes >= endMinutes) {
            setError('Начало работы должно быть раньше окончания')
            setIsSaving(false)
            toast.error('Начало работы должно быть раньше окончания')
            return
        }

        if (sessionDuration < 5 || sessionDuration > 180) {
            setError('Длительность сессии должна быть от 5 до 180 минут')
            setIsSaving(false)
            toast.error('Некорректная длительность сессии')
            return
        }

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
                setSuccess('✅ Настройки расписания сохранены')
                toast.success('Настройки расписания сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось сохранить настройки')
                toast.error(errorData.error || 'Ошибка сохранения')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
            toast.error('Ошибка при сохранении')
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
                setSuccess('✅ Настройки информационной панели сохранены')
                toast.success('Настройки сохранены')
                loadSettings()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось сохранить настройки')
                toast.error(errorData.error || 'Ошибка сохранения')
            }
        } catch (error) {
            setError('Ошибка при сохранении')
            toast.error('Ошибка при сохранении')
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
                setSuccess('✅ Пароль успешно изменен. Новый пароль отправлен в Telegram.')
                toast.success('Пароль успешно изменен')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось изменить пароль')
                toast.error(errorData.error || 'Ошибка изменения пароля')
            }
        } catch (error) {
            setError('Ошибка при изменении пароля')
            toast.error('Ошибка при изменении пароля')
        } finally {
            setIsSaving(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Валидация типа файла
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
            if (!allowedTypes.includes(file.type)) {
                setError('Неподдерживаемый формат файла. Разрешены: PDF, DOC, DOCX')
                toast.error('Неподдерживаемый формат файла')
                return
            }

            // Валидация размера (макс 10 МБ)
            const maxSize = 10 * 1024 * 1024
            if (file.size > maxSize) {
                setError('Файл слишком большой. Максимальный размер: 10 МБ')
                toast.error('Файл слишком большой')
                return
            }

            setSelectedFile(file)
            setError(null)
        }
    }

    const handleAddDocument = async () => {
        if (!newDocTitle) {
            setError('Введите название документа')
            toast.error('Введите название')
            return
        }

        if (uploadMethod === 'url' && !newDocUrl) {
            setError('Введите URL документа')
            toast.error('Введите URL')
            return
        }

        if (uploadMethod === 'file' && !selectedFile) {
            setError('Выберите файл для загрузки')
            toast.error('Выберите файл')
            return
        }

        setIsSaving(true)
        setIsUploading(true)
        setError(null)
        setSuccess(null)

        try {
            if (uploadMethod === 'file' && selectedFile) {
                // Загрузка файла
                const formData = new FormData()
                formData.append('file', selectedFile)
                formData.append('doc_type', newDocType)
                formData.append('title', newDocTitle)

                const res = await fetch('/api/admin/documents/upload', {
                    method: 'POST',
                    body: formData,
                })

                const data = await res.json()

                if (res.ok) {
                    setSuccess('✅ Документ успешно загружен')
                    toast.success('Документ загружен')
                    setNewDocTitle('')
                    setSelectedFile(null)
                    // Сбрасываем input file
                    const fileInput = document.getElementById('file-input') as HTMLInputElement
                    if (fileInput) fileInput.value = ''
                    loadDocuments()
                } else {
                    setError(data.error || 'Не удалось загрузить документ')
                    toast.error(data.error || 'Ошибка загрузки')
                }
            } else {
                // Добавление по URL
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
                    setSuccess('✅ Документ добавлен')
                    toast.success('Документ успешно добавлен')
                setNewDocTitle('')
                setNewDocUrl('')
                loadDocuments()
            } else {
                const errorData = await res.json()
                setError(errorData.error || 'Не удалось добавить документ')
                    toast.error(errorData.error || 'Ошибка добавления')
                }
            }
        } catch (error) {
            setError('Ошибка при добавлении документа')
            toast.error('Ошибка при добавлении документа')
        } finally {
            setIsSaving(false)
            setIsUploading(false)
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
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="booking-card p-6">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Card className="booking-card">
                        <CardContent className="p-6">
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
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="booking-page-surface min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 animate-[fadeInUp_0.6s_ease-out]">
                <Card className="booking-card border-2">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Settings className="w-7 h-7 text-white" />
                            </div>
                        <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Настройки системы
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">Управление конфигурацией и параметрами</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Вкладки */}
                <Card className="booking-card border-2">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2">
                            {tabs.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => {
                                        setActiveTab(key)
                                        setError(null)
                                        setSuccess(null)
                                    }}
                                    className={cn(
                                        'flex items-center gap-2 px-5 py-3 rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5',
                                        activeTab === key
                                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Сообщения */}
                {error && (
                    <Card className="booking-card border-2 border-red-300 animate-[fadeInDown_0.3s_ease-out]">
                        <CardContent className="p-5 bg-gradient-to-br from-red-50 to-rose-50">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {success && (
                    <Card className="booking-card border-2 border-green-300 animate-[fadeInDown_0.3s_ease-out]">
                        <CardContent className="p-5 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-800">{success}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Расписание */}
                {activeTab === 'schedule' && (
                    <Card className="booking-card border-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg md:text-xl font-bold break-words">Настройки расписания</div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">Рабочие часы и длительность сессий</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-3 md:gap-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span>Начало рабочего дня *</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={workStart}
                                        onChange={(e) => setWorkStart(e.target.value)}
                                        required
                                        className="h-12 text-lg font-mono w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span>Конец рабочего дня *</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={workEnd}
                                        onChange={(e) => setWorkEnd(e.target.value)}
                                        required
                                        className="h-12 text-lg font-mono w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                        <span>Длительность сессии (мин) *</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(Number(e.target.value))}
                                        min="5"
                                        max="180"
                                        step="5"
                                        required
                                        className="h-12 text-lg font-mono w-full"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <Info className="h-3 w-3 flex-shrink-0" />
                                        <span>От 5 до 180 минут (рекомендуется кратно 5)</span>
                                    </p>
                                </div>
                            </div>

                            {/* Предпросмотр расписания */}
                            <div className="booking-card border-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-5">
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                                    <span className="truncate">Предпросмотр расписания</span>
                                </h3>
                                {schedulePreview.error ? (
                                    <div className="flex items-center gap-2 text-red-700 bg-red-100 p-3 rounded-lg text-sm">
                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                                        <span>{schedulePreview.error}</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                                            <div className="bg-white/80 p-3 sm:p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                                                <div className="text-xs sm:text-sm text-gray-600 mb-1">Всего слотов</div>
                                                <div className="text-xl sm:text-3xl font-bold text-blue-600">{schedulePreview.count}</div>
                                            </div>
                                            <div className="bg-white/80 p-3 sm:p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                                                <div className="text-xs sm:text-sm text-gray-600 mb-1">Рабочих часов</div>
                                                <div className="text-xl sm:text-3xl font-bold text-blue-600">
                                                    {(() => {
                                                        const [startH, startM] = workStart.split(':').map(Number)
                                                        const [endH, endM] = workEnd.split(':').map(Number)
                                                        const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
                                                        return (totalMinutes / 60).toFixed(1)
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="bg-white/80 p-3 sm:p-4 rounded-xl border-2 border-blue-200 shadow-sm col-span-2 sm:col-span-1">
                                                <div className="text-xs sm:text-sm text-gray-600 mb-1">Интервал</div>
                                                <div className="text-xl sm:text-3xl font-bold text-blue-600">{sessionDuration}<span className="text-base sm:text-lg">мин</span></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Примеры временных слотов:</div>
                                            <div className="flex flex-wrap gap-2">
                                                {schedulePreview.slots.map((slot, i) => (
                                                    <div
                                                        key={i}
                                                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white border-2 border-blue-300 rounded-lg font-mono text-xs sm:text-sm font-bold text-blue-700 shadow-sm"
                                                    >
                                                        {slot}
                                                    </div>
                                                ))}
                                                {schedulePreview.count > 10 && (
                                                    <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 border-2 border-gray-300 rounded-lg text-xs sm:text-sm text-gray-600">
                                                        ...и еще {schedulePreview.count - 10}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button 
                                onClick={handleSaveSchedule} 
                                disabled={isSaving} 
                                className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                            >
                                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                {isSaving ? 'Сохранение...' : 'Сохранить расписание'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Информационная панель */}
                {activeTab === 'info' && (
                    <Card className="booking-card border-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg md:text-xl font-bold break-words">Информационная панель</div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">Информация для клиентов на главной странице</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div>
                                <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                    <Info className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                    <span>Дополнительная информация</span>
                                </label>
                                <textarea
                                    value={infoAdditional}
                                    onChange={(e) => setInfoAdditional(e.target.value)}
                                    placeholder="Правила записи, контактная информация, особые условия..."
                                    maxLength={4000}
                                    className="flex min-h-[150px] sm:min-h-[200px] w-full rounded-xl border-2 border-purple-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20 focus-visible:border-purple-400 resize-none shadow-sm"
                                />
                                <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                                    <span className="hidden sm:inline">До 4000 символов</span>
                                    <span className="sm:hidden">Макс. 4000</span>
                                    <span>{infoAdditional.length} / 4000</span>
                                </div>
                            </div>

                            {infoAdditional && (
                                <div className="booking-card border-2 bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-5">
                                    <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Предпросмотр:</h3>
                                    <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-purple-200 whitespace-pre-wrap text-xs sm:text-sm text-gray-700 break-words">
                                        {infoAdditional}
                                    </div>
                                </div>
                            )}

                            <Button 
                                onClick={handleSaveInfo} 
                                disabled={isSaving} 
                                className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                            >
                                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                {isSaving ? 'Сохранение...' : 'Сохранить информацию'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Telegram */}
                {activeTab === 'telegram' && (
                    <Card className="booking-card border-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg md:text-xl font-bold break-words">Настройки Telegram</div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">Уведомления и интеграция с ботом</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            {/* Статус */}
                            <div className={cn(
                                "p-5 rounded-2xl border-2 shadow-lg",
                                isTelegramConfigured
                                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                                    : "bg-gradient-to-br from-red-50 to-rose-50 border-red-300"
                            )}>
                                <div className="flex items-center gap-3 mb-3">
                                    {isTelegramConfigured ? (
                                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                    )}
                                    <div>
                                        <div className="text-lg font-bold text-gray-900">
                                            Статус: {isTelegramConfigured ? '✅ Настроен' : '❌ Не настроен'}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {isTelegramConfigured
                                                ? 'Бот подключен и готов отправлять уведомления'
                                                : 'Требуется настройка переменных окружения'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Инструкция */}
                            <div className="bg-blue-50/50 border-2 border-blue-200 p-5 rounded-2xl">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    Инструкция по настройке
                                </h3>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                    <li>Создайте бота через <code className="bg-white px-2 py-1 rounded font-mono text-blue-600">@BotFather</code></li>
                                    <li>Скопируйте токен бота</li>
                                    <li>Узнайте свой Chat ID через <code className="bg-white px-2 py-1 rounded font-mono text-blue-600">@userinfobot</code></li>
                                    <li>Добавьте переменные в <code className="bg-white px-2 py-1 rounded font-mono">.env.local</code>:
                                        <pre className="bg-white/80 p-3 rounded-lg mt-2 text-xs font-mono border border-blue-200 overflow-x-auto">
{`TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_ADMIN_CHAT_ID=ваш_chat_id`}
                                        </pre>
                                    </li>
                                    <li>Перезапустите приложение</li>
                                </ol>
                            </div>

                            {/* Тестирование */}
                            {isTelegramConfigured && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-5 rounded-2xl">
                                    <h3 className="font-bold text-gray-900 mb-3">Тестирование подключения</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Отправьте тестовое уведомление, чтобы проверить работу бота
                                    </p>
                                    <Button
                                        onClick={handleTestTelegram}
                                        disabled={isSendingTest}
                                        variant="default"
                                        className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                                    >
                                        <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        {isSendingTest ? 'Отправка...' : 'Отправить тестовое уведомление'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Документы */}
                {activeTab === 'documents' && (
                    <Card className="booking-card border-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg md:text-xl font-bold break-words">Юридические документы</div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">Оферта и политика конфиденциальности</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div className="bg-blue-50/50 border-2 border-blue-200 p-4 rounded-xl">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    <span>При добавлении нового документа старый автоматически деактивируется</span>
                                </p>
                            </div>

                            {/* Переключатель метода загрузки */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setUploadMethod('file')
                                        setNewDocUrl('')
                                    }}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold border-2',
                                        uploadMethod === 'file'
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                                    )}
                                >
                                    <Upload className="h-5 w-5" />
                                    Загрузить файл
                                </button>
                                <button
                                    onClick={() => {
                                        setUploadMethod('url')
                                        setSelectedFile(null)
                                    }}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold border-2',
                                        uploadMethod === 'url'
                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                                    )}
                                >
                                    <LinkIcon className="h-5 w-5" />
                                    Указать URL
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Тип документа *</label>
                                    <select
                                        value={newDocType}
                                        onChange={(e) => setNewDocType(e.target.value as 'offer' | 'policy')}
                                        className="flex h-12 w-full rounded-xl border-2 border-orange-200 bg-white px-4 py-3 text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/20 focus-visible:border-orange-400"
                                    >
                                        <option value="offer">📄 Оферта</option>
                                        <option value="policy">🔒 Политика конфиденциальности</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block">Название *</label>
                                    <Input
                                        value={newDocTitle}
                                        onChange={(e) => setNewDocTitle(e.target.value)}
                                        placeholder="Название документа"
                                        className="h-12"
                                    />
                                </div>
                            </div>

                            {uploadMethod === 'file' ? (
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-orange-500" />
                                        Выберите файл *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="file-input"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="file-input"
                                            className="flex items-center justify-center gap-3 w-full h-32 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/50 hover:bg-orange-100/50 transition-all cursor-pointer group"
                                        >
                                            {selectedFile ? (
                                                <div className="text-center">
                                                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                                        <FileText className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div className="font-bold text-gray-900">{selectedFile.name}</div>
                                                    <div className="text-sm text-gray-600">
                                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
                                                    </div>
                                                    <div className="text-xs text-orange-600 mt-1">Нажмите для замены</div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-12 h-12 mx-auto mb-2 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                                    <div className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                                                        Нажмите для выбора файла
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX (макс 10 МБ)</div>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <LinkIcon className="h-4 w-4 text-orange-500" />
                                        URL документа *
                                    </label>
                                    <Input
                                        value={newDocUrl}
                                        onChange={(e) => setNewDocUrl(e.target.value)}
                                        placeholder="https://example.com/document.pdf"
                                        className="h-12"
                                    />
                                </div>
                            )}

                            <Button 
                                onClick={handleAddDocument} 
                                disabled={isSaving || isUploading} 
                                className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                                        Загрузка файла...
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        {uploadMethod === 'file' ? <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> : <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                                        {uploadMethod === 'file' ? 'Загрузить документ' : 'Добавить документ'}
                                    </>
                                )}
                            </Button>

                            {documents.length > 0 && (
                                <div className="space-y-3 mt-6">
                                    <h3 className="font-bold text-gray-900 text-lg">Загруженные документы</h3>
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="booking-card border-2 hover:shadow-xl transition-all p-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="text-2xl">{doc.doc_type === 'offer' ? '📄' : '🔒'}</span>
                                                        <div className="font-bold text-gray-900 text-lg">{doc.title}</div>
                                                    {doc.is_active && (
                                                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border-2 border-green-300">
                                                                ✓ Активен
                                                        </span>
                                                    )}
                                                </div>
                                                    <div className="text-sm text-gray-600 mb-1">
                                                        {doc.doc_type === 'offer' ? 'Договор оферты' : 'Политика конфиденциальности'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 font-mono truncate max-w-full" title={doc.url}>
                                                        {doc.url}
                                                    </div>
                                            </div>
                                            <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium shadow-md whitespace-nowrap flex-shrink-0"
                                            >
                                                    <FileText className="h-4 w-4" />
                                                Открыть
                                            </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Смена пароля */}
                {activeTab === 'password' && (
                    <Card className="booking-card border-2">
                        <CardHeader className="p-4 sm:p-6">
                            <CardTitle className="flex items-start gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base sm:text-lg md:text-xl font-bold break-words">Смена пароля</div>
                                    <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">Обновление пароля администратора</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                            <div className="bg-red-50/50 border-2 border-red-200 p-4 rounded-xl">
                                <p className="text-sm text-red-800 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>После смены пароля новый пароль будет отправлен в Telegram. Сохраните его в надежном месте!</span>
                                </p>
                            </div>

                            <div className="space-y-4 max-w-lg">
                            <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-red-500" />
                                        Текущий пароль *
                                    </label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Введите текущий пароль"
                                    required
                                        className="h-12"
                                />
                            </div>
                            <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-green-500" />
                                        Новый пароль *
                                    </label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Минимум 6 символов"
                                    required
                                    minLength={6}
                                        className="h-12"
                                    />
                                    {newPassword.length > 0 && (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all",
                                                            newPassword.length < 6 && "w-1/3 bg-red-500",
                                                            newPassword.length >= 6 && newPassword.length < 10 && "w-2/3 bg-yellow-500",
                                                            newPassword.length >= 10 && "w-full bg-green-500"
                                                        )}
                                                    />
                                                </div>
                                                <span className={cn(
                                                    "font-medium",
                                                    newPassword.length < 6 && "text-red-600",
                                                    newPassword.length >= 6 && newPassword.length < 10 && "text-yellow-600",
                                                    newPassword.length >= 10 && "text-green-600"
                                                )}>
                                                    {newPassword.length < 6 && "Слабый"}
                                                    {newPassword.length >= 6 && newPassword.length < 10 && "Средний"}
                                                    {newPassword.length >= 10 && "Сильный"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                            </div>
                            <div>
                                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Подтвердите новый пароль *
                                    </label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Повторите новый пароль"
                                    required
                                        className="h-12"
                                    />
                                    {confirmPassword.length > 0 && (
                                        <div className="mt-2 text-xs flex items-center gap-1">
                                            {newPassword === confirmPassword ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span className="text-green-600 font-medium">Пароли совпадают</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                                    <span className="text-red-600 font-medium">Пароли не совпадают</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={handleChangePassword}
                                    disabled={isSaving || newPassword.length < 6 || newPassword !== confirmPassword}
                                    className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                                >
                                    <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    {isSaving ? 'Изменение пароля...' : 'Изменить пароль'}
                                </Button>
                                {(newPassword.length < 6 || newPassword !== confirmPassword) && !isSaving && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Info className="h-3 w-3" />
                                        {newPassword.length < 6 
                                            ? 'Введите пароль минимум 6 символов'
                                            : newPassword !== confirmPassword 
                                                ? 'Пароли должны совпадать' 
                                                : 'Заполните все поля'}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
