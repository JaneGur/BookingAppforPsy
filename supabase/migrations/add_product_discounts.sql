-- Миграция: Добавление полей для скидок и акций в таблицу products
-- Дата: 2024-01-12

-- Добавляем новые поля для скидок
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percent integer check (discount_percent >= 0 and discount_percent <= 100),
ADD COLUMN IF NOT EXISTS has_special_categories_discount boolean not null default false,
ADD COLUMN IF NOT EXISTS bulk_discount_threshold integer check (bulk_discount_threshold > 0),
ADD COLUMN IF NOT EXISTS bulk_discount_percent integer check (bulk_discount_percent >= 0 and bulk_discount_percent <= 100),
ADD COLUMN IF NOT EXISTS promo_text text;

-- Комментарии для документации
COMMENT ON COLUMN public.products.discount_percent IS 'Базовая процентная скидка на продукт';
COMMENT ON COLUMN public.products.has_special_categories_discount IS 'Наличие скидок для льготных категорий (инвалиды, многодетные, пенсионеры, участники СВО)';
COMMENT ON COLUMN public.products.bulk_discount_threshold IS 'Минимальное количество сессий для массовой скидки';
COMMENT ON COLUMN public.products.bulk_discount_percent IS 'Процент скидки при единовременной оплате от bulk_discount_threshold сессий';
COMMENT ON COLUMN public.products.promo_text IS 'Текст рекламной акции для отображения на карточке продукта';

-- Создаем индекс для быстрого поиска продуктов с активными акциями
CREATE INDEX IF NOT EXISTS products_with_discounts_idx 
ON public.products (is_active) 
WHERE discount_percent > 0 OR has_special_categories_discount = true OR bulk_discount_percent > 0;

-- Пример данных: создаем тестовые продукты со скидками
INSERT INTO public.products (
  name, 
  sku, 
  description, 
  price_rub, 
  is_active, 
  is_package, 
  sessions_count,
  sort_order,
  is_featured,
  discount_percent,
  has_special_categories_discount,
  bulk_discount_threshold,
  bulk_discount_percent,
  promo_text
) VALUES 
  (
    'Одна консультация',
    'SINGLE',
    'Разовая сессия арт-терапии длительностью 60 минут',
    5000,
    true,
    false,
    1,
    1,
    true,
    0,
    true,
    NULL,
    NULL,
    NULL
  ),
  (
    'Пакет 5 консультаций',
    'PACK_5',
    '5 сессий со скидкой. Экономия 2500₽',
    22500,
    true,
    true,
    5,
    2,
    false,
    10,
    true,
    NULL,
    NULL,
    'Скидка 10% на пакет!'
  ),
  (
    'Пакет 10 консультаций',
    'PACK_10',
    '10 сессий с максимальной скидкой. Экономия 10000₽',
    40000,
    true,
    true,
    10,
    3,
    false,
    20,
    true,
    10,
    10,
    'Лучшее предложение! Скидка 20%'
  )
ON CONFLICT DO NOTHING;
