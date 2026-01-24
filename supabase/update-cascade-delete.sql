-- Изменяем поведение внешнего ключа client_id в таблице bookings
-- С ON DELETE SET NULL на ON DELETE CASCADE
-- Теперь при удалении клиента будут удаляться и все его записи

-- Шаг 1: Удаляем старый constraint
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;

-- Шаг 2: Добавляем новый constraint с CASCADE
ALTER TABLE bookings 
ADD CONSTRAINT bookings_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;

-- Проверка: теперь при удалении клиента будут удалены и все его записи
-- Например: DELETE FROM clients WHERE id = 'some-uuid';
-- Результат: все записи этого клиента в bookings тоже удалятся

-- Дополнительно: аналогично для таблицы password_reset_tokens
ALTER TABLE password_reset_tokens 
DROP CONSTRAINT IF EXISTS password_reset_tokens_client_id_fkey;

ALTER TABLE password_reset_tokens 
ADD CONSTRAINT password_reset_tokens_client_id_fkey 
FOREIGN KEY (client_id) 
REFERENCES clients(id) 
ON DELETE CASCADE;
