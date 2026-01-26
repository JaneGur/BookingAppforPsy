-- Базовая схема для системы записи
-- Выполните этот скрипт в Supabase SQL Editor

-- 1. Настройки системы (время работы, длительность сессий)
CREATE TABLE IF NOT EXISTS public.settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  work_start time NOT NULL DEFAULT '09:00',
  work_end time NOT NULL DEFAULT '18:00',
  session_duration integer NOT NULL DEFAULT 60,
  format text NOT NULL DEFAULT 'Онлайн',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Добавляем начальные настройки
INSERT INTO public.settings (work_start, work_end, session_duration)
VALUES ('09:00', '18:00', 60);

-- 2. Продукты/Тарифы (то что админ создает)
CREATE TABLE IF NOT EXISTS public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  description text,
  price_rub integer NOT NULL CHECK (price_rub >= 0),
  is_active boolean NOT NULL DEFAULT true,
  is_package boolean NOT NULL DEFAULT false,
  sessions_count integer DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_active_sort_idx ON public.products (is_active, sort_order);

-- Добавим тестовые продукты
INSERT INTO public.products (name, description, price_rub, is_active, is_package, sessions_count, sort_order)
VALUES 
  ('Одна консультация', 'Разовая консультация 60 минут', 3000, true, false, 1, 1),
  ('Пакет 5 консультаций', '5 сессий со скидкой', 13500, true, true, 5, 2),
  ('Пакет 10 консультаций', '10 сессий с максимальной скидкой', 24000, true, true, 10, 3);

-- 3. Клиенты
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  telegram text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Записи/Бронирования
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'completed', 'cancelled')),
  product_id bigint NOT NULL REFERENCES public.products(id),
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Уникальный слот (нельзя дважды забронировать одно время)
CREATE UNIQUE INDEX bookings_unique_slot_idx
  ON public.bookings (booking_date, booking_time)
  WHERE status <> 'cancelled';

CREATE INDEX bookings_phone_idx ON public.bookings (client_phone);
CREATE INDEX bookings_date_idx ON public.bookings (booking_date, booking_time);

-- 5. Заблокированные слоты (для выходных/отпусков)
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX blocked_slots_unique_idx
  ON public.blocked_slots (slot_date, slot_time);
