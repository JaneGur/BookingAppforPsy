'use client'

import { useState } from 'react'
import { Lock, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { validatePassword, getPasswordStrength } from '../utils/validation-utils'

interface PasswordSettingsProps {
    onError: (message: string) => void
    onSuccess: (message: string) => void
    isSaving: boolean
    setIsSaving: (saving: boolean) => void
}

export default function PasswordSettings({
                                             onError,
                                             onSuccess,
                                             isSaving,
                                             setIsSaving
                                         }: PasswordSettingsProps) {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleChangePassword = async () => {
        // Валидация
        if (!formData.currentPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
            onError('Заполните все поля')
            return
        }

        const passwordError = validatePassword(formData.newPassword)
        if (passwordError) {
            onError(passwordError)
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            onError('Новые пароли не совпадают')
            return
        }

        setIsSaving(true)

        try {
            const res = await fetch('/api/admin/settings/password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword,
                }),
            })

            if (res.ok) {
                onSuccess('✅ Пароль успешно изменен. Новый пароль отправлен в Telegram.')
                setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                const errorData = await res.json()
                onError(errorData.error || 'Не удалось изменить пароль')
            }
        } catch (error) {
            onError('Ошибка при изменении пароля')
        } finally {
            setIsSaving(false)
        }
    }

    const passwordStrength = formData.newPassword
        ? getPasswordStrength(formData.newPassword)
        : null

    const isCurrentPasswordValid = formData.currentPassword.length >= 6
    const isNewPasswordValid = formData.newPassword.length >= 6
    const isConfirmPasswordValid = formData.newPassword === formData.confirmPassword
    const canSave = isCurrentPasswordValid && isNewPasswordValid && isConfirmPasswordValid && !isSaving

    return (
        <Card className="booking-card border-2">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold break-words">
                            Смена пароля
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">
                            Обновление пароля администратора
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                {/* Предупреждение */}
                <div className="bg-red-50/50 border-2 border-red-200 p-4 rounded-xl">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>После смены пароля новый пароль будет отправлен в Telegram. Сохраните его в надежном месте!</span>
                    </p>
                </div>

                {/* Форма */}
                <div className="space-y-4 max-w-lg">
                    {/* Текущий пароль */}
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <Lock className="h-4 w-4 text-red-500" />
                            Текущий пароль *
                        </label>
                        <Input
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => handleChange('currentPassword', e.target.value)}
                            placeholder="Введите текущий пароль"
                            required
                            className="h-12"
                        />
                        {formData.currentPassword && (
                            <div className="mt-2 flex items-center gap-1">
                                {isCurrentPasswordValid ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">
                                            Пароль введен
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                                        <span className="text-xs text-yellow-600">
                                            Минимум 6 символов
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Новый пароль */}
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <Lock className="h-4 w-4 text-green-500" />
                            Новый пароль *
                        </label>
                        <Input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleChange('newPassword', e.target.value)}
                            placeholder="Минимум 6 символов"
                            required
                            minLength={6}
                            className="h-12"
                        />
                        {formData.newPassword && passwordStrength && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">
                                        Надежность пароля:
                                    </span>
                                    <span className={cn(
                                        "text-xs font-medium",
                                        passwordStrength.level === 'weak' && "text-red-600",
                                        passwordStrength.level === 'medium' && "text-yellow-600",
                                        passwordStrength.level === 'strong' && "text-green-600"
                                    )}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-300",
                                            passwordStrength.color
                                        )}
                                        style={{ width: passwordStrength.width }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                    {formData.newPassword.length < 10
                                        ? 'Добавьте больше символов для усиления пароля'
                                        : 'Отличный пароль!'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Подтверждение пароля */}
                    <div>
                        <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Подтвердите новый пароль *
                        </label>
                        <Input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            placeholder="Повторите новый пароль"
                            required
                            className="h-12"
                        />
                        {formData.confirmPassword && (
                            <div className="mt-2 flex items-center gap-1">
                                {isConfirmPasswordValid ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">
                                            Пароли совпадают
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <span className="text-xs text-red-600 font-medium">
                                            Пароли не совпадают
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Индикаторы валидации */}
                <div className="bg-gray-50/50 border-2 border-gray-200 p-4 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Требования к паролю:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li className={`flex items-center gap-2 ${formData.currentPassword.length >= 6 ? 'text-green-600' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${formData.currentPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span>Текущий пароль: минимум 6 символов</span>
                        </li>
                        <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span>Новый пароль: минимум 6 символов</span>
                        </li>
                        <li className={`flex items-center gap-2 ${formData.newPassword === formData.confirmPassword ? 'text-green-600' : ''}`}>
                            <div className={`w-2 h-2 rounded-full ${formData.newPassword === formData.confirmPassword ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span>Пароли должны совпадать</span>
                        </li>
                    </ul>
                </div>

                {/* Кнопка сохранения */}
                <div className="space-y-2">
                    <Button
                        onClick={handleChangePassword}
                        disabled={!canSave}
                        className={cn(
                            "shadow-xl h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto transition-all",
                            canSave
                                ? "bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        {isSaving ? 'Изменение пароля...' : 'Изменить пароль'}
                    </Button>

                    {!canSave && !isSaving && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {!isCurrentPasswordValid
                                ? 'Введите текущий пароль (минимум 6 символов)'
                                : !isNewPasswordValid
                                    ? 'Введите новый пароль (минимум 6 символов)'
                                    : !isConfirmPasswordValid
                                        ? 'Пароли должны совпадать'
                                        : 'Заполните все поля'}
                        </p>
                    )}
                </div>

                {/* Дополнительная информация */}
                <div className="bg-blue-50/50 border-2 border-blue-200 p-4 rounded-xl mt-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" />
                        Что произойдет после смены пароля:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                            <span>Новый пароль будет отправлен в Telegram-бот</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                            <span>Старый пароль перестанет работать сразу после изменения</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                            <span>Рекомендуется сохранить новый пароль в надежном месте</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 flex-shrink-0" />
                            <span>Если вы не получили пароль в Telegram, проверьте настройки бота</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}