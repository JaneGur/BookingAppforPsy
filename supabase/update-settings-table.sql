-- Добавляем недостающие поля в таблицу settings

-- Добавляем поле для дополнительной информации
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS info_additional text;

-- Добавляем поле updated_at
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Обновляем значение по умолчанию
UPDATE public.settings 
SET info_additional = '' 
WHERE info_additional IS NULL;

-- Создаем или обновляем триггер для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Выводим текущую структуру
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'settings'
ORDER BY ordinal_position;
