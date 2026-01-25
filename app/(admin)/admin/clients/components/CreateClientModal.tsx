'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreateClientModalProps {
    onClose: () => void
    onSuccess: () => void
}

export default function CreateClientModal({ onClose, onSuccess }: CreateClientModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        telegram: '',
        password: ''
    })
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleCreate = async () => {
        if (!formData.name.trim() || !formData.phone.trim() || !formData.password.trim()) {
            setError('Заполните все обязательные поля')
            return
        }

        if (formData.password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов')
            return
        }

        setIsCreating(true)
        setError(null)

        try {
            const res = await fetch('/api/admin/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                onSuccess()
                onClose()
            } else {
                const data = await res.json()
                setError(data.error || 'Не удалось создать клиента')
            }
        } catch (error) {
            setError('Ошибка при создании клиента')
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />
            <div
                className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">Создать клиента</h2>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border-2 border-red-200">
                            <div className="flex items-center gap-2 text-red-700 text-sm">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {[
                            { key: 'name' as const, label: 'Имя', placeholder: 'Иван Иванов', required: true },
                            { key: 'phone' as const, label: 'Телефон', placeholder: '+7 (999) 999-99-99', required: true, type: 'tel' },
                            { key: 'email' as const, label: 'Email', placeholder: 'example@mail.com', required: false, type: 'email' },
                            { key: 'telegram' as const, label: 'Telegram', placeholder: '@username', required: false },
                            { key: 'password' as const, label: 'Пароль', placeholder: 'Минимум 6 символов', required: true, type: 'password' }
                        ].map(({ key, label, placeholder, required, type = 'text' }) => (
                            <div key={key}>
                                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                                    {label} {required && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                    type={type}
                                    value={formData[key]}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    placeholder={placeholder}
                                    className="h-11"
                                    required={required}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button variant="secondary" onClick={onClose} className="flex-1" disabled={isCreating}>
                            Отмена
                        </Button>
                        <Button onClick={handleCreate} className="flex-1" disabled={isCreating}>
                            {isCreating ? 'Создание...' : 'Создать'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}