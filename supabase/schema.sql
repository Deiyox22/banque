-- supabase/schema.sql

-- 1. TABLES

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_color text DEFAULT '#6366f1',
  created_at timestamptz DEFAULT now()
);

-- Comptes enfants
CREATE TABLE child_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_color text DEFAULT '#22d3ee',
  monthly_limit numeric(10,2),
  balance numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Viewers invités sur un compte enfant
CREATE TABLE child_account_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_account_id uuid NOT NULL REFERENCES child_accounts(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  viewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text CHECK (status IN ('pending', 'accepted')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(child_account_id, invited_email)
);

-- Transactions des comptes enfants
CREATE TABLE child_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_account_id uuid NOT NULL REFERENCES child_accounts(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  label text NOT NULL,
  category text,
  note text,
  date date NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Transactions personnelles
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  type text CHECK (type IN ('income', 'expense')) NOT NULL,
  label text NOT NULL,
  category text,
  note text,
  date date NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Objectifs d'épargne
CREATE TABLE savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) DEFAULT 0,
  deadline date,
  icon text,
  color text,
  created_at timestamptz DEFAULT now()
);

-- Catégories masquées
CREATE TABLE hidden_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  UNIQUE(user_id, name)
);

ALTER TABLE hidden_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hidden categories" ON hidden_categories
  FOR ALL USING (user_id = auth.uid());

-- 2. ROW LEVEL SECURITY (RLS)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_account_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Child Accounts Policies
CREATE POLICY "Users can view child accounts they created or are viewers of" ON child_accounts
  FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT child_account_id FROM child_account_viewers 
      WHERE viewer_id = auth.uid() AND status = 'accepted'
    )
  );
CREATE POLICY "Owners can manage their child accounts" ON child_accounts
  FOR ALL USING (created_by = auth.uid());

-- Child Account Viewers Policies
CREATE POLICY "Users can view invitations they sent or received" ON child_account_viewers
  FOR SELECT USING (
    child_account_id IN (SELECT id FROM child_accounts WHERE created_by = auth.uid()) OR 
    viewer_id = auth.uid() OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
CREATE POLICY "Owners can manage viewers" ON child_account_viewers
  FOR INSERT WITH CHECK (
    child_account_id IN (SELECT id FROM child_accounts WHERE created_by = auth.uid())
  );
CREATE POLICY "Owners can delete viewers" ON child_account_viewers
  FOR DELETE USING (
    child_account_id IN (SELECT id FROM child_accounts WHERE created_by = auth.uid())
  );
CREATE POLICY "Viewers can accept invitations" ON child_account_viewers
  FOR UPDATE USING (
    viewer_id = auth.uid() OR 
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Child Transactions Policies
CREATE POLICY "Viewers can see child transactions" ON child_transactions
  FOR SELECT USING (
    child_account_id IN (
      SELECT id FROM child_accounts WHERE created_by = auth.uid() OR 
      id IN (SELECT child_account_id FROM child_account_viewers WHERE viewer_id = auth.uid() AND status = 'accepted')
    )
  );
CREATE POLICY "Owners can manage child transactions" ON child_transactions
  FOR ALL USING (
    child_account_id IN (SELECT id FROM child_accounts WHERE created_by = auth.uid())
  );

-- Personal Transactions Policies
CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (owner_id = auth.uid());

-- Savings Goals Policies
CREATE POLICY "Users can manage their own savings goals" ON savings_goals
  FOR ALL USING (owner_id = auth.uid());

-- 3. FUNCTIONS & TRIGGERS

-- Function to update child account balance
CREATE OR REPLACE FUNCTION update_child_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE child_accounts
    SET balance = CASE 
      WHEN NEW.type = 'income' THEN balance + NEW.amount
      WHEN NEW.type = 'expense' THEN balance - NEW.amount
      ELSE balance
    END
    WHERE id = NEW.child_account_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE child_accounts
    SET balance = CASE 
      WHEN OLD.type = 'income' THEN balance - OLD.amount
      WHEN OLD.type = 'expense' THEN balance + OLD.amount
      ELSE balance
    END
    WHERE id = OLD.child_account_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- First, revert old transaction
    UPDATE child_accounts
    SET balance = CASE 
      WHEN OLD.type = 'income' THEN balance - OLD.amount
      WHEN OLD.type = 'expense' THEN balance + OLD.amount
      ELSE balance
    END
    WHERE id = OLD.child_account_id;
    -- Then, apply new transaction
    UPDATE child_accounts
    SET balance = CASE 
      WHEN NEW.type = 'income' THEN balance + NEW.amount
      WHEN NEW.type = 'expense' THEN balance - NEW.amount
      ELSE balance
    END
    WHERE id = NEW.child_account_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for child_transactions
CREATE TRIGGER tr_update_child_balance
AFTER INSERT OR UPDATE OR DELETE ON child_transactions
FOR EACH ROW EXECUTE FUNCTION update_child_account_balance();
