# 🌿 Система бронирования для арт-терапевта

Современное веб-приложение для онлайн-записи на консультации с арт-терапевтом. Включает личные кабинеты клиентов и администратора, систему оплаты и уведомления в Telegram.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

---

## 📋 Содержание

- [Возможности](#-возможности)
- [Технологии](#-технологии)
- [Структура проекта](#-структура-проекта)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [Разработка](#-разработка)
- [API Endpoints](#-api-endpoints)
- [Архитектура](#-архитектура)
- [База данных](#-база-данных)
- [Деплой](#-деплой)

---

## ✨ Возможности

### Для клиентов:
- 📅 **Онлайн-запись** - интерактивный календарь с доступными слотами
- 👤 **Личный кабинет** - управление записями и профилем
- 💳 **Онлайн-оплата** - интеграция с платежными системами
- 🔔 **Telegram уведомления** - напоминания о записях
- 📱 **Адаптивный дизайн** - работает на всех устройствах
- ⏰ **Часовой пояс МСК** - все время указано по Москве
- 📝 **История сессий** - просмотр прошлых и будущих записей

### Для администратора:
- 📊 **Dashboard** - статистика и аналитика
- 👥 **Управление клиентами** - просмотр и редактирование
- 📅 **Календарь записей** - управление бронированиями
- 🚫 **Блокировка слотов** - закрытие дат и времени
- 💼 **Управление продуктами** - тарифы и пакеты сессий
- ⚙️ **Настройки** - рабочие часы, контакты, документы

---

## 🛠 Технологии

### Frontend:
- **Next.js 16** - React фреймворк с App Router
- **React 19** - UI библиотека с Server Components
- **TypeScript** - типизированный JavaScript
- **TailwindCSS** - utility-first CSS фреймворк
- **React Query** - управление серверным состоянием
- **Lucide React** - современные иконки

### Backend & Auth:
- **Next.js API Routes** - бэкенд на Node.js
- **NextAuth.js** - аутентификация
- **bcryptjs** - хеширование паролей
- **Supabase Client** - работа с БД

### База данных:
- **Supabase (PostgreSQL)** - реляционная БД
- **Row Level Security** - защита данных
- **Triggers & Functions** - бизнес-логика на уровне БД

### Инструменты:
- **date-fns** - работа с датами
- **ESLint** - линтер кода
- **PostCSS** - обработка CSS

---

## 📁 Структура проекта

```
booking-system/
│
├── app/                              # Next.js App Router
│   ├── (public)/                     # Публичные страницы
│   │   ├── page.tsx                  # Главная + форма записи
│   │   ├── booking/                  # Компоненты формы
│   │   │   ├── StepDateTime.tsx      # Выбор даты и времени
│   │   │   └── StepIndicator.tsx     # Индикатор шагов
│   │   └── layout.tsx                # Публичный layout
│   │
│   ├── (auth)/                       # Страницы аутентификации
│   │   ├── login/page.tsx            # Вход
│   │   └── register/page.tsx         # Регистрация
│   │
│   ├── (client)/                     # Личный кабинет клиента
│   │   ├── dashboard/page.tsx        # Дашборд клиента
│   │   ├── profile/page.tsx          # Профиль
│   │   ├── payment/[bookingId]/      # Страница оплаты
│   │   ├── ClientNav.tsx             # Навигация
│   │   └── layout.tsx                # Client layout
│   │
│   ├── (admin)/                      # Админ-панель
│   │   ├── admin/dashboard/          # Дашборд админа
│   │   ├── clients/                  # Управление клиентами
│   │   ├── products/                 # Управление продуктами
│   │   ├── blocking/                 # Блокировка слотов
│   │   ├── analytics/                # Аналитика
│   │   ├── settings/                 # Настройки
│   │   └── layout.tsx                # Admin layout
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/                     # Аутентификация
│   │   │   ├── [...nextauth]/        # NextAuth handler
│   │   │   ├── register/             # Регистрация
│   │   │   └── change-password/      # Смена пароля
│   │   ├── bookings/                 # Бронирования
│   │   │   ├── route.ts              # CRUD бронирований
│   │   │   ├── [id]/route.ts         # Операции с записью
│   │   │   ├── pending/              # Ожидающие оплаты
│   │   │   └── upcoming/             # Предстоящие
│   │   ├── slots/available/          # Доступные слоты
│   │   ├── products/                 # Продукты/тарифы
│   │   ├── clients/                  # Клиенты
│   │   ├── profile/                  # Профиль пользователя
│   │   ├── admin/                    # Админ API
│   │   └── telegram/                 # Telegram бот
│   │
│   ├── globals.css                   # Глобальные стили
│   ├── layout.tsx                    # Root layout
│   └── providers.tsx                 # React провайдеры
│
├── components/                       # React компоненты
│   ├── booking/                      # Компоненты бронирования
│   │   ├── StepUserData.tsx          # Шаг: данные пользователя
│   │   ├── StepConfirmation.tsx      # Шаг: подтверждение
│   │   └── StepAuth.tsx              # Шаг: авторизация
│   │
│   ├── client/                       # Клиентские компоненты
│   │   ├── ClientHeader.tsx          # Хедер клиента
│   │   ├── ClientDashboardTabs.tsx   # Табы дашборда
│   │   ├── ClientNewBookingForm.tsx  # Форма новой записи
│   │   └── BookingActions.tsx        # Действия с записью
│   │
│   ├── admin/                        # Админ компоненты
│   │   ├── AdminHeader.tsx           # Хедер админа
│   │   ├── AdminNav.tsx              # Навигация админа
│   │   ├── BookingsTab.tsx           # Таб записей
│   │   └── CreateBookingModal.tsx    # Модалка создания
│   │
│   ├── shared/                       # Общие компоненты
│   │   ├── Header.tsx                # Главный хедер
│   │   ├── Footer.tsx                # Футер
│   │   ├── InfoPanel.tsx             # Информационная панель
│   │   └── ContactForm.tsx           # Форма контактов
│   │
│   └── ui/                           # UI компоненты
│       ├── button.tsx                # Кнопка
│       ├── card.tsx                  # Карточка
│       └── input.tsx                 # Инпут
│
├── lib/                              # Утилиты и хелперы
│   ├── providers/                    # React провайдеры
│   │   └── QueryProvider.tsx         # React Query провайдер
│   │
│   ├── contexts/                     # React контексты
│   │   └── BookingContext.tsx        # Контекст формы бронирования
│   │
│   ├── hooks/                        # Custom hooks
│   │   ├── useBookings.ts            # Хуки для записей
│   │   ├── useSlots.ts               # Хуки для слотов
│   │   ├── useProducts.ts            # Хуки для продуктов
│   │   └── index.ts                  # Реэкспорт
│   │
│   ├── auth/                         # Аутентификация
│   │   └── user.ts                   # Работа с пользователями
│   │
│   ├── supabase/                     # Supabase клиенты
│   │   ├── client.ts                 # Клиентский клиент
│   │   ├── server.ts                 # Серверный клиент
│   │   └── middleware.ts             # Middleware клиент
│   │
│   ├── utils/                        # Утилиты
│   │   ├── cn.ts                     # className helper
│   │   ├── date.ts                   # Работа с датами
│   │   └── phone.ts                  # Работа с телефонами
│   │
│   └── db.ts                         # Database client
│
├── types/                            # TypeScript типы
│   ├── booking.ts                    # Типы бронирований
│   ├── client.ts                     # Типы клиентов
│   ├── product.ts                    # Типы продуктов
│   └── next-auth.d.ts                # Расширение NextAuth
│
├── supabase/                         # Supabase
│   └── schema.sql                    # SQL схема БД
│
├── public/                           # Статические файлы
│   ├── file.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env.local                        # Переменные окружения (не в git)
├── .gitignore                        # Git игнор
├── auth.ts                           # NextAuth конфигурация
├── middleware.ts                     # Next.js middleware
├── next.config.ts                    # Next.js конфиг
├── tailwind.config.ts                # Tailwind конфиг
├── tsconfig.json                     # TypeScript конфиг
├── package.json                      # Зависимости
└── README.md                         # Этот файл
```

---

## 🚀 Установка

### Предварительные требования:
- **Node.js** 18+ ([скачать](https://nodejs.org/))
- **npm** или **pnpm**
- **Supabase аккаунт** ([создать бесплатно](https://supabase.com/))

### Шаги установки:

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd booking-system/booking-system
```

2. **Установите зависимости:**
```bash
npm install
# или
pnpm install
```

3. **Создайте Supabase проект:**
   - Зайдите на [supabase.com](https://supabase.com/)
   - Создайте новый проект
   - Выполните SQL из файла `supabase/schema.sql` в SQL Editor

4. **Настройте переменные окружения:**
```bash
cp .env.example .env.local
```

Заполните `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Telegram Bot (опционально)
TELEGRAM_BOT_TOKEN=your-bot-token
```

5. **Создайте администратора:**
```sql
-- Выполните в Supabase SQL Editor
INSERT INTO public.clients (phone, phone_hash, name, email, password, role)
VALUES (
  '+79999999999',
  encode(digest('+79999999999', 'sha256'), 'hex'),
  'Администратор',
  'admin@example.com',
  '$2a$10$...',  -- хеш пароля (bcrypt)
  'admin'
);
```

Для генерации bcrypt хеша:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

6. **Запустите проект:**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Конфигурация

### Настройки рабочего времени:

Через админ-панель: `/admin/settings`

Или напрямую в БД:
```sql
UPDATE public.settings SET
  work_start = '09:00',
  work_end = '18:00',
  session_duration = 60,  -- минуты
  format = 'Онлайн'
WHERE id = 1;
```

### Загрузка документов:

1. Загрузите документы (оферта, политика) в Supabase Storage
2. Добавьте записи в таблицу `documents`:
```sql
INSERT INTO public.documents (doc_type, title, url, is_active)
VALUES 
  ('offer', 'Договор оферты', 'https://your-storage-url/offer.pdf', true),
  ('policy', 'Политика конфиденциальности', 'https://your-storage-url/policy.pdf', true);
```

### Продукты/тарифы:

Управление через админ-панель: `/admin/products`

---

## 💻 Разработка

### Команды:

```bash
# Разработка
npm run dev          # Запуск dev сервера (http://localhost:3000)

# Сборка
npm run build        # Production сборка
npm start            # Запуск production сервера

# Линтинг
npm run lint         # Проверка кода
```

### Структура данных:

**React Query Hooks:**
```tsx
import { useClientBookings, useCreateBooking } from '@/lib/hooks'

// В компоненте:
const { data: bookings, isLoading } = useClientBookings(phone)
const createBooking = useCreateBooking()

// Создание записи:
await createBooking.mutateAsync({
  booking_date: '2024-01-15',
  booking_time: '10:00',
  client_name: 'Иван',
  client_phone: '+79991234567',
  product_id: 1,
  status: 'pending_payment'
})
```

**Booking Context:**
```tsx
import { useBookingForm } from '@/lib/contexts/BookingContext'

// В компоненте формы:
const { step, formData, nextStep, updateFormData } = useBookingForm()

// Обновление данных:
updateFormData({ date: '2024-01-15', time: '10:00' })
nextStep()
```

---

## 📡 API Endpoints

### Публичные API:

```typescript
// Доступные слоты
GET /api/slots/available?date=2024-01-15
// Response: ["10:00", "11:00", "14:00"]

// Продукты
GET /api/products
GET /api/products/featured
// Response: Product[]

// Заблокированные дни
GET /api/blocked-days?month=2024-01
// Response: string[]  // ["2024-01-05", "2024-01-06"]

// Документы
GET /api/documents?doc_type=offer
// Response: { url: string, title: string }[]
```

### API для клиентов (требуется auth):

```typescript
// Мои записи
GET /api/bookings?phone=+79991234567
// Response: Booking[]

// Создать запись
POST /api/bookings
// Body: { booking_date, booking_time, client_name, client_phone, product_id, ... }
// Response: Booking

// Обновить/отменить запись
PATCH /api/bookings/[id]
// Body: { status: 'cancelled' }

// Предстоящая запись
GET /api/bookings/upcoming?phone=+79991234567
// Response: Booking | null

// Ожидающая оплаты
GET /api/bookings/pending?phone=+79991234567
// Response: Booking | null

// Профиль
GET /api/profile
PUT /api/profile
// Body: { name, email, telegram }
```

### API для админа (требуется role: admin):

```typescript
// Все записи
GET /api/admin/bookings?status=confirmed&date=2024-01-15

// Клиенты
GET /api/admin/clients
GET /api/admin/clients/[id]

// Продукты
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products
DELETE /api/admin/products

// Блокировка слотов
GET /api/admin/blocked-slots
POST /api/admin/blocked-slots
DELETE /api/admin/blocked-slots/[id]

// Аналитика
GET /api/admin/analytics
GET /api/admin/analytics/overview

// Настройки
GET /api/admin/settings
PUT /api/admin/settings
POST /api/admin/settings/password
```

---

## 🏗 Архитектура

### Уровни приложения:

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (Pages, Components, UI, Forms)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Application Layer              │
│  (Hooks, Contexts, Business Logic)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            API Layer                    │
│  (Next.js API Routes, Auth)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Data Layer                    │
│  (Supabase Client, PostgreSQL)          │
└─────────────────────────────────────────┘
```

### Паттерны:

- **Server Components** для статических страниц
- **Client Components** для интерактивности
- **React Query** для кеширования и синхронизации
- **Context API** для локального состояния форм
- **API Routes** как BFF (Backend for Frontend)
- **Row Level Security** на уровне БД

### Управление состоянием:

| Тип состояния | Решение | Пример |
|--------------|---------|--------|
| Серверные данные | React Query | Записи, продукты, клиенты |
| Форма бронирования | Context API | Шаги формы, временные данные |
| Аутентификация | NextAuth | Сессия пользователя |
| UI состояние | useState | Модалки, табы, загрузка |

---

## 🗄 База данных

### Основные таблицы:

**clients** - пользователи системы
```sql
id          uuid PRIMARY KEY
phone       text UNIQUE
phone_hash  text UNIQUE
name        text
email       text UNIQUE
telegram    text
password    text
role        text ('client' | 'admin')
created_at  timestamptz
```

**bookings** - записи на консультации
```sql
id              bigint PRIMARY KEY
client_id       uuid REFERENCES clients
client_name     text
client_phone    text
booking_date    date
booking_time    time
status          text
product_id      bigint REFERENCES products
amount          integer
paid_at         timestamptz
created_at      timestamptz
```

**products** - тарифы и услуги
```sql
id              bigint PRIMARY KEY
name            text
description     text
price_rub       integer
is_active       boolean
is_package      boolean
sessions_count  integer
is_featured     boolean
sort_order      integer
```

**blocked_slots** - заблокированные слоты
```sql
id          bigint PRIMARY KEY
slot_date   date
slot_time   time
reason      text
created_at  timestamptz
```

**settings** - настройки системы
```sql
id                 bigint PRIMARY KEY
work_start         time
work_end           time
session_duration   integer
format             text
info_contacts      jsonb
info_additional    text
```

### Индексы:

```sql
-- Быстрый поиск записей по телефону
CREATE INDEX bookings_phone_idx ON bookings (client_phone);

-- Поиск активных записей
CREATE INDEX bookings_phone_status_idx ON bookings (client_phone, status);

-- Уникальность слота (исключая отмененные)
CREATE UNIQUE INDEX bookings_unique_slot_idx 
  ON bookings (booking_date, booking_time) 
  WHERE status <> 'cancelled';
```

### Миграции:

Все миграции в файле `supabase/schema.sql`

---

## 🚢 Деплой

### Vercel (рекомендуется):

1. **Push код на GitHub**

2. **Импортируйте проект на Vercel:**
   - Зайдите на [vercel.com](https://vercel.com/)
   - Нажмите "Import Project"
   - Выберите ваш репозиторий

3. **Настройте Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=...
TELEGRAM_BOT_TOKEN=...
```

4. **Deploy:**
   - Vercel автоматически соберет и задеплоит
   - Каждый push создает preview deployment
   - Мерж в main деплоится в production

### Другие платформы:

**Netlify:**
```bash
npm run build
# Deploy .next/ folder
```

**Docker:**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY booking-system .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🔐 Безопасность

### Реализовано:

- ✅ **Хеширование паролей** (bcrypt)
- ✅ **JWT сессии** (NextAuth)
- ✅ **HTTPS only** в production
- ✅ **Row Level Security** в Supabase
- ✅ **Rate limiting** на API routes
- ✅ **Input validation** на всех endpoints
- ✅ **CORS настройки**
- ✅ **XSS защита** (React автоматически)

### Рекомендации:

- Используйте сложный `NEXTAUTH_SECRET`
- Включите 2FA для админ аккаунта
- Регулярно обновляйте зависимости
- Настройте HTTPS (Vercel делает автоматически)
- Ограничьте права Supabase ключей

---

## 📊 Мониторинг

### Логирование:

```typescript
// В API routes:
console.log('[API] Booking created:', booking.id)
console.error('[API] Error:', error)
```

### Метрики (для добавления):

- Количество записей в день
- Конверсия формы бронирования
- Время ответа API
- Ошибки валидации

### Рекомендуемые инструменты:

- **Vercel Analytics** - встроенная аналитика
- **Sentry** - отслеживание ошибок
- **LogRocket** - записи сессий пользователей
- **Google Analytics** - веб-аналитика

---

## 🧪 Тестирование

### Ручное тестирование:

**Сценарии для проверки:**

1. ✅ Регистрация нового клиента
2. ✅ Запись на консультацию (все шаги)
3. ✅ Оплата записи
4. ✅ Отмена записи (за 24ч)
5. ✅ Админ: создание/редактирование записи
6. ✅ Админ: блокировка слотов
7. ✅ Telegram уведомления

### Автоматическое (для добавления):

```bash
# Unit тесты
npm install -D vitest @testing-library/react
npm run test

# E2E тесты
npm install -D playwright
npm run test:e2e
```

---

## 📝 Лицензия

Проприетарное ПО. Все права защищены.

---

## 👥 Контакты

- **Разработчик:** [Ваше имя]
- **Email:** your-email@example.com
- **Telegram:** @your_username

---

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) - React фреймворк
- [Supabase](https://supabase.com/) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com/) - CSS фреймворк
- [React Query](https://tanstack.com/query) - Data fetching
- [Lucide Icons](https://lucide.dev/) - Иконки
- [date-fns](https://date-fns.org/) - Работа с датами

---

**Сделано с ❤️ для арт-терапевтов**
