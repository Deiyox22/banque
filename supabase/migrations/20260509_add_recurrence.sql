-- supabase/migrations/20260509_add_recurrence.sql

-- Mise à jour de la table transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS recurrence_type text CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_end_date date,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;

-- Mise à jour de la table child_transactions
ALTER TABLE child_transactions 
ADD COLUMN IF NOT EXISTS recurrence_type text CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_end_date date,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;
