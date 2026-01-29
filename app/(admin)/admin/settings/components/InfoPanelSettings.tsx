'use client'

import { useState, useEffect } from 'react'
import { FileText, Save, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface InfoPanelSettingsProps {
    infoAdditional: string
    onInfoAdditionalChange: (value: string) => void
    onSave: () => Promise<void>
    isSaving: boolean
}

export default function InfoPanelSettings({
                                              infoAdditional,
                                              onInfoAdditionalChange,
                                              onSave,
                                              isSaving
                                          }: InfoPanelSettingsProps) {
    const [localInfo, setLocalInfo] = useState(infoAdditional)

    useEffect(() => {
        setLocalInfo(infoAdditional)
    }, [infoAdditional])

    const handleSave = async () => {
        onInfoAdditionalChange(localInfo)
        await onSave()
    }

    return (
        <Card className="booking-card border-2">
            <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg md:text-xl font-bold break-words">
                            Информационная панель
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 font-normal mt-0.5 sm:mt-1">
                            Информация для клиентов на главной странице
                        </p>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <div>
                    <label className="text-sm font-semibold text-gray-800 mb-2 block flex items-center gap-2">
                        <Info className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span>Дополнительная информация</span>
                    </label>
                    <textarea
                        value={localInfo}
                        onChange={(e) => setLocalInfo(e.target.value)}
                        placeholder="Правила записи, контактная информация, особые условия..."
                        maxLength={4000}
                        className="flex min-h-[150px] sm:min-h-[180px] md:min-h-[200px] w-full rounded-xl border-2 border-purple-200 bg-white px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/20 focus-visible:border-purple-400 resize-none shadow-sm"
                    />
                    <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
                        <span>Макс. 4000 символов</span>
                        <span className="font-medium">{localInfo.length} / 4000</span>
                    </div>
                </div>

                {localInfo && (
                    <div className="booking-card border-2 bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-5">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Предпросмотр:</h3>
                        <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-purple-200 whitespace-pre-wrap text-xs sm:text-sm text-gray-700 break-words leading-relaxed">
                            {localInfo}
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="shadow-xl h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                >
                    <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {isSaving ? 'Сохранение...' : 'Сохранить информацию'}
                </Button>
            </CardContent>
        </Card>
    )
}