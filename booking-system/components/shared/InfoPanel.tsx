'use client'

import { Clock, Shield, Heart, Target, CheckCircle, MessageSquare, Zap, User, Lock, Mail, Smartphone, Phone, Laptop } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InfoPanel() {
    return (
        <div className="space-y-6">
            {/* Main Motto */}
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-primary-800 mb-2">
                        Справляемся с тревогой, выгоранием и кризисами
                    </h2>
                    <p className="text-primary-700">Твоя устойчивость — наша цель.</p>
                </CardContent>
            </Card>

            {/* Auth Buttons */}
            <div className="flex flex-col gap-3">
                <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Войти
                    </Button>
                </Link>
                <Link href="/register" className="w-full">
                    <Button className="w-full">
                        <Lock className="mr-2 h-4 w-4" />
                        Зарегистрироваться
                    </Button>
                </Link>
                <div className="text-center">
                    <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                        Забыли пароль?
                    </Link>
                </div>
            </div>

            {/* Tasks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="w-5 h-5 text-primary-500" />
                        Задачи моей арт-терапевтической работы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Гарантировать полную конфиденциальность и отсутствие оценок</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Создать безопасное и поддерживающее пространство</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Помочь разобраться в клубке чувств, мыслей и переживаний</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Показать, что для эффективности не нужно уметь рисовать</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Вернуть ощущение контроля над своей жизнью</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Научить доступным и работающим способам самопомощи</span>
                    </p>
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-primary-500" />
                        Контакты
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary-500" />
                        <span className="text-sm">email@example.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-primary-500" />
                        <span className="text-sm">+7 (XXX) XXX-XX-XX</span>
                    </div>
                </CardContent>
            </Card>
            {/* Goals */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-primary-500" />
                        Цели работы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Понять, что происходит — упорядочить хаос чувств и назвать переживания</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Дать опору — вернуть ощущение устойчивости и внутренней опоры</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Научить справляться с эмоциональными состояниями (гнев, страх, тоска, обида)</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Восстановить силы — преодолеть апатию и выгорание</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Улучшить отношения — научиться ставить границы</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Помочь найти себя — понять свои истинные желания</span>
                    </p>
                </CardContent>
            </Card>

            {/* Principles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="w-5 h-5 text-primary-500" />
                        Принципы работы
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Безопасность — никакого осуждения, критики и непрошенных советов</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Доступность — не нужны художественные навыки</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Комфорт — выбор онлайн или офлайн формата</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Проводник, а не гуру — помогаю находить свои ответы</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Конфиденциальность — всё обсуждаемое остаётся между нами</span>
                    </p>
                    <p className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary-500" />
                        <span>Принятие — любые чувства имеют место и значимость</span>
                    </p>
                </CardContent>
            </Card>

            {/* Consultation Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-primary-500" />
                        О консультации
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-primary-600">3,000 ₽</div>
                </CardContent>
            </Card>

            {/* Контакты */}
            <Card className="info-panel">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Phone className="w-5 h-5 text-primary-500" />
                        Контакты
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Длительность</div>
                            <div className="text-sm text-gray-600">60 минут</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Формат</div>
                            <div className="text-sm text-gray-600">Онлайн или офлайн</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

