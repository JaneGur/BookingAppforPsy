'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ContactForm } from './ContactForm'
import { MessageCircle } from 'lucide-react'

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 bg-gradient-to-br from-primary-50 to-primary-100/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                Написать терапевту
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                Задайте вопрос или расскажите о своей ситуации
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="p-6 pt-4">
                    <ContactForm onSuccess={onClose} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
