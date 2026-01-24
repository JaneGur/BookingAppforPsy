#!/usr/bin/env node

/**
 * Генератор секретного ключа для NEXTAUTH_SECRET
 * 
 * Использование:
 *   node scripts/generate-secret.js
 */

const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('base64')

console.log('\n🔐 Сгенерирован секретный ключ для NEXTAUTH_SECRET:\n')
console.log(secret)
console.log('\n📋 Скопируйте и добавьте в .env.local:\n')
console.log(`NEXTAUTH_SECRET=${secret}`)
console.log('\n✅ Готово!\n')
