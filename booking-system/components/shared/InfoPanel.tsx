'use client'

import { Clock, Timer, Laptop, CreditCard, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function InfoPanel() {
    return (
        <div className="space-y-6">
            {/* Кнопки входа и регистрации */}
            <div className="flex gap-3">
                <Link href="/login" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        Войти
                    </Button>
                </Link>
                <Link href="/register" className="flex-1">
                    <Button variant="secondary" className="w-full">
                        Регистрация
                    </Button>
                </Link>
            </div>

            {/* Информация о консультациях */}
            <Card className="info-panel">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="w-5 h-5 rounded-full bg-primary-400/20 flex items-center justify-center">
                            <span className="text-primary-600 text-xs">i</span>
                        </div>
                        Информация о консультациях
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Рабочее время</div>
                            <div className="text-sm text-gray-600">09:00-18:00</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Timer className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Длительность</div>
                            <div className="text-sm text-gray-600">60 минут</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-primary-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-700">Формат</div>
                            <div className="text-sm text-gray-600">Онлайн</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Цена консультации */}
            <Card className="info-panel">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="w-5 h-5 text-primary-500" />
                        Консультация
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
                    <div className="text-sm text-gray-600 space-y-2">
                        <div>Телефон: <a href="tel:+79999999999" className="text-primary-600 hover:underline">+7 (999) 999-99-99</a></div>
                        <div>Email: <a href="mailto:info@example.com" className="text-primary-600 hover:underline">info@example.com</a></div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

