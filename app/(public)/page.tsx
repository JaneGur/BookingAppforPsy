'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Star, ShieldCheck, LayoutDashboard } from 'lucide-react'
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
            <div className="max-w-7xl mx-auto space-y-16 relative z-10 px-4 sm:px-6 lg:px-8">
                <section className="booking-hero">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/80 font-medium animate-[fadeInUp_0.6s_ease-out]">
                            <Sparkles className="h-5 w-5 animate-pulse" />
                            Арт-терапия · онлайн
                        </div>
                        <div className="space-y-5">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight animate-[fadeInUp_0.8s_ease-out]">
                                Запись на консультацию с&nbsp;арт-терапевтом
                            </h1>
                            <p className="mt-5 text-xl sm:text-2xl text-white/95 max-w-3xl font-semibold leading-snug animate-[fadeInUp_0.8s_ease-out_0.1s_backwards]">
                                Справляемся с тревогой, выгоранием и кризисами. Твоя устойчивость – наша цель.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-[fadeInUp_0.8s_ease-out_0.3s_backwards]">
                            <Button
                                size="lg"
                                asChild
                                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto bg-white text-primary-700 hover:bg-white/95 border-2 border-white"
                            >
                                <Link href="#booking-flow">
                                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Начать запись
                                </Link>
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => setIsContactModalOpen(true)}
                                className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-all duration-300 w-full sm:w-auto bg-white/10 text-white hover:bg-white/15 border border-white/20"
                            >
                                <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                Написать терапевту
                            </Button>
                        </div>
                        <div className="grid gap-3 sm:gap-5 sm:grid-cols-3 mt-4 sm:mt-6">
                            {heroHighlights.map((item, idx) => (
                                <div key={item.title} className="hero-highlight" style={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
                                    <p className="text-2xl sm:text-3xl font-extrabold text-white mb-0.5 sm:mb-1">{item.title}</p>
                                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        {/*<div className="flex flex-wrap gap-3 text-sm text-white">*/}
                        {/*    {promiseBadges.map(({ icon: Icon, label }, idx) => (*/}
                        {/*        <span key={label} className="badge-pill text-white" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>*/}
                        {/*            <Icon className="h-4 w-4" />*/}
                        {/*            {label}*/}
                        {/*        </span>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </div>
                </section>

                <div className="space-y-6 lg:sticky lg:top-24 animate-[fadeInUp_0.8s_ease-out]">
                    <InfoPanel />
                </div>

                <div className="flex flex-col gap-8" id="booking-flow">
                    <div className="text-center space-y-3 sm:space-y-4 animate-[fadeInUp_0.6s_ease-out]">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 px-4">
                            Начните путь к себе
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Всего несколько шагов отделяют вас от первой консультации
                        </p>
                    </div>

                    <div className="space-y-6 sm:space-y-8">
                        <div className="booking-card animate-[scaleIn_0.6s_ease-out]">
                            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs font-semibold text-primary-600 uppercase tracking-[0.2em] truncate">
                                        Процесс записи
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-600">Шаг {step} из 4</p>
                                </div>
                            </div>
                            <StepIndicator currentStep={step} />
                        </div>

                        <div className="space-y-8">
                            {step === 1 && <StepDateTime />}
                            {step === 2 && <StepUserData />}
                            {step === 3 && <StepConfirmation />}
                            {step === 4 && <StepAuth />}
                        </div>
                    </div>
                </div>
            </div>

            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    )
}