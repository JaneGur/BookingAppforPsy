-- Supabase schema for booking-system

create extension if not exists pgcrypto;

create table if not exists public.settings (
  id bigint generated always as identity primary key,
  work_start time not null default '09:00',
  work_end time not null default '18:00',
  session_duration integer not null default 60,
  format text not null default 'Онлайн',
  info_contacts jsonb not null default '{}'::jsonb,
  info_additional text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

insert into public.settings (id) values (1)
on conflict (id) do nothing;

create table if not exists public.documents (
  id bigint generated always as identity primary key,
  doc_type text not null check (doc_type in ('offer', 'policy')),
  title text not null,
  url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create unique index if not exists documents_active_unique
  on public.documents (doc_type)
  where is_active;

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  sku text,
  description text,
  price_rub integer not null check (price_rub >= 0),
  is_active boolean not null default true,
  is_package boolean not null default false,
  sessions_count integer,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  -- Скидки и акции
  discount_percent integer check (discount_percent >= 0 and discount_percent <= 100),
  has_special_categories_discount boolean not null default false,
  bulk_discount_threshold integer check (bulk_discount_threshold > 0),
  bulk_discount_percent integer check (bulk_discount_percent >= 0 and bulk_discount_percent <= 100),
  promo_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists products_active_sort_idx
  on public.products (is_active, sort_order);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  phone_hash text not null unique,
  name text not null,
  email text unique,
  telegram text,
  telegram_chat_id text,
  password text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  client_email text,
  client_telegram text,
  telegram_chat_id text,
  phone_hash text not null,
  booking_date date not null,
  booking_time time not null,
  notes text,
  status text not null check (status in ('pending_payment', 'confirmed', 'completed', 'cancelled')),
  product_id bigint not null references public.products(id),
  product_description text,
  amount integer not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists bookings_phone_idx
  on public.bookings (client_phone);

create index if not exists bookings_phone_status_idx
  on public.bookings (client_phone, status);

create unique index if not exists bookings_unique_slot_idx
  on public.bookings (booking_date, booking_time)
  where status <> 'cancelled';

create table if not exists public.blocked_slots (
  id bigint generated always as identity primary key,
  slot_date date not null,
  slot_time time not null,
  reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists blocked_slots_unique_idx
  on public.blocked_slots (slot_date, slot_time);

-- Minimal therapist table used by client dashboard
create table if not exists public.therapists (
  id bigint generated always as identity primary key,
  name text not null,
  email text,
  phone text,
  image_url text,
  created_at timestamptz not null default now()
);

insert into public.therapists (id, name, email, phone, image_url)
values (1, 'Анна', 'email@example.com', '+7XXXXXXXXXX', '')
on conflict (id) do nothing;
