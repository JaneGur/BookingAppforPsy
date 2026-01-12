'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Document {
    id: number
    name: string
    doc_type: string
    url: string
}

export function Footer() {
    const [documents, setDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadDocuments() {
            try {
                const res = await fetch('/api/documents')
                if (!res.ok) {
                    throw new Error('Failed to fetch documents')
                }
                const data = await res.json()
                // Убеждаемся, что data - это массив
                setDocuments(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Failed to load documents:', error)
                setDocuments([])
            } finally {
                setIsLoading(false)
            }
        }

        loadDocuments()
    }, [])

    const offerDoc = Array.isArray(documents) ? documents.find((d) => d.doc_type === 'offer') : undefined
    const policyDoc = Array.isArray(documents) ? documents.find((d) => d.doc_type === 'policy') : undefined

    return (
        <footer className="border-t border-primary-200/30 bg-white/50 backdrop-blur-sm mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Документы */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Правовые документы</h3>
                        <div className="space-y-2">
                            {isLoading ? (
                                <p className="text-sm text-gray-500">Загрузка...</p>
                            ) : (
                                <>
                                    {offerDoc ? (
                                        <Link
                                            href={offerDoc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Публичная оферта</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    ) : null}
                                    {policyDoc ? (
                                        <Link
                                            href={policyDoc.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>Политика конфиденциальности</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    ) : null}
                                    {!offerDoc && !policyDoc && !isLoading && (
                                        <p className="text-sm text-gray-500">Документы не загружены</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Контакты */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Контакты</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>email@example.com</p>
                            <p>+7 (XXX) XXX-XX-XX</p>
                        </div>
                    </div>

                    {/* Администратор */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Администратор</h3>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login?callbackUrl=/admin/dashboard">
                                <Lock className="h-4 w-4 mr-2" />
                                Служебный вход
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-primary-200/20 text-center text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} Запись на онлайн-консультацию. Все права защищены.</p>
                </div>
            </div>
        </footer>
    )
}

