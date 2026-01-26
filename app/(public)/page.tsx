'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Star, ShieldCheck, LayoutDashboard, Menu, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { StepUserData } from '@/components/booking/StepUserData'
import { StepConfirmation } from '@/components/booking/StepConfirmation'
import { StepAuth } from '@/components/booking/StepAuth'
import { StepDateTime } from '@/components/booking/StepDateTime'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { useBookingForm } from '@/lib/contexts/BookingContext'
import { Button } from '@/components/ui/button'
import { InfoPanel } from '@/components/shared/InfoPanel'
import { ContactModal } from '@/components/contact/ContactModal'
import { Path } from '@/lib/routing'

export default function HomePage() {
    const router = useRouter()
    const { step } = useBookingForm()
    const { data: session, status } = useSession()
    const isAuthenticated = !!session?.user
    const [isContactModalOpen, setIsContactModalOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Редирект авторизованных пользователей в личный кабинет
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            // Если админ, редиректим в админку, иначе в клиентский кабинет
            if (session.user.role === 'admin') {
                router.push(Path.AdminDashboard)
            } else {
                router.push(Path.ClientDashboard)
            }
        }
    }, [status, session, router])

    // Закрытие меню при клике вне его области
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobileMenuOpen) {
                setIsMobileMenuOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isMobileMenuOpen])

    // Показываем загрузку пока проверяем сессию
    if (status === 'loading') {
        return (
            <div className="booking-page-surface min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium">Загрузка...</p>
                </div>
            </div>
        )
    }

    // Если пользователь авторизован, не показываем главную страницу (он будет редиректнут)
    if (status === 'authenticated') {
        return null
    }

    const heroHighlights = [
        {
            title: 'Эмпатия без оценок',
            description: 'а так же полная конфиденциальность',
        },
        {
            title: '60 минут',
            description: 'Глубокая индивидуальная консультация онлайн',
        },
        {
            title: '3 000 ₽',
            description: 'Фиксированная стоимость без скрытых оплат',
        },
    ]

    const promiseBadges = [
        {
            icon: ShieldCheck,
            label: 'Конфиденциальность',
        },
    ]

    return (
        <div className="booking-page-surface">
            <div className="booking-page-gradient" aria-hidden />

            {/* Мобильное меню */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl animate-slideInRight"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">Меню</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <Button
                                size="sm"
                                asChild
                                className="w-full justify-start"
                            >
                                <Link href="#booking-flow" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Начать запись
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsContactModalOpen(true)
                                    setIsMobileMenuOpen(false)
                                }}
                                className="w-full justify-start"
                            >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Написать терапевту
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-12 lg:space-y-16 relative z-10 px-4 sm:px-6 lg:px-8">
                {/* Кнопка меню для мобильных */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden fixed top-4 right-4 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg"
                >
                    <Menu className="h-6 w-6 text-gray-700" />
                </button>

                <section className="booking-hero pt-4 lg:pt-0">
                    <div className="flex flex-col gap-6 lg:gap-8">
                        <div className="flex items-center gap-3 text-xs lg:text-sm uppercase tracking-[0.3em] text-white/80 font-medium animate-[fadeInUp_0.6s_ease-out]">
                            <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 animate-pulse" />
                            Арт-терапия · онлайн
                        </div>

                        <div className="space-y-4 lg:space-y-5">
                            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight tracking-tight animate-[fadeInUp_0.8s_ease-out]">
                                Запись на консультацию с&nbsp;арт-терапевтом
                            </h1>
                            <p className="mt-3 lg:mt-5 text-lg sm:text-xl lg:text-2xl text-white/95 lg:max-w-3xl font-semibold leading-snug animate-[fadeInUp_0.8s_ease-out_0.1s_backwards]">
                                Справляемся с тревогой, выгоранием и кризисами. Твоя устойчивость – наша цель.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 lg:gap-4 animate-[fadeInUp_0.8s_ease-out_0.3s_backwards]">
                            <Button
                                size="lg"
                                asChild
                                className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto bg-white text-primary-700 hover:bg-white/95 border-2 border-white"
                            >
                                <Link href="#booking-flow">
                                    <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                                    Начать запись
                                </Link>
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-base lg:text-lg px-6 lg:px-8 py-4 lg:py-6 h-auto shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-300 w-full sm:w-auto bg-white/10 text-white hover:bg-white/15 border border-white/20"
                            >
                                <ShieldCheck className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                                Написать терапевту
                            </Button>
                        </div>

                        <div className="grid gap-4 lg:gap-5 lg:grid-cols-3 mt-4 lg:mt-6">
                            {heroHighlights.map((item, idx) => (
                                <div
                                    key={item.title}
                                    className="hero-highlight bg-white/5 backdrop-blur-sm p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-white/10"
                                    style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                                >
                                    <p className="text-xl lg:text-3xl font-extrabold text-white mb-1 lg:mb-2">{item.title}</p>
                                    <p className="text-xs lg:text-sm text-white/75 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="space-y-6 lg:sticky lg:top-24 animate-[fadeInUp_0.8s_ease-out]">
                    <InfoPanel />
                </div>

                <div className="flex flex-col gap-6 lg:gap-8" id="booking-flow">
                    <div className="text-center space-y-3 lg:space-y-4 animate-[fadeInUp_0.6s_ease-out]">
                        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 px-2 lg:px-4">
                            Начните путь к себе
                        </h2>
                        <p className="text-sm lg:text-lg text-gray-600 max-w-2xl mx-auto px-2 lg:px-4">
                            Всего несколько шагов отделяют вас от первой консультации
                        </p>
                    </div>

                    <div className="space-y-6 lg:space-y-8">
                        <div className="booking-card animate-[scaleIn_0.6s_ease-out] p-4 lg:p-6">
                            <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <LayoutDashboard className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs lg:text-sm font-semibold text-primary-600 uppercase tracking-[0.2em] truncate">
                                        Процесс записи
                                    </p>
                                    <p className="text-sm lg:text-base text-gray-600">Шаг {step} из 4</p>
                                </div>
                            </div>
                            <StepIndicator currentStep={step} />
                        </div>

                        <div className="space-y-6 lg:space-y-8">
                            {step === 1 && <StepDateTime />}
                            {step === 2 && <StepUserData />}
                            {step === 3 && <StepConfirmation />}
                            {step === 4 && <StepAuth />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Футер для мобильных */}
            <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-30">
                <div className="flex justify-between items-center">
                    <Button
                        size="sm"
                        asChild
                        className="flex-1 mx-1"
                    >
                        <Link href="#booking-flow">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Записаться
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsContactModalOpen(true)}
                        className="flex-1 mx-1"
                    >
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Контакты
                    </Button>
                </div>
            </footer>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    )
}