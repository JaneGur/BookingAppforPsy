import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const docType = formData.get('doc_type') as 'offer' | 'policy'
        const title = formData.get('title') as string

        if (!file) {
            return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 })
        }

        if (!docType || !title) {
            return NextResponse.json({ error: 'Тип документа и название обязательны' }, { status: 400 })
        }

        // Валидация типа файла
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Неподдерживаемый формат файла. Разрешены: PDF, DOC, DOCX' },
                { status: 400 }
            )
        }

        // Валидация размера (макс 10 МБ)
        const maxSize = 10 * 1024 * 1024 // 10 MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Файл слишком большой. Максимальный размер: 10 МБ' },
                { status: 400 }
            )
        }

        const supabase = createServiceRoleSupabaseClient()

        // Генерируем уникальное имя файла
        const timestamp = Date.now()
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${docType}_${timestamp}_${sanitizedFileName}`

        // Загружаем файл в Supabase Storage
        const fileBuffer = await file.arrayBuffer()
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(fileName, fileBuffer, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) {
            console.error('Supabase Storage error:', uploadError)
            return NextResponse.json(
                { error: `Ошибка загрузки файла: ${uploadError.message}` },
                { status: 500 }
            )
        }

        // Получаем публичный URL
        const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(uploadData.path)

        if (!urlData.publicUrl) {
            return NextResponse.json(
                { error: 'Не удалось получить URL файла' },
                { status: 500 }
            )
        }

        // Деактивируем старый документ этого типа
        await supabase
            .from('documents')
            .update({ is_active: false })
            .eq('doc_type', docType)
            .eq('is_active', true)

        // Добавляем запись в базу данных
        const { data: docData, error: dbError } = await supabase
            .from('documents')
            .insert({
                doc_type: docType,
                title: title,
                url: urlData.publicUrl,
                is_active: true,
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database error:', dbError)
            // Удаляем загруженный файл, если не удалось сохранить в БД
            await supabase.storage.from('documents').remove([uploadData.path])
            return NextResponse.json(
                { error: `Ошибка сохранения в БД: ${dbError.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            document: docData,
            message: 'Документ успешно загружен',
        })
    } catch (error) {
        console.error('Error uploading document:', error)
        return NextResponse.json(
            { error: 'Не удалось загрузить документ' },
            { status: 500 }
        )
    }
}
