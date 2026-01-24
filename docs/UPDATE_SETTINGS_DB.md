# 🔧 Обновление базы данных для настроек

## Шаг 1: Добавление поля `info_additional`

Если вы обновляете существующую базу, выполните этот SQL-скрипт в Supabase SQL Editor:

```sql
-- Добавляем поле для дополнительной информации
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS info_additional text;

-- Обновляем значение по умолчанию
UPDATE public.settings 
SET info_additional = '' 
WHERE info_additional IS NULL;
```

## Шаг 2: Добавление триггера `updated_at`

```sql
-- Создаем функцию для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Удаляем старый триггер (если есть)
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

-- Создаем новый триггер
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## Шаг 3: Проверка структуры

```sql
-- Проверяем, что все поля на месте
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'settings'
ORDER BY ordinal_position;
```

**Ожидаемый результат:**
| column_name | data_type | is_nullable |
|-------------|-----------|-------------|
| id | bigint | NO |
| work_start | time without time zone | NO |
| work_end | time without time zone | NO |
| session_duration | integer | NO |
| format | text | NO |
| created_at | timestamp with time zone | NO |
| info_additional | text | YES |
| updated_at | timestamp with time zone | YES |

## Шаг 4: Быстрая проверка

```sql
-- Проверяем текущее содержимое таблицы settings
SELECT * FROM public.settings;

-- Если таблица пустая, добавляем начальную запись
INSERT INTO public.settings (work_start, work_end, session_duration, format, info_additional)
VALUES ('09:00', '18:00', 60, 'Онлайн', '')
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ Готово!

После выполнения всех шагов вкладка "Настройки" будет полностью функциональна.

Для полной переустановки БД используйте `supabase/complete-schema.sql`.
