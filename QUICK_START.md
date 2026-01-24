# 🚀 Быстрый старт

## 1️⃣ Применить миграцию БД (ОБЯЗАТЕЛЬНО!)

Откройте **Supabase SQL Editor** и выполните:

```sql
-- Добавляем поля для скидок
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percent integer check (discount_percent >= 0 and discount_percent <= 100),
ADD COLUMN IF NOT EXISTS has_special_categories_discount boolean not null default false,
ADD COLUMN IF NOT EXISTS bulk_discount_threshold integer check (bulk_discount_threshold > 0),
ADD COLUMN IF NOT EXISTS bulk_discount_percent integer check (bulk_discount_percent >= 0 and bulk_discount_percent <= 100),
ADD COLUMN IF NOT EXISTS promo_text text;

-- Создаем тестовые продукты
INSERT INTO public.products (
  name, sku, description, price_rub, is_active, is_package, sessions_count,
  sort_order, is_featured, discount_percent, has_special_categories_discount
) VALUES 
  ('Одна консультация', 'SINGLE', 'Разовая сессия 60 минут', 5000, true, false, 1, 1, true, 0, true),
  ('Пакет 5 консультаций', 'PACK_5', '5 сессий со скидкой', 22500, true, true, 5, 2, false, 10, true),
  ('Пакет 10 консультаций', 'PACK_10', '10 сессий с максимальной скидкой', 40000, true, true, 10, 3, false, 20, true)
ON CONFLICT DO NOTHING;
```

## 2️⃣ Создать админа (если еще нет)

```sql
-- Вариант 1: Изменить существующего пользователя
UPDATE public.clients 
SET role = 'admin' 
WHERE phone = '+ВАШ_ТЕЛЕФОН';

-- Вариант 2: Создать нового админа
-- Сначала сгенерируйте хеш пароля:
-- node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"

INSERT INTO public.clients (phone, phone_hash, name, email, password, role)
VALUES (
  '+79999999999',
  encode(digest('+79999999999', 'sha256'), 'hex'),
  'Администратор',
  'admin@example.com',
  'ВАШ_BCRYPT_ХЕШ',
  'admin'
);
```

## 3️⃣ Перезапустить сервер

```bash
npm run dev
```

## 4️⃣ Войти как админ

1. Откройте: http://localhost:3000/login
2. Введите телефон/email и пароль админа
3. Перейдите в админ-панель

## 5️⃣ Готово! 🎉

Теперь доступно:
- **Клиенты**: http://localhost:3000/admin/clients
- **Продукты**: http://localhost:3000/admin/products
- **Дашборд**: http://localhost:3000/admin/dashboard

---

## 🆘 Если что-то не работает:

### Страница 404:
- ✅ Убедитесь что сервер перезапущен
- ✅ Проверьте URL: `/admin/clients` (не `/clients`)

### 401 Unauthorized:
- ✅ Вы залогинены?
- ✅ Вы залогинены как **админ**? (проверьте в БД: `role = 'admin'`)

### Пустая страница:
- ✅ Проверьте консоль браузера (F12)
- ✅ Есть ли клиенты в БД?
- ✅ Примените миграцию для продуктов

### База пуста:
- ✅ Зарегистрируйте тестового клиента
- ✅ Создайте тестовые продукты (SQL выше)
