'use client'

import { useState } from 'react'
import { FileText, Upload, Link as LinkIcon, Info, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { validateFile } from '../utils/validation-utils'
import {DocumentFormData} from "@/app/(admin)/admin/settings/components/types";
import {DocumentType} from './types'


interface DocumentsSettingsProps {
    documents: DocumentType[]
    onDocumentsUpdate: () => Promise<void>
    onError: (message: string) => void
    onSuccess: (message: string) => void
    isSaving: boolean
    setIsSaving: (saving: boolean) => void
}

export default function DocumentsSettings({
                                              documents,
                                              onDocumentsUpdate,
                                              onError,
                                              onSuccess,
                                              isSaving,
                                              setIsSaving
                                          }: DocumentsSettingsProps) {
    const [formData, setFormData] = useState<DocumentFormData>({
        docType: 'offer',
        title: '',
        url: '',
        file: null,
        uploadMethod: 'file'
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const validationError = validateFile(file)
            if (validationError) {
                onError(validationError)
                return
            }

            setFormData(prev => ({
                ...prev,
                file,
                url: '' // Очищаем URL при выборе файла
            }))
        }
    }

    const handleAddDocument = async () => {
        if (!formData.title.trim()) {
            onError('Введите название документа')
            return
        }

        if (formData.uploadMethod === 'url' && !formData.url.trim()) {
            onError('Введите URL документа')
            return
        }

        if (formData.uploadMethod === 'file' && !formData.file) {
            onError('Выберите файл для загрузки')
            return
        }

        setIsSaving(true)

        try {
            if (formData.uploadMethod === 'file' && formData.file) {
                // Загрузка файла
                const formDataToSend = new FormData()
                formDataToSend.append('file', formData.file)
                formDataToSend.append('doc_type', formData.docType)
                formDataToSend.append('title', formData.title)

                const res = await fetch('/api/admin/documents/upload', {
                    method: 'POST',
                    body: formDataToSend,
                })

                const data = await res.json()

                if (res.ok) {
                    onSuccess('✅ Документ успешно загружен')
                    resetForm()
                    onDocumentsUpdate()
                } else {
                    onError(data.error || 'Не удалось загрузить документ')
                }
            } else {
                // Добавление по URL
                const res = await fetch('/api/admin/documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        doc_type: formData.docType,
                        title: formData.title,
                        url: formData.url,
                    }),
                })

                if (res.ok) {
                    onSuccess('✅ Документ добавлен')
                    resetForm()
                    onDocumentsUpdate()
                } else {
                    const errorData = await res.json()
                    onError(errorData.error || 'Не удалось добавить документ')
                }
            }
        } catch (error) {
            onError('Ошибка при добавлении документа')
        } finally {
            setIsSaving(false)
        }
    }

    const resetForm = () => {
        setFormData({
            docType: 'offer',
            title: '',
            url: '',
            file: null,
            uploadMethod: 'file'
        })
        // Сбрасываем input file
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
    }

    const handleDocumentTypeChange = (type: 'offer' | 'policy') => {
        setFormData(prev => ({ ...prev, docType: type }))
    }

    const handleUploadMethodChange = (method: 'file' | 'url') => {
        setFormData(prev => ({
            ...prev,
            uploadMethod: method,
            file: method === 'url' ? null : prev.file,
            url: method === 'file' ? '' : prev.url
        }))
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <Card className="booking-card border-2">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold break-words">
                            Юридические документы
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">
                            Оферта и политика конфиденциальности
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Информационное сообщение */}
                <div className="bg-blue-50/50 border-2 border-blue-200 p-4 rounded-xl">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>При добавлении нового документа старый автоматически деактивируется</span>
                    </p>
                </div>

                {/* Переключатель метода загрузки */}
                {/*<div className="flex gap-2">*/}
                {/*    <button*/}
                {/*        onClick={() => handleUploadMethodChange('file')}*/}
                {/*        className={cn(*/}
                {/*            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold border-2',*/}
                {/*            formData.uploadMethod === 'file'*/}
                {/*                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg'*/}
                {/*                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'*/}
                {/*        )}*/}
                {/*    >*/}
                {/*        <Upload className="h-5 w-5" />*/}
                {/*        Загрузить файл*/}
                {/*    </button>*/}
                {/*    <button*/}
                {/*        onClick={() => handleUploadMethodChange('url')}*/}
                {/*        className={cn(*/}
                {/*            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-bold border-2',*/}
                {/*            formData.uploadMethod === 'url'*/}
                {/*                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600 shadow-lg'*/}
                {/*                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'*/}
                {/*        )}*/}
                {/*    >*/}
                {/*        <LinkIcon className="h-5 w-5" />*/}
                {/*        Указать URL*/}
                {/*    </button>*/}
                {/*</div>*/}

                {/* Тип документа */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block">
                            Тип документа *
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleDocumentTypeChange('offer')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                                    formData.docType === 'offer'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                                )}
                            >
                                <span className="text-xl">📄</span>
                                Оферта
                            </button>
                            <button
                                onClick={() => handleDocumentTypeChange('policy')}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                                    formData.docType === 'policy'
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-600 shadow-lg'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                                )}
                            >
                                <span className="text-xl">🔒</span>
                                Политика
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block">
                            Название *
                        </label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Название документа"
                            className="h-12"
                        />
                    </div>
                </div>

                {/* Поле для файла или URL */}
                {formData.uploadMethod === 'file' ? (
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
                                {formData.file ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                            <FileText className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="font-bold text-gray-900 truncate max-w-xs">
                                            {formData.file.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {formatFileSize(formData.file.size)}
                                        </div>
                                        <div className="text-xs text-orange-600 mt-1">Нажмите для замены</div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-12 h-12 mx-auto mb-2 text-orange-400 group-hover:text-orange-600 transition-colors" />
                                        <div className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                                            Нажмите для выбора файла
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            PDF, DOC, DOCX (макс 10 МБ)
                                        </div>
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
                            value={formData.url}
                            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://example.com/document.pdf"
                            className="h-12"
                        />
                    </div>
                )}

                {/* Кнопка сохранения */}
                <Button
                    onClick={handleAddDocument}
                    disabled={isSaving || !formData.title.trim() ||
                        (formData.uploadMethod === 'url' && !formData.url.trim()) ||
                        (formData.uploadMethod === 'file' && !formData.file)}
                    className="shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
                            Сохранение...
                        </>
                    ) : (
                        <>
                            {formData.uploadMethod === 'file' ? (
                                <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            ) : (
                                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            )}
                            {formData.uploadMethod === 'file' ? 'Загрузить документ' : 'Добавить документ'}
                        </>
                    )}
                </Button>

                {/* Список загруженных документов */}
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
                                            <span className="text-2xl">
                                                {doc.doc_type === 'offer' ? '📄' : '🔒'}
                                            </span>
                                            <div className="font-bold text-gray-900 text-lg">
                                                {doc.title}
                                            </div>
                                            {doc.is_active && (
                                                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold border-2 border-green-300">
                                                    ✓ Активен
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 mb-1">
                                            {doc.doc_type === 'offer'
                                                ? 'Договор оферты'
                                                : 'Политика конфиденциальности'
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono truncate max-w-full" title={doc.url}>
                                            {doc.url}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Добавлен: {new Date(doc.created_at).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
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
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}