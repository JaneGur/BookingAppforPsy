'use client'

import Link from 'next/link'
import { Sparkles, Star, ShieldCheck } from 'lucide-react'
import { StepUserData } from '@/components/booking/StepUserData'
import { StepConfirmation } from '@/components/booking/StepConfirmation'
import { StepAuth } from '@/components/booking/StepAuth'
import { useAppSelector } from '@/store/hooks'
import { StepIndicator } from './booking/StepIndicator'
import { StepDateTime } from './booking/StepDateTime'
import { Button } from '@/components/ui/button'
import {InfoPanel} from '@/components/shared/InfoPanel'

export default function HomePage() {
    const step = useAppSelector((state) => state.booking.step)
    const heroHighlights = [
        {
            title: '12 лет практики',
            description: 'Арт-терапевт, супервизор и преподаватель',
        },
        {
            title: '60 минут',
            description: 'Глубокая индивидуальная сессия в Zoom или офлайн',
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
        {
            icon: Star,
            label: 'Эмпатия без оценок',
        },
    ]

    return (
        <div className="booking-page-surface">
            <div className="booking-page-gradient" aria-hidden />
            <div className="max-w-7xl mx-auto space-y-10 relative z-10 px-4 sm:px-6 lg:px-0">
                <section className="booking-hero">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-white/70">
                            <Sparkles className="h-4 w-4" />
                            Арт-терапия · онлайн / офлайн
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
                                Запись на консультацию с арт-терапевтом
                            </h1>
                            <p className="mt-4 text-lg text-white/80 max-w-3xl">
                                Мягко проводим через тревогу, выгорание и сложные переходы. Помогаю услышать себя,
                                вернуть контроль и найти новые опоры.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" asChild>
                                <Link href="#booking-flow">Начать запись</Link>
                            </Button>
                            <Button variant="secondary" size="lg" asChild>
                                <Link href="mailto:email@example.com">Написать терапевту</Link>
                            </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3 mt-4">
                            {heroHighlights.map((item) => (
                                <div key={item.title} className="hero-highlight">
                                    <p className="text-2xl font-bold">{item.title}</p>
                                    <p className="text-sm text-white/70">{item.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/80">
                            {promiseBadges.map(({ icon: Icon, label }) => (
                                <span key={label} className="badge-pill text-white">
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="space-y-6 lg:sticky lg:top-6">
                    <InfoPanel />
                </div>

                <div className="flex flex-col gap-6" id="booking-flow">
                    <div className="space-y-6">
                        <div className="booking-card">
                            <p className="text-sm font-semibold text-primary-600 uppercase tracking-widest">
                                Процесс записи
                            </p>
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
        </div>
    )
}