-- Добавляем колонку updated_at для продуктов и других таблиц

-- Для products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Для clients (если ещё не добавлено)
-- ALTER TABLE public.clients 
-- ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Для bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS updated_at timestamptz;
