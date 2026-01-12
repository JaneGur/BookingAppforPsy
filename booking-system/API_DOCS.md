# 📡 API Documentation

Полная документация всех API endpoints системы бронирования.

---

## 🔐 Аутентификация

Приложение использует **NextAuth.js** с JWT токенами в HTTP-only cookies.

### Авторизация

**POST** `/api/auth/[...nextauth]`

Используется автоматически через `signIn()` из `next-auth/react`.

```typescript
import { signIn } from 'next-auth/react'

await signIn('credentials', {
  identifier: '+79991234567',  // Телефон или email
  password: 'password123',
  redirect: false,
})
```

**Response (success):**
```json
{
  "url": "/dashboard",
  "ok": true,
  "status": 200
}
```

**Response (error):**
```json
{
  "error": "CredentialsSignin",
  "ok": false
}
```

### Регистрация

**POST** `/api/auth/register`

Создание нового пользователя.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "email": "ivan@example.com",      // Опционально
  "password": "securePassword123",
  "telegram": "@ivan"                // Опционально
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "Регистрация успешна"
}
```

**Response (error):**
```json
{
  "error": "Пользователь с таким телефоном уже существует"
}
```

**Статус коды:**
- `201` - Успешная регистрация
- `400` - Некорректные данные
- `409` - Пользователь уже существует
- `500` - Ошибка сервера

### Смена пароля

**POST** `/api/auth/change-password`

Требует авторизации.

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

---

## 📅 Бронирования (Bookings)

### Получить записи клиента

**GET** `/api/bookings?phone={phone}`

Требует авторизации. Клиент видит только свои записи, админ - все.

**Query Parameters:**
- `phone` (required) - Телефон клиента

**Response:**
```json
[
  {
    "id": 1,
    "client_id": "uuid",
    "client_name": "Иван Иванов",
    "client_phone": "+79991234567",
    "client_email": "ivan@example.com",
    "client_telegram": "@ivan",
    "booking_date": "2024-01-15",
    "booking_time": "10:00",
    "notes": "Первая консультация",
    "status": "confirmed",
    "product_id": 1,
    "amount": 5000,
    "paid_at": "2024-01-14T12:00:00Z",
    "created_at": "2024-01-14T10:30:00Z"
  }
]
```

**Статусы записи:**
- `pending_payment` - Ожидает оплаты
- `confirmed` - Подтверждена и оплачена
- `completed` - Завершена
- `cancelled` - Отменена

### Создать запись

**POST** `/api/bookings`

Требует авторизации.

**Request Body:**
```json
{
  "booking_date": "2024-01-15",
  "booking_time": "10:00",
  "client_name": "Иван Иванов",
  "client_phone": "+79991234567",
  "client_email": "ivan@example.com",     // Опционально
  "client_telegram": "@ivan",             // Опционально
  "notes": "Первая консультация",         // Опционально
  "product_id": 1,
  "status": "pending_payment"
}
```

**Response:**
```json
{
  "id": 1,
  "booking_date": "2024-01-15",
  "booking_time": "10:00",
  "status": "pending_payment",
  "amount": 5000,
  "created_at": "2024-01-14T10:30:00Z",
  ...
}
```

**Validation:**
- Дата не может быть в прошлом
- Слот должен быть доступен
- Продукт должен существовать и быть активным
- Телефон должен быть валидным

### Получить одну запись

**GET** `/api/bookings/[id]`

Требует авторизации. Клиент видит только свои записи.

**Response:**
```json
{
  "id": 1,
  "client_name": "Иван Иванов",
  "booking_date": "2024-01-15",
  "booking_time": "10:00",
  "status": "confirmed",
  ...
}
```

### Обновить запись

**PATCH** `/api/bookings/[id]`

Требует авторизации. Клиенты могут только отменять, админы - редактировать.

**Request Body:**
```json
{
  "status": "cancelled",           // Для отмены
  // или
  "booking_date": "2024-01-16",    // Для переноса (только админ)
  "booking_time": "14:00"
}
```

**Ограничения:**
- Отменить можно не позднее чем за 24 часа
- Перенести может только администратор

### Получить предстоящую запись

**GET** `/api/bookings/upcoming?phone={phone}`

Возвращает ближайшую подтвержденную запись.

**Response:**
```json
{
  "id": 1,
  "booking_date": "2024-01-15",
  "booking_time": "10:00",
  "status": "confirmed",
  ...
}
```

Или `null` если нет предстоящих записей.

### Получить запись ожидающую оплаты

**GET** `/api/bookings/pending?phone={phone}`

**Response:**
```json
{
  "id": 2,
  "booking_date": "2024-01-20",
  "booking_time": "15:00",
  "status": "pending_payment",
  "amount": 5000,
  ...
}
```

Или `null` если нет неоплаченных записей.

---

## 🕐 Доступные слоты

### Получить свободные слоты

**GET** `/api/slots/available?date={date}`

Публичный endpoint (не требует авторизации).

**Query Parameters:**
- `date` (required) - Дата в формате `YYYY-MM-DD`

**Response:**
```json
["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
```

**Логика:**
- Берутся рабочие часы из `settings` (9:00 - 18:00)
- Длительность сессии из `settings` (60 минут)
- Вычитаются занятые слоты из `bookings`
- Вычитаются заблокированные слоты из `blocked_slots`
- Возвращаются только слоты в будущем

**Пример расчета:**
```
Рабочие часы: 09:00 - 18:00
Длительность: 60 мин
Слоты: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00

Занято:
- 12:00 (запись клиента)
- 13:00 (заблокирован админом)

Доступно: 09:00, 10:00, 11:00, 14:00, 15:00, 16:00, 17:00
```

---

## 🚫 Заблокированные дни

### Получить заблокированные дни

**GET** `/api/blocked-days?month={month}`

Публичный endpoint.

**Query Parameters:**
- `month` (required) - Месяц в формате `YYYY-MM`

**Response:**
```json
["2024-01-05", "2024-01-06", "2024-01-20"]
```

Возвращает даты, когда:
- Все слоты заблокированы в `blocked_slots`
- Или это выходные (если настроено)

---

## 📦 Продукты

### Получить все продукты

**GET** `/api/products`

Публичный endpoint.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Одна консультация",
    "sku": "SINGLE",
    "description": "Разовая сессия 60 минут",
    "price_rub": 5000,
    "is_active": true,
    "is_package": false,
    "sessions_count": 1,
    "is_featured": true,
    "sort_order": 1,
    "created_at": "2024-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "name": "Пакет 5 консультаций",
    "sku": "PACK_5",
    "description": "5 сессий со скидкой",
    "price_rub": 22000,
    "is_active": true,
    "is_package": true,
    "sessions_count": 5,
    "is_featured": false,
    "sort_order": 2
  }
]
```

Возвращаются только активные продукты (`is_active: true`).

### Получить избранный продукт

**GET** `/api/products/featured`

Возвращает первый продукт с `is_featured: true`.

**Response:**
```json
{
  "id": 1,
  "name": "Одна консультация",
  "price_rub": 5000,
  "is_featured": true,
  ...
}
```

### Получить один продукт

**GET** `/api/products/[id]`

**Response:**
```json
{
  "id": 1,
  "name": "Одна консультация",
  "price_rub": 5000,
  ...
}
```

---

## 👤 Профиль

### Получить профиль

**GET** `/api/profile`

Требует авторизации.

**Response:**
```json
{
  "id": "uuid",
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "email": "ivan@example.com",
  "telegram": "@ivan",
  "telegram_chat_id": "123456789",
  "role": "client",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Обновить профиль

**PUT** `/api/profile`

Требует авторизации.

**Request Body:**
```json
{
  "name": "Иван Петрович Иванов",
  "email": "newemail@example.com",
  "telegram": "@new_ivan"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Профиль обновлен"
}
```

**Примечание:** Телефон изменить нельзя (это ID пользователя).

---

## 📄 Документы

### Получить документы

**GET** `/api/documents?doc_type={type}`

Публичный endpoint.

**Query Parameters:**
- `doc_type` (required) - Тип документа: `offer` или `policy`

**Response:**
```json
[
  {
    "id": 1,
    "doc_type": "offer",
    "title": "Договор оферты",
    "url": "https://storage.supabase.co/.../offer.pdf",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

Возвращается только активный документ (`is_active: true`).

---

## 🔧 Настройки

### Получить настройки

**GET** `/api/settings`

Публичный endpoint.

**Response:**
```json
{
  "id": 1,
  "work_start": "09:00",
  "work_end": "18:00",
  "session_duration": 60,
  "format": "Онлайн",
  "info_contacts": {
    "telegram": "@therapist",
    "phone": "+79991234567",
    "email": "info@example.com"
  },
  "info_additional": "Дополнительная информация"
}
```

---

## 👨‍💼 Админ API

Все endpoints требуют `role: 'admin'`.

### Записи

**GET** `/api/admin/bookings?status={status}&date={date}`

Получить все записи с фильтрами.

**Query Parameters:**
- `status` (optional) - Фильтр по статусу
- `date` (optional) - Фильтр по дате

**Response:**
```json
[
  {
    "id": 1,
    "client_name": "Иван Иванов",
    "client_phone": "+79991234567",
    "booking_date": "2024-01-15",
    "booking_time": "10:00",
    "status": "confirmed",
    "product": {
      "id": 1,
      "name": "Одна консультация",
      "price_rub": 5000
    },
    ...
  }
]
```

**POST** `/api/admin/bookings`

Создать запись от имени клиента.

### Клиенты

**GET** `/api/admin/clients`

Получить всех клиентов.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Иван Иванов",
    "phone": "+79991234567",
    "email": "ivan@example.com",
    "role": "client",
    "created_at": "2024-01-01T00:00:00Z",
    "total_bookings": 5,
    "completed_bookings": 3
  }
]
```

**GET** `/api/admin/clients/[id]`

Получить одного клиента с историей записей.

**Response:**
```json
{
  "id": "uuid",
  "name": "Иван Иванов",
  "phone": "+79991234567",
  "bookings": [
    {
      "id": 1,
      "booking_date": "2024-01-15",
      "status": "completed",
      ...
    }
  ]
}
```

### Продукты

**GET** `/api/admin/products`

Получить все продукты (включая неактивные).

**POST** `/api/admin/products`

Создать продукт.

**Request Body:**
```json
{
  "name": "Новый тариф",
  "sku": "NEW",
  "description": "Описание",
  "price_rub": 5000,
  "is_active": true,
  "is_package": false,
  "sessions_count": 1,
  "is_featured": false,
  "sort_order": 10
}
```

**PUT** `/api/admin/products`

Обновить продукт.

**DELETE** `/api/admin/products`

Деактивировать продукт (не удаляет из БД).

### Блокировка слотов

**GET** `/api/admin/blocked-slots?date={date}`

Получить заблокированные слоты.

**POST** `/api/admin/blocked-slots`

Заблокировать слот.

**Request Body:**
```json
{
  "slot_date": "2024-01-15",
  "slot_time": "10:00",
  "reason": "Личные дела"  // Опционально
}
```

**DELETE** `/api/admin/blocked-slots/[id]`

Разблокировать слот.

### Аналитика

**GET** `/api/admin/analytics`

Общая статистика.

**Response:**
```json
{
  "total_bookings": 150,
  "pending_bookings": 5,
  "confirmed_bookings": 10,
  "completed_bookings": 130,
  "cancelled_bookings": 5,
  "total_revenue": 750000,
  "avg_booking_value": 5000,
  "unique_clients": 75
}
```

**GET** `/api/admin/analytics/overview`

Детальная аналитика за период.

**Query Parameters:**
- `start_date` (optional) - Начало периода
- `end_date` (optional) - Конец периода

**Response:**
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "bookings_by_day": [
    {
      "date": "2024-01-15",
      "count": 5,
      "revenue": 25000
    }
  ],
  "bookings_by_status": {
    "confirmed": 20,
    "completed": 10,
    "pending_payment": 2,
    "cancelled": 1
  },
  "top_products": [
    {
      "product_id": 1,
      "name": "Одна консультация",
      "count": 15,
      "revenue": 75000
    }
  ],
  "new_clients": 10,
  "returning_clients": 5
}
```

### Настройки

**PUT** `/api/admin/settings`

Обновить настройки системы.

**Request Body:**
```json
{
  "work_start": "09:00",
  "work_end": "18:00",
  "session_duration": 60,
  "format": "Онлайн"
}
```

**POST** `/api/admin/settings/password`

Сменить пароль от имени другого пользователя.

### Документы

**POST** `/api/admin/documents`

Добавить документ.

**Request Body:**
```json
{
  "doc_type": "offer",
  "title": "Договор оферты",
  "url": "https://storage.supabase.co/.../offer.pdf"
}
```

---

## 🤖 Telegram

### Отправить уведомление

**POST** `/api/telegram/send-notification`

Внутренний endpoint для отправки уведомлений.

**Request Body:**
```json
{
  "chat_id": "123456789",
  "message": "Напоминание: У вас запись завтра в 10:00"
}
```

**Response:**
```json
{
  "success": true,
  "message_id": 12345
}
```

---

## ⚠️ Коды ошибок

| Код | Значение | Когда возвращается |
|-----|----------|-------------------|
| 200 | OK | Успешный запрос |
| 201 | Created | Ресурс создан |
| 400 | Bad Request | Некорректные данные |
| 401 | Unauthorized | Требуется авторизация |
| 403 | Forbidden | Нет прав доступа |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт (слот занят, email занят) |
| 422 | Unprocessable Entity | Валидация не прошла |
| 500 | Internal Server Error | Ошибка сервера |

### Формат ошибок

```json
{
  "error": "Описание ошибки на русском",
  "details": {
    "field": "booking_date",
    "message": "Дата не может быть в прошлом"
  }
}
```

---

## 🔄 Rate Limiting

API endpoints имеют ограничения:

- **Публичные endpoints**: 100 запросов / минута
- **Аутентифицированные**: 200 запросов / минута
- **Админ endpoints**: 500 запросов / минута

При превышении лимита:
```json
{
  "error": "Too Many Requests",
  "retry_after": 60
}
```

Status: `429 Too Many Requests`

---

## 📝 Примеры использования

### TypeScript/React

```typescript
// Получить записи
async function getBookings(phone: string) {
  const res = await fetch(`/api/bookings?phone=${phone}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Создать запись
async function createBooking(data: BookingData) {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error)
  }
  return res.json()
}

// С React Query
import { useQuery } from '@tanstack/react-query'

function useBookings(phone: string) {
  return useQuery({
    queryKey: ['bookings', phone],
    queryFn: () => getBookings(phone),
  })
}
```

### curl

```bash
# Получить доступные слоты
curl "http://localhost:3000/api/slots/available?date=2024-01-15"

# Создать запись (требуется cookie с сессией)
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "booking_date": "2024-01-15",
    "booking_time": "10:00",
    "client_name": "Иван Иванов",
    "client_phone": "+79991234567",
    "product_id": 1,
    "status": "pending_payment"
  }'
```

---

## 🔗 Связанные документы

- [README.md](README.md) - Общая документация
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Руководство по миграции
- [Supabase Schema](supabase/schema.sql) - Схема базы данных

---

**Документация актуальна на:** Январь 2024

**API Version:** 1.0
