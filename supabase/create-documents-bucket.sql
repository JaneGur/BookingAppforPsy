-- Создание bucket для хранения документов

-- 1. Создаем bucket (если еще не создан)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Настраиваем политики доступа

-- Разрешаем всем читать файлы (public bucket)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Разрешаем админам загружать файлы
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
);

-- Разрешаем админам удалять файлы
CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
);

-- 3. Проверяем, что bucket создан
SELECT * FROM storage.buckets WHERE id = 'documents';
