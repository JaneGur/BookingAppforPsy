'use client'

import {
    Clock,
    Shield,
    Heart,
    Target,
    CheckCircle,
    MessageSquare,
    Zap,
    Mail,
    Smartphone,
    Phone,
    Laptop,
    Palette,
    PenTool,
    Waves,
    Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const focusAreas = [
    'Тревога и панические атаки',
    'Выгорание и апатия',
    'Кризисы в отношениях',
    'Вопросы самопринятия',
]

const goals = [
    'Упорядочить чувства и понятнее слышать себя',
    'Вернуть ощущение контроля и устойчивости',
    'Научиться экологично проживать эмоции',
    'Найти опору и ресурсы для движения дальше',
]

const sessionFlow = [
    {
        title: 'Запрос',
        description: 'Вы оставляете заявку и получаете подтверждение слота на почту',
    },
    {
        title: 'Подготовка',
        description: 'Присылаю ссылку на Zoom, короткий чек-лист и упражнения, если это нужно',
    },
    {
        title: 'Сессия 60 минут',
        description: 'Работаем в безопасном темпе: беседа + арт-практики и телесные техники',
    },
    {
        title: 'Поддержка',
        description: 'После встречи присылаю конспект и микро-практики для самостоятельной работы',
    },
]

const quickFacts = [
    {
        icon: Clock,
        label: 'Длительность',
        value: '60 минут',
    },
    {
        icon: Laptop,
        label: 'Формат',
        value: 'Zoom / офлайн студия',
    },
    {
        icon: Phone,
        label: 'Связь',
        value: '+7 (XXX) XXX-XX-XX',
    },
]

const contactChannels = [
    {
        icon: Mail,
        label: 'email@example.com',
        href: 'mailto:email@example.com',
    },
    {
        icon: Smartphone,
        label: '+7 (XXX) XXX-XX-XX',
        href: 'tel:+7XXXXXXXXXX',
    },
]

const toolkit = [
    {
        icon: Palette,
        label: 'Арт-практики',
    },
    {
        icon: PenTool,
        label: 'Нарративные техники',
    },
    {
        icon: Heart,
        label: 'Соматические практики',
    },
    {
        icon: Waves,
        label: 'Дыхательные методики',
    },
]

export function InfoPanel() {
    return (
        <div className="space-y-6">
            <Card className="info-panel">
                <CardContent className="space-y-4 p-6 text-gray-900">
                    <div className="flex items-center gap-3 text-primary-700 font-semibold">
                        <Sparkles className="h-5 w-5" />
                        Поддержка без оценок и спешки
                    </div>
                    <p className="text-2xl font-semibold leading-tight">
                        Помогаю прожить сложные состояния и сформировать новые привычки заботы о себе.
                    </p>
                    <p className="text-sm text-gray-600">
                        Работаю в подходах арт-терапии, КПТ и майндфулнес. Каждая встреча закрывает конкретный запрос и
                        оставляет понятный план действий.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" asChild>
                            <Link href="/login">У меня уже есть аккаунт</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/register">Создать новый профиль</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
                {quickFacts.map(({ icon: Icon, label, value }) => (
                    <Card key={label} className="glass-card">
                        <CardContent className="flex flex-col gap-1 p-4">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                                <Icon className="h-4 w-4 text-primary-500" />
                                {label}
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary-500" />
                        На что опираемся
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        {focusAreas.map((item) => (
                            <p key={item} className="flex items-start gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                {item}
                            </p>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {toolkit.map(({ icon: Icon, label }) => (
                            <span key={label} className="badge-pill text-sm text-primary-700 bg-primary-50">
                                <Icon className="h-4 w-4" />
                                {label}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-primary-500" />
                        Результат каждой встречи
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3">
                    {goals.map((item) => (
                        <p key={item} className="flex items-start gap-2 text-sm text-gray-700">
                            <Heart className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                            {item}
                        </p>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-primary-500" />
                        Как всё устроено
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {sessionFlow.map((item) => (
                        <div key={item.title} className="timeline-card">
                            <div className="text-sm font-semibold text-primary-600">{item.title}</div>
                            <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-primary-500" />
                        Связаться напрямую
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {contactChannels.map(({ icon: Icon, label, href }) => (
                        <Link key={label} href={href} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3 hover:bg-primary-50">
                            <Icon className="w-5 h-5 text-primary-500" />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

