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
import { cn } from '@/lib/utils/cn'

// 🔧 АДАПТИВНАЯ КНОПКА для главной страницы
function ResponsiveButton({
                              children,
                              icon,
                              size = "lg",
                              variant = "default",
                              className = "",
                              ...props
                          }: any) {
    return (
        <Button
            size={size}
            variant={variant}
            className={cn(
                "transition-all duration-300",
                size === "lg" && "h-12 md:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg py-3 md:py-4 lg:py-6",
                size === "default" && "h-10 md:h-12 px-3 md:px-4 text-xs md:text-sm",
                size === "sm" && "h-8 md:h-10 px-2 md:px-3 text-xs",
                className
            )}
            {...props}
        >
            {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
            <span className="truncate">{children}</span>
        </Button>
    )
}

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
            <div className="booking-page-surface min-h-screen flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-600 font-medium text-sm md:text-base">Загрузка...</p>
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
            <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 lg:space-y-16 relative z-10 px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Герой-секция */}
                <section className="booking-hero pt-4 md:pt-6 lg:pt-8">
                    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
                        {/* Заголовок с тегом */}
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/80 font-medium animate-[fadeInUp_0.6s_ease-out]">
                            <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse flex-shrink-0" />
                            <span>Арт-терапия · онлайн</span>
                        </div>

                        {/* Основной заголовок и описание */}
                        <div className="space-y-3 md:space-y-4 lg:space-y-5">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight animate-[fadeInUp_0.8s_ease-out]">
                                Запись на консультацию с&nbsp;арт-терапевтом
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl font-semibold leading-snug animate-[fadeInUp_0.8s_ease-out_0.1s_backwards]">
                                Справляемся с тревогой, выгоранием и кризисами. Твоя устойчивость – наша цель.
                            </p>
                        </div>

                        {/* Кнопки действий */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 lg:gap-4 animate-[fadeInUp_0.8s_ease-out_0.3s_backwards]">
                            <ResponsiveButton
                                asChild
                                className="w-full sm:w-auto bg-white text-primary-700 hover:bg-white/95 border-2 border-white shadow-xl hover:shadow-2xl transform hover:scale-105"
                                icon={<Sparkles className="h-4 w-4 md:h-5 md:w-5" />}
                            >
                                <Link href="#booking-flow">
                                    Начать запись
                                </Link>
                            </ResponsiveButton>
                            <ResponsiveButton
                                variant="secondary"
                                onClick={() => setIsContactModalOpen(true)}
                                className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/15 border border-white/20 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform hover:scale-105"
                                icon={<ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />}
                            >
                                Написать терапевту
                            </ResponsiveButton>
                        </div>

                        {/* Хайлайты */}
                        <div className="grid gap-2 md:gap-3 lg:gap-4 sm:grid-cols-1 md:grid-cols-3 mt-2 md:mt-4 lg:mt-6">
                            {heroHighlights.map((item, idx) => (
                                <div
                                    key={item.title}
                                    className="hero-highlight p-3 md:p-4 rounded-xl md:rounded-2xl"
                                    style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
                                >
                                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-0.5 md:mb-1 truncate">
                                        {item.title}
                                    </p>
                                    <p className="text-xs md:text-sm text-white/75 leading-relaxed line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Бейджи (опционально) */}
                        {/* <div className="flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-white">
                            {promiseBadges.map(({ icon: Icon, label }, idx) => (
                                <span key={label} className="badge-pill text-white" style={{ animationDelay: `${0.7 + idx * 0.1}s` }}>
                                    <Icon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    {label}
                                </span>
                            ))}
                        </div> */}
                    </div>
                </section>

                {/* Инфо-панель */}
                <div className="space-y-4 md:space-y-6 lg:space-y-8 lg:sticky lg:top-24 animate-[fadeInUp_0.8s_ease-out]">
                    <InfoPanel />
                </div>

                {/* Форма записи */}
                <div className="flex flex-col gap-6 md:gap-8" id="booking-flow">
                    <div className="text-center space-y-2 md:space-y-3 lg:space-y-4 animate-[fadeInUp_0.6s_ease-out]">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 px-2 md:px-4">
                            Начните путь к себе
                        </h2>
                        <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-3 md:px-4">
                            Всего несколько шагов отделяют вас от первой консультации
                        </p>
                    </div>

                    <div className="space-y-4 md:space-y-6 lg:space-y-8">
                        {/* Карточка процесса записи */}
                        <div className="booking-card animate-[scaleIn_0.6s_ease-out] p-3 md:p-4 lg:p-6">
                            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 lg:mb-6">
                                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                    <LayoutDashboard className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] md:text-[10px] lg:text-xs font-semibold text-primary-600 uppercase tracking-[0.15em] md:tracking-[0.2em] truncate">
                                        Процесс записи
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600">Шаг {step} из 4</p>
                                </div>
                            </div>
                            <StepIndicator currentStep={step} />
                        </div>

                        {/* Шаги формы */}
                        <div className="space-y-6 md:space-y-8">
                            {step === 1 && <StepDateTime />}
                            {step === 2 && <StepUserData />}
                            {step === 3 && <StepConfirmation />}
                            {step === 4 && <StepAuth />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно контакта */}
            <ContactModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
            />
        </div>
    )
}