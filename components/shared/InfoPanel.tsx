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
    LayoutDashboard,
} from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContactForm } from '@/components/shared/ContactForm'

// Задачи арт-терапевтической деятельности
const tasks = [
    'Создать безопасное пространство без оценок',
    'Помочь понять свои чувства и эмоции',
    'Освоить техники работы с тревогой и стрессом',
    'Найти внутренние ресурсы для изменений',
]

// Цели работы
const goals = [
    'Разобраться в хаосе чувств и понять, что с вами происходит',
    'Вернуть ощущение опоры и устойчивости',
    'Освоить техники проживания сильных эмоций',
    'Преодолеть апатию и выгорание',
    'Научиться выстраивать здоровые границы',
    'Понять свои истинные желания и потребности',
]

// Принципы работы
const principles = [
    'Безопасность. Нет места осуждению и критике',
    'Доступность. Не нужно уметь рисовать',
    'Конфиденциальность. Всё остаётся между нами',
    'Партнёрство. Я — проводник, а не гуру',
    'Комфортный темп. Без давления и спешки',
    'Принятие любых чувств без обесценивания',
]

const sessionFlow = [
    {
        title: 'Запрос',
        description: 'Вы оставляете заявку и получаете подтверждение слота в Telegram',
    },
    {
        title: 'Подготовка',
        description: 'Присылаю ссылку на Яндекс.Телемост, короткий чек-лист и упражнения, если это нужно',
    },
    {
        title: 'Сессия 60 минут',
        description: 'Работаем в безопасном темпе: беседа + арт-практики и телесные техники',
    },
    // {
    //     title: 'Поддержка',
    //     description: 'После встречи присылаю конспект и микро-практики для самостоятельной работы',
    // },
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
    const { data: session } = useSession()
    const isAuthenticated = !!session?.user

    return (
        <div className="space-y-6">
            <Card className="info-panel">
                <CardContent className="space-y-4 p-6 text-gray-900">
                    <div className="flex items-center gap-3 text-primary-700 font-semibold">
                        <Sparkles className="h-5 w-5" />
                        Арт-терапия без оценок и спешки
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Безопасное пространство для работы с эмоциями. Не нужно уметь рисовать — я помогу найти ответы в комфортном темпе.
                    </p>
                    {isAuthenticated ? (
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" asChild>
                                <Link href="/dashboard">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Мой кабинет
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" size="sm" asChild>
                                <Link href="/login">У меня уже есть аккаунт</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/register">Создать новый профиль</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/*<div className="grid gap-4 sm:grid-cols-2">*/}
            {/*    {quickFacts.map(({ icon: Icon, label, value }) => (*/}
            {/*        <Card key={label} className="glass-card">*/}
            {/*            <CardContent className="flex flex-col gap-1 p-4">*/}
            {/*                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">*/}
            {/*                    <Icon className="h-4 w-4 text-primary-500" />*/}
            {/*                    {label}*/}
            {/*                </div>*/}
            {/*                <p className="text-lg font-semibold text-gray-900">{value}</p>*/}
            {/*            </CardContent>*/}
            {/*        </Card>*/}
            {/*    ))}*/}
            {/*</div>*/}

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="info-grid-card h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="w-5 h-5 text-primary-500" />
                            Задачи моей работы
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid gap-2">
                            {tasks.map((item, index) => (
                                <p key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                    <span>{item}</span>
                                </p>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="info-grid-card h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="w-5 h-5 text-primary-500" />
                            Цели нашей работы
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {goals.map((item, index) => (
                            <p key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                <Heart className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                <span>{item}</span>
                            </p>
                        ))}
                    </CardContent>
                </Card>

                <Card className="info-grid-card h-full lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="w-5 h-5 text-primary-500" />
                            Принципы моей работы
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 md:grid-cols-2">
                        {principles.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
                                <p className="text-sm text-gray-700">{item}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="info-grid-card h-full lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="w-5 h-5 text-primary-500" />
                            Как всё устроено
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {sessionFlow.map((item) => (
                            <div key={item.title} className="timeline-card">
                                <div className="text-sm font-semibold text-primary-600">{item.title}</div>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/*<Card className="info-grid-card h-full">*/}
                {/*    <CardHeader>*/}
                {/*        <CardTitle className="flex items-center gap-2 text-lg">*/}
                {/*            <MessageSquare className="w-5 h-5 text-primary-500" />*/}
                {/*            Связаться напрямую*/}
                {/*        </CardTitle>*/}
                {/*    </CardHeader>*/}
                {/*    <CardContent className="space-y-4">*/}
                {/*        {contactChannels.map(({ icon: Icon, label, href }) => (*/}
                {/*            <Link*/}
                {/*                key={label}*/}
                {/*                href={href}*/}
                {/*                className="flex items-center gap-3 rounded-xl border border-primary-200/30 bg-white/60 p-3 transition hover:translate-x-1 hover:bg-white hover:shadow-sm"*/}
                {/*            >*/}
                {/*                <Icon className="w-5 h-5 text-primary-500" />*/}
                {/*                <span className="text-sm font-medium text-gray-700">{label}</span>*/}
                {/*            </Link>*/}
                {/*        ))}*/}
                {/*    </CardContent>*/}
                {/*</Card>*/}
            </div>

            {/* Форма обратной связи */}
            <ContactForm showCard showInlineSuccess />
        </div>
    )
}

