export const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
        return 'Пароль должен содержать минимум 6 символов'
    }
    return null
}

export const validateFile = (file: File): string | null => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
        return 'Неподдерживаемый формат файла. Разрешены: PDF, DOC, DOCX'
    }

    const maxSize = 10 * 1024 * 1024 // 10 МБ
    if (file.size > maxSize) {
        return 'Файл слишком большой. Максимальный размер: 10 МБ'
    }

    return null
}

export const getPasswordStrength = (password: string): {
    level: 'weak' | 'medium' | 'strong'
    width: string
    color: string
    label: string
} => {
    if (password.length < 6) {
        return {
            level: 'weak',
            width: '33%',
            color: 'bg-red-500',
            label: 'Слабый'
        }
    }
    if (password.length < 10) {
        return {
            level: 'medium',
            width: '66%',
            color: 'bg-yellow-500',
            label: 'Средний'
        }
    }
    return {
        level: 'strong',
        width: '100%',
        color: 'bg-green-500',
        label: 'Сильный'
    }
}