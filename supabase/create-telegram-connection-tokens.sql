-- Таблица для временных токенов подключения Telegram
CREATE TABLE IF NOT EXISTS telegram_connection_tokens (
  id BIGSERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS telegram_tokens_token_idx 
ON telegram_connection_tokens(token) 
WHERE NOT used;

CREATE INDEX IF NOT EXISTS telegram_tokens_expires_idx 
ON telegram_connection_tokens(expires_at);

-- Очистка устаревших токенов (можно запускать периодически)
-- DELETE FROM telegram_connection_tokens WHERE expires_at < NOW() - INTERVAL '1 day';
