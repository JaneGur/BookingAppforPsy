-- Добавляем все поля для скидок и акций в таблицу products

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS updated_at timestamptz,
ADD COLUMN IF NOT EXISTS discount_percent integer CHECK (discount_percent >= 0 AND discount_percent <= 100),
ADD COLUMN IF NOT EXISTS has_special_categories_discount boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_discount_threshold integer CHECK (bulk_discount_threshold > 0),
ADD COLUMN IF NOT EXISTS bulk_discount_percent integer CHECK (bulk_discount_percent >= 0 AND bulk_discount_percent <= 100),
ADD COLUMN IF NOT EXISTS promo_text text;

-- Комментарии для документации
COMMENT ON COLUMN public.products.discount_percent IS 'Базовая процентная скидка на продукт';
COMMENT ON COLUMN public.products.has_special_categories_discount IS 'Наличие скидок для льготных категорий';
COMMENT ON COLUMN public.products.bulk_discount_threshold IS 'Минимальное количество сессий для массовой скидки';
COMMENT ON COLUMN public.products.bulk_discount_percent IS 'Процент скидки при единовременной оплате';
COMMENT ON COLUMN public.products.promo_text IS 'Текст рекламной акции';
