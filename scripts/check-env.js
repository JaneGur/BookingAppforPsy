#!/usr/bin/env node

/**
 * Проверка переменных окружения
 * 
 * Использование:
 *   node scripts/check-env.js
 */

const fs = require('fs')
const path = require('path')

// Читаем .env.local вручную
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    }
  })
} else {
  console.log('⚠️  Файл .env.local не найден!\n')
}

const requiredEnvVars = {
  'NEXT_PUBLIC_SUPABASE_URL': {
    required: true,
    description: 'URL вашего Supabase проекта',
    example: 'https://ваш-проект.supabase.co',
    public: true,
  },
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
    required: true,
    description: 'Публичный anon ключ Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    public: true,
  },
  'SUPABASE_SERVICE_ROLE_KEY': {
    required: true,
    description: 'Service Role ключ Supabase (СЕКРЕТНЫЙ)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    public: false,
  },
  'NEXTAUTH_URL': {
    required: true,
    description: 'URL приложения',
    example: 'http://localhost:3000',
    public: false,
  },
  'NEXTAUTH_SECRET': {
    required: true,
    description: 'Секретный ключ для NextAuth (минимум 32 символа)',
    example: 'сгенерируйте с помощью: node scripts/generate-secret.js',
    public: false,
  },
  'TELEGRAM_BOT_TOKEN': {
    required: false,
    description: 'Токен Telegram бота (опционально)',
    example: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
    public: false,
  },
  'TELEGRAM_ADMIN_CHAT_ID': {
    required: false,
    description: 'Chat ID администратора (опционально)',
    example: '123456789',
    public: false,
  },
}

console.log('\n🔍 Проверка переменных окружения...\n')
console.log('=' .repeat(80))

let hasErrors = false
let hasWarnings = false

for (const [key, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[key]
  const status = value ? '✅' : (config.required ? '❌' : '⚠️')
  
  console.log(`\n${status} ${key}`)
  console.log(`   Описание: ${config.description}`)
  
  if (!value) {
    if (config.required) {
      console.log(`   ❌ ОШИБКА: Переменная не установлена!`)
      console.log(`   💡 Пример: ${config.example}`)
      hasErrors = true
    } else {
      console.log(`   ⚠️  ПРЕДУПРЕЖДЕНИЕ: Переменная не установлена (опционально)`)
      console.log(`   💡 Пример: ${config.example}`)
      hasWarnings = true
    }
  } else {
    // Проверяем длину для секретных ключей
    if (key === 'NEXTAUTH_SECRET' && value.length < 32) {
      console.log(`   ⚠️  ПРЕДУПРЕЖДЕНИЕ: Секрет слишком короткий (${value.length} символов, рекомендуется 32+)`)
      hasWarnings = true
    } else {
      // Показываем первые символы (безопасно)
      const preview = config.public 
        ? value 
        : value.substring(0, 20) + '...'
      console.log(`   ✅ Установлена: ${preview}`)
    }
  }
}

console.log('\n' + '='.repeat(80))

if (hasErrors) {
  console.log('\n❌ ОШИБКИ: Обнаружены отсутствующие обязательные переменные!')
  console.log('\n📝 Что делать:')
  console.log('   1. Создайте файл .env.local в корне проекта')
  console.log('   2. Добавьте все обязательные переменные')
  console.log('   3. Получите ключи из Supabase Dashboard → Settings → API')
  console.log('   4. Сгенерируйте NEXTAUTH_SECRET: node scripts/generate-secret.js')
  console.log('   5. Перезапустите сервер: npm run dev')
  console.log('\n📖 Подробная инструкция: ENV_SETUP.md\n')
  process.exit(1)
} else if (hasWarnings) {
  console.log('\n⚠️  ПРЕДУПРЕЖДЕНИЯ: Некоторые опциональные переменные не установлены')
  console.log('   Приложение будет работать, но некоторые функции могут быть недоступны.\n')
  process.exit(0)
} else {
  console.log('\n✅ ВСЁ В ПОРЯДКЕ: Все переменные окружения настроены правильно!')
  console.log('   Можете запускать приложение: npm run dev\n')
  process.exit(0)
}
