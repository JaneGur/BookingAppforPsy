alter table public.bookings
  add column if not exists product_description text;
