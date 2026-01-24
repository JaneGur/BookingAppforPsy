-- Исправление недостающих таблиц и полей

-- 1. Создаем таблицу documents (для оферты и политики)
CREATE TABLE IF NOT EXISTS public.documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doc_type text NOT NULL CHECK (doc_type IN ('offer', 'policy')),
  title text NOT NULL,
  url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- Уникальный активный документ каждого типа
CREATE UNIQUE INDEX IF NOT EXISTS documents_active_unique
  ON public.documents (doc_type)
  WHERE is_active;

-- 2. Добавляем недостающее поле client_telegram в bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS client_telegram text;

-- 3. Отключаем RLS для documents
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
