// lib/api/dashboard.ts
import { createClient } from '@/lib/supabase/client';

export async function fetchDashboardData(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user.id);

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', user.id);

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const transactions = rawTransactions?.filter(tx => {
    if (!tx.is_recurring) {
      const txDate = new Date(tx.date);
      return txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    }
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
    return startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
  }) || [];

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  const totalSavings = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

  return { transactions, totalIncome, totalExpense, balance, totalSavings };
}
