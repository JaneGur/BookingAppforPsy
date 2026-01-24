-- Настройка Row Level Security (RLS)
-- Выполните после создания таблиц

-- ВАРИАНТ 1: Отключить RLS (для разработки/тестирования)
-- Быстрый способ, все таблицы доступны для чтения/записи
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_slots DISABLE ROW LEVEL SECURITY;

-- ВАРИАНТ 2: Настроить политики (для продакшена, закомментировано)
-- Раскомментируйте когда будете готовы к продакшену

-- Включаем RLS
-- ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.blocked_slots ENABLE ROW LEVEL SECURITY;

-- Политики для публичного доступа
-- CREATE POLICY "Allow public read settings" 
--   ON public.settings FOR SELECT 
--   USING (true);

-- CREATE POLICY "Allow public read active products" 
--   ON public.products FOR SELECT 
--   USING (is_active = true);

-- CREATE POLICY "Allow public insert clients" 
--   ON public.clients FOR INSERT 
--   WITH CHECK (true);

-- CREATE POLICY "Allow public insert bookings" 
--   ON public.bookings FOR INSERT 
--   WITH CHECK (true);

-- CREATE POLICY "Allow users read own bookings" 
--   ON public.bookings FOR SELECT 
--   USING (client_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- CREATE POLICY "Allow public read blocked slots" 
--   ON public.blocked_slots FOR SELECT 
--   USING (true);
