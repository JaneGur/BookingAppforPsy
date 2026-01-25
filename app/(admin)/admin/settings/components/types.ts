export type TabKey = 'schedule' | 'info' | 'telegram' | 'documents' | 'password'

export interface SettingsData {
    work_start: string
    work_end: string
    session_duration: number
    format: string
    info_contacts: any
    info_additional?: string
}

export interface DocumentType {
    id: string
    title: string
    url: string
    doc_type: 'offer' | 'policy'
    is_active: boolean
    created_at: string
}

export interface SchedulePreview {
    slots: string[]
    count: number
    error: string | null
}

export interface PasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export interface DocumentFormData {
    docType: 'offer' | 'policy'
    title: string
    url: string
    file: File | null
    uploadMethod: 'url' | 'file'
}