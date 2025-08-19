-- Fix the users table foreign key constraint issue
-- This script removes the problematic self-referencing foreign key

-- Drop the problematic foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- The users table should not have a self-referencing foreign key
-- The id column is already a primary key, which is sufficient

-- Verify the table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;
