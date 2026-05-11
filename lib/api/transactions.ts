// lib/api/transactions.ts
import { createClient } from '@/lib/supabase/client';

export async function fetchTransactions(month: number, year: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user.id);

  if (error) throw error;

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  return data.filter(tx => {
    if (!tx.is_recurring) {
      const txDate = new Date(tx.date);
      return txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    }
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
    return startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
  });
}
