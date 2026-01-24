-- Добавление недостающих полей в таблицу bookings

-- Добавляем phone_hash для безопасного хранения телефонов
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS phone_hash text;

-- Добавляем индекс для быстрого поиска по phone_hash
CREATE INDEX IF NOT EXISTS bookings_phone_hash_idx 
ON public.bookings (phone_hash);

-- Также добавим поле telegram_chat_id если нужно для уведомлений
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS telegram_chat_id text;

-- Обновим существующие записи (если они есть)
-- UPDATE public.bookings 
-- SET phone_hash = encode(sha256(client_phone::bytea), 'hex')
-- WHERE phone_hash IS NULL;
