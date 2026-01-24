-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ
-- Выполните этот скрипт после удаления всех таблиц

-- 1. Настройки системы
CREATE TABLE IF NOT EXISTS public.settings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  work_start time NOT NULL DEFAULT '09:00',
  work_end time NOT NULL DEFAULT '18:00',
  session_duration integer NOT NULL DEFAULT 60,
  format text NOT NULL DEFAULT 'Онлайн',
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.settings (work_start, work_end, session_duration)
VALUES ('09:00', '18:00', 60);

-- 2. Продукты/Тарифы
CREATE TABLE IF NOT EXISTS public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  sku text,
  description text,
  price_rub integer NOT NULL CHECK (price_rub >= 0),
  is_active boolean NOT NULL DEFAULT true,
  is_package boolean NOT NULL DEFAULT false,
  sessions_count integer DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
  has_special_categories_discount boolean NOT NULL DEFAULT false,
  bulk_discount_threshold integer CHECK (bulk_discount_threshold > 0),
  bulk_discount_percent integer CHECK (bulk_discount_percent >= 0 AND bulk_discount_percent <= 100),
  promo_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX products_active_sort_idx ON public.products (is_active, sort_order);

INSERT INTO public.products (name, description, price_rub, is_active, is_package, sessions_count, sort_order)
VALUES 
  ('Одна консультация', 'Разовая сессия 60 минут', 3000, true, false, 1, 1),
  ('Пакет 5 консультаций', '5 сессий со скидкой', 13500, true, true, 5, 2),
  ('Пакет 10 консультаций', '10 сессий с максимальной скидкой', 24000, true, true, 10, 3);

-- 3. Клиенты (с паролем и ролью)
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  phone_hash text NOT NULL UNIQUE,
  name text NOT NULL,
  email text,
  telegram text,
  telegram_chat_id text,
  password text,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE INDEX clients_phone_hash_idx ON public.clients (phone_hash);

-- 4. Записи/Бронирования
CREATE TABLE IF NOT EXISTS public.bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_email text,
  client_telegram text,
  telegram_chat_id text,
  phone_hash text,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'completed', 'cancelled')),
  product_id bigint NOT NULL REFERENCES public.products(id),
  amount integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX bookings_unique_slot_idx
  ON public.bookings (booking_date, booking_time)
  WHERE status <> 'cancelled';

CREATE INDEX bookings_phone_idx ON public.bookings (client_phone);
CREATE INDEX bookings_phone_hash_idx ON public.bookings (phone_hash);
CREATE INDEX bookings_date_idx ON public.bookings (booking_date, booking_time);

-- 5. Заблокированные слоты
CREATE TABLE IF NOT EXISTS public.blocked_slots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX blocked_slots_unique_idx
  ON public.blocked_slots (slot_date, slot_time);

-- 6. Документы (оферта, политика)
CREATE TABLE IF NOT EXISTS public.documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  doc_type text NOT NULL CHECK (doc_type IN ('offer', 'policy')),
  title text NOT NULL,
  url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

CREATE UNIQUE INDEX documents_active_unique
  ON public.documents (doc_type)
  WHERE is_active;

-- Отключаем RLS для всех таблиц (для разработки)
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents DISABLE ROW LEVEL SECURITY;
