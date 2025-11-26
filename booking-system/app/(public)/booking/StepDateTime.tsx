'use client'

import { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { nextStep, updateFormData } from '../../../store/slices/bookingSlice'
import { useGetAvailableSlotsQuery } from '../../../store/api/slotsApi'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

export function StepDateTime() {
    const dispatch = useAppDispatch()
    const formData = useAppSelector((state) => state.booking.formData)

    const [dateInput, setDateInput] = useState<string>(
        formData.date ? format(new Date(formData.date), 'dd.MM.yyyy') : ''
    )

    const selectedDate = dateInput
        ? (() => {
              try {
                  const parsed = parse(dateInput, 'dd.MM.yyyy', new Date())
                  return isValid(parsed) ? parsed : undefined
              } catch {
                  return undefined
              }
          })()
        : undefined

    const dateForQuery = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''

    const { data: availableSlots, isLoading } = useGetAvailableSlotsQuery(dateForQuery, {
        skip: !selectedDate || !dateForQuery,
    })

    const [selectedTime, setSelectedTime] = useState<string | undefined>(formData.time)

    const handleNext = () => {
        if (selectedDate && selectedTime) {
            dispatch(
                updateFormData({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    time: selectedTime,
                })
            )
            dispatch(nextStep())
        }
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setDateInput(value)
        setSelectedTime(undefined) // Сбрасываем выбранное время при смене даты
    }

    // Получаем минимальную и максимальную даты
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 30)

    return (
        <Card className="booking-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-500" />
                    Шаг 1: Выберите дату и время
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-sm text-gray-600 mb-4">
                    Всё время - по Москве (МСК)
                </div>

                {/* Поле для ввода даты */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Дата консультации
                    </label>
                    <Input
                        type="text"
                        placeholder="дд.мм.гггг"
                        value={dateInput}
                        onChange={handleDateChange}
                        pattern="\d{2}\.\d{2}\.\d{4}"
                        maxLength={10}
                    />
                    {dateInput && !selectedDate && (
                        <p className="text-sm text-red-500 mt-1">
                            Введите дату в формате дд.мм.гггг
                        </p>
                    )}
                </div>

                {/* Временные слоты */}
                {selectedDate && (
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Доступные временные слоты
                        </label>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Загрузка слотов...
                            </div>
                        ) : availableSlots && availableSlots.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-3">
                                    Доступно {availableSlots.length} слотов на{' '}
                                    {format(selectedDate, 'dd.MM.yyyy')}
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {availableSlots.map((slot) => (
                                        <Button
                                            key={slot}
                                            variant={selectedTime === slot ? 'default' : 'secondary'}
                                            onClick={() => setSelectedTime(slot)}
                                            className="w-full"
                                        >
                                            {slot}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center py-8 text-gray-500">
                                На выбранную дату нет свободных слотов
                            </p>
                        )}
                    </div>
                )}

                {/* Кнопка далее */}
                <div className="flex justify-end pt-4 border-t">
                    <Button
                        onClick={handleNext}
                        disabled={!selectedDate || !selectedTime}
                        size="lg"
                    >
                        Далее
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}