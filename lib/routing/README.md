# 🛣️ Routing System

Централизованная система управления путями приложения.

## 📖 Использование

### Импорт

```typescript
import { Path } from '@/lib/routing'
```

### Примеры использования

#### Статические пути

```typescript
// В компонентах навигации
<Link href={Path.AdminDashboard}>Админ панель</Link>

// В редиректах
router.push(Path.ClientDashboard)

// В middleware
if (pathname === Path.Login) { /* ... */ }
```

#### Динамические пути (с параметрами)

```typescript
// Детальная страница клиента
const clientId = '123'
<Link href={Path.AdminClientDetail(clientId)}>Профиль клиента</Link>

// Страница оплаты
const bookingId = 456
router.push(Path.ClientPayment(bookingId))
```

#### API пути

```typescript
// Запросы к API
const response = await fetch(Path.Api.Bookings.List)

// С параметрами
const bookingId = 123
await fetch(Path.Api.Bookings.Detail(bookingId))
```

## 📁 Структура

```typescript
Path.Main                    // '/'
Path.Login                   // '/login'
Path.Register                // '/register'

// Клиентские маршруты
Path.ClientDashboard         // '/dashboard'
Path.ClientProfile           // '/profile'
Path.ClientPayment(id)       // '/payment/:id'

// Админские маршруты
Path.AdminDashboard          // '/admin/dashboard'
Path.AdminClients            // '/admin/clients'
Path.AdminClientDetail(id)   // '/admin/clients/:id'

// API маршруты
Path.Api.Bookings.List       // '/api/bookings'
Path.Api.Bookings.Detail(id) // '/api/bookings/:id'
```

## ✅ Преимущества

1. **Типобезопасность** - TypeScript подскажет доступные пути
2. **Единая точка правды** - все пути в одном месте
3. **Легкий рефакторинг** - изменение пути в одном месте
4. **Автодополнение** - IDE подсказывает доступные маршруты
5. **Меньше ошибок** - нет опечаток в строковых литералах

## 🔄 Миграция существующего кода

**Было:**
```typescript
<Link href="/admin/dashboard">Админ</Link>
router.push('/login')
fetch('/api/bookings')
```

**Стало:**
```typescript
import { Path } from '@/lib/routing'

<Link href={Path.AdminDashboard}>Админ</Link>
router.push(Path.Login)
fetch(Path.Api.Bookings.List)
```

## 📝 Добавление новых путей

1. Откройте `lib/routing/paths.ts`
2. Добавьте новый путь в соответствующую категорию:

```typescript
export const Path = {
  // ...
  NewFeature: '/new-feature',
  NewFeatureDetail: (id: string | number) => `/new-feature/${id}`,
  // ...
} as const
```

3. Используйте в коде: `Path.NewFeature`

## ⚠️ Важно

- **НЕ** используйте жестко закодированные пути в коде
- **ВСЕГДА** используйте `Path` константы
- При добавлении нового маршрута - добавьте его в `paths.ts`
